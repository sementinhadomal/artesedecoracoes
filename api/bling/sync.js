// Utiliza o fetch nativo do Node.js (Vercel Node 18+)

const BLING_API_KEY = process.env.BLING_API_KEY || '92dffb27273336f7e9a8c34b5e57eb01329c776c72d81a693c69c7de42e29c7f098c5e06';

module.exports = async (req, res) => {
    // Verificar autenticação (Token JWT no cookie)
    const token = req.cookies ? req.cookies.auth_token : null;
    if (!token) {
        console.warn("Tentativa de sincronização sem token de autenticação.");
        return res.status(401).json({ message: 'Sessão expirada. Por favor, faça login novamente.' });
    }

    try {
        console.log("Iniciando sincronização Bling...");
        if (!BLING_API_KEY || BLING_API_KEY.length < 10) {
            return res.status(500).json({ message: 'Chave API do Bling não configurada ou inválida.' });
        }

        const blingUrl = `https://bling.com.br/Api/v2/produtos/json/?apikey=${BLING_API_KEY}&imagem=S`;

        const response = await fetch(blingUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erro na resposta do Bling:", response.status, errorText);
            return res.status(response.status).json({ message: `Bling retornou erro ${response.status}: ${errorText}` });
        }

        const data = await response.json();

        // Verificar se houve erro na resposta do Bling
        if (data.retorno && data.retorno.erros) {
            const errorMsg = data.retorno.erros[0]?.erro?.msg || "Erro desconhecido no Bling";
            console.error("Erro da API do Bling:", errorMsg);
            return res.status(400).json({ message: `Erro no Bling: ${errorMsg}` });
        }

        if (data.retorno && data.retorno.produtos) {
            // Retorna os produtos formatados para o dashboard
            const formattedProducts = data.retorno.produtos.map(p => ({
                sku: p.produto.codigo,
                nome: p.produto.descricao,
                preco: parseFloat(p.produto.preco || 0),
                estoque: parseFloat(p.produto.estoqueAtual || 0),
                imagem: p.produto.urlImagem,
                categoria: p.produto.categoria?.descricao || 'Geral',
                lastUpdate: new Date().toISOString()
            }));

            console.log(`Sincronizados ${formattedProducts.length} produtos.`);
            return res.status(200).json({
                products: formattedProducts,
                syncDate: new Date().toISOString()
            });
        }

        console.warn("Nenhum produto encontrado no retorno do Bling.");
        return res.status(404).json({ message: 'Nenhum produto encontrado no seu catálogo do Bling.' });

    } catch (error) {
        console.error('Erro crítico na sincronização Bling:', error);
        return res.status(500).json({ message: 'Falha interna ao conectar com o Bling: ' + error.message });
    }
};

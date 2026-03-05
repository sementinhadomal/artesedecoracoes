/**
 * API para Listar Produtos Ativos do Banco de Dados (KV)
 */

module.exports = async (req, res) => {
    // Definimos as credenciais da Vercel KV (Redis)
    // Elas serão puxadas das Environment Variables no Dashboard da Vercel
    const KV_REST_API_URL = process.env.KV_REST_API_URL;
    const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

    if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
        return res.status(500).json({
            message: 'Configuração do Banco de Dados (Vercel KV) faltando.',
            products: [] // Fallback vazio para não quebrar o site
        });
    }

    try {
        // Buscar a chave 'published_products' do Redis via REST API
        const response = await fetch(`${KV_REST_API_URL}/get/published_products`, {
            headers: {
                Authorization: `Bearer ${KV_REST_API_TOKEN}`
            }
        });

        const data = await response.json();

        // No Upstash/Vercel KV, o resultado do GET vem na propriedade 'result'
        const products = data.result ? JSON.parse(data.result) : [];

        return res.status(200).json({ products });
    } catch (error) {
        console.error('Erro ao ler do KV:', error);
        return res.status(500).json({ message: 'Erro ao buscar produtos na nuvem', products: [] });
    }
};

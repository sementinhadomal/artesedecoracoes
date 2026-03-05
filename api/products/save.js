/**
 * API para Salvar Produtos Ativos no Banco de Dados (KV)
 * Requer Autenticação (JWT)
 */

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // 1. Verificar Autenticação (Apenas Admin pode salvar)
    const token = req.cookies.auth_token;
    if (!token) {
        return res.status(401).json({ message: 'Não autorizado' });
    }

    // Credenciais KV
    const KV_REST_API_URL = process.env.KV_REST_API_URL;
    const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

    if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
        return res.status(500).json({ message: 'Banco de Dados não configurado na Vercel.' });
    }

    try {
        const { products } = req.body;

        if (!Array.isArray(products)) {
            return res.status(400).json({ message: 'Dados inválidos.' });
        }

        // 2. Salvar no Redis (Vercel KV)
        // Usamos o comando SET com o JSON stringificado
        const response = await fetch(`${KV_REST_API_URL}/set/published_products`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${KV_REST_API_TOKEN}`
            },
            body: JSON.stringify(JSON.stringify(products)) // Stringify duas vezes pois o Redis armazena string
        });

        if (response.ok) {
            return res.status(200).json({ message: 'Sincronizado com a nuvem com sucesso!' });
        } else {
            throw new Error('Falha ao gravar no KV');
        }

    } catch (error) {
        console.error('Erro ao salvar no KV:', error);
        return res.status(500).json({ message: 'Erro ao persistir dados na nuvem.' });
    }
};

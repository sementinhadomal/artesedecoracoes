const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { serialize } = require('cookie');

// Configurações (Essas variáveis devem estar no ambiente da Vercel para segurança máxima)
const ADMIN_EMAIL = 'artesdecoracoes04@gmail.com';
// Hash bcrypt de 'naty47982040'
const PASSWORD_HASH = '$2a$10$7H3x9vKy9vKy9vKy9vKy9vKy9vKy9vKy9vKy9vKy9vKy9vKy9vKy'; // Placeholder, idealmente gerado dinamicamente
const JWT_SECRET = 'sua_chave_secreta_super_segura'; // Deve ser uma ENV variable

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email, password } = req.body;

    const submittedEmail = email ? email.trim().toLowerCase() : '';
    const submittedPass = password ? password.trim() : '';

    console.log(`Tentativa de login para: ${submittedEmail}`);

    if (submittedEmail === ADMIN_EMAIL.toLowerCase() && submittedPass === 'naty47982040') {
        console.log('Login bem-sucedido!');
        const token = jwt.sign(
            { email: ADMIN_EMAIL, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        const cookie = serialize('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 8, // 8 horas
            path: '/',
        });

        res.setHeader('Set-Cookie', cookie);
        return res.status(200).json({ message: 'Autenticado com sucesso' });
    }

    return res.status(401).json({ message: 'Credenciais inválidas' });
};

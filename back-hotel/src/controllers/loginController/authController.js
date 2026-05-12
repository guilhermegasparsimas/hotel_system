import { db } from '../../config/db.js'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ message: "Email e senha são obrigatórios." });
        }

        const [result] = await db.query(
            "SELECT id, nome, cpf, email, senha, tipo FROM usuario WHERE email = ? LIMIT 1", 
            [email]
        );

        if (result.length === 0) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        const usuario = result[0];

        const ok = await bcrypt.compare(senha, usuario.senha);
        if (!ok) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        const token = jwt.sign(
            { 
                sub: usuario.id,
                tipo: usuario.tipo 
            },
            process.env.JWT_SECRET || 'milionario_rico',
            { expiresIn: "8h" }
        );

        return res.json({
            message: "Login realizado com sucesso.",
            token,
            usuario: {
                sub: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo,
            }
        });

    } catch (error) {
        console.error("Erro no processo de Login:", error);
        res.status(500).json({ message: "Erro no servidor." });
    }
};

const logout = async (req, res) => {
    return res.status(200).json({ message: "Logout realizado com sucesso" });
};

export { login, logout };
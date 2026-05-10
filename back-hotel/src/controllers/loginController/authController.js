import { db } from '../../config/db.js'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ message: "Email e senha são obrigatórios." });
        }

        // 1. Busca otimizada: LIMIT 1 é excelente para performance
        const [result] = await db.query(
            "SELECT id, nome, cpf, email, senha, tipo FROM usuario WHERE email = ? LIMIT 1", 
            [email]
        );

        // 2. Segurança: Use mensagens genéricas para evitar enumeração de usuários
        if (result.length === 0) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        const user = result[0];

        // 3. Comparação de Hash
        const ok = await bcrypt.compare(senha, user.senha);
        if (!ok) {
            // Mensagem igual à de cima para segurança
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        // 4. Geração de Token (Ajustado para bater com seu middleware anterior)
        const token = jwt.sign(
            { 
                id: user.id, // Mudei de 'sub' para 'id' para facilitar no seu middleware
                tipo: user.tipo 
            },
            process.env.JWT_SECRET || 'chave_reserva_segura',
            { expiresIn: "8h" } // Hotéis costumam usar sessões mais longas (turno de trabalho)
        );

        // 5. Resposta limpa
        return res.json({
            message: "Login realizado com sucesso.",
            token,
            usuario: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                tipo: user.tipo,
            }
        });

    } catch (error) {
        // Log detalhado apenas no servidor
        console.error("Erro no processo de Login:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};

const logout = async (req, res) => {
    // No JWT, o logout é feito limpando o token no Frontend (localStorage.clear())
    // Mas é bom retornar sucesso para o usuário.
    return res.status(200).json({ message: "Logout realizado com sucesso" });
};

export { login, logout };
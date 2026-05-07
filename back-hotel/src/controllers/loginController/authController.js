import { db } from '../../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) return res.status(400).json({ message: "Email e senha são obrigatórios." })

        const [result] = await db.query(
            ` 
              SELECT id, nome, cpf, email, password_hash, tipo 
              FROM usuario 
              WHERE email = ? LIMIT 1
            `, [email]
            ,
        )
         if(result.length === 0){
            return res.status(401).json({message: "Credenciais inválidas."})
         };

         const user = result[0];

         const ok = await bcrypt.compare(senha, user.password_hash);
         if(!ok){
            return res.status(401).json({message: "Senha inválida!"})
         };

         const token = jwt.sign(
            {
                sub: user.id,
                tipo: user.tipo
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
         );

         return res.json({
            message: "Login realizado com sucesso.",
            token,
            usuario: {
                nome: user.nome,
                cpf: user.cpf,
                email: user.email,
                tipo: user.tipo,
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Erro ao realizar login.", error: error.message })
    }
};

const logout = async (req, res) => {
    try {
        return res.status(200).json({message: "Logout realizado com sucesso"})
    } catch (error) {
        return res.status(500).json({message: "Error", error: error.message})
    }
};
export { login, logout };
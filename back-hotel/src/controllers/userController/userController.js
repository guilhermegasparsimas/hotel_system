import bcrypt from 'bcrypt';
import { db } from '../../config/db.js';

const createUser = async (req, res) => {
    
    try {
        const { nome, cpf, email, senha, telefone, tipo } = req.body;
        if(nome.length < 5 || !nome){
            return res.status(400).json({message: 'Nome inválido. Mínimo de 5 caracteres.'});
        }
        if(!email || email.length < 5 || !email.includes('@')){
            return res.status(400).json({message: "E-mail inválido."});
        }

        const tiposValidos = ["RECEPCIONISTA", "GERENTE"];
        if(!tiposValidos.includes(tipo?.toUpperCase())){
            return res.status(400).json({message: "Tipo de usuário inválido. Use 'HOSPEDE' ou 'FUNCIONARIO'." })
        };

        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(senha, saltRounds);

        const [result] = await db.query( 
            "INSERT INTO usuario (nome, cpf, email, senha, telefone, tipo) VALUES (?, ?, ?, ?, ?, ?)", [nome, cpf, email,hashPassword, telefone, tipo.toUpperCase()]
        );

        if(result.affectedRows === 0) return res.status(400).json({message: "Não foi possível criar o usuário."});

        return res.status(201).json({message: "Usuário criado com sucesso."});
    } catch (error) {
        if(error.code === 'ER_DUP_ENTRY'){
            return res.status(400).json({message: "CPF ou E-mail já cadastrado."})
        };
        return res.status(500).json({message: "Erro ao criar usuário", error: error.message});
    }

};

const getUser = async (req, res) => {
    try {
        const [result] = await db.query("SELECT nome, cpf, email, telefone, tipo FROM usuario")

        if(result.length === 0) return res.status(500).json({message: "Nenhum usuário encontrado."});

        return res.status(200).json({message: "Usuários encontrados", data: result})
    } catch (error) {
        return res.status(500).json({message: "Erro ao buscar usuário", error: error.message})
    }
};

const editUser = async (req, res) => {
    try {
        const {id, nome, email, telefone} = req.body;
        if(!nome, !email, !telefone){
            return res.status(400).json({message: "Todos os campos são obrigatórios."});
        }

        const [result] = await db.query(
            `UPDATE usuario
                SET
                    nome = ?,
                    email = ?,
                    telefone = ? WHERE id = ?
            `, [nome, email, telefone, id]
        );
        if(result.affectedRows === 0){
            return res.status(404).json({message: "Usuário não encontrado."})
        }
        
        return res.status(200).json({message: "Usuário atualizado com sucesso!"})
    } catch (error) {
        return res.status(500).json({message: "Erro ao editar usuário."})
    }
};


export { createUser, getUser, editUser };

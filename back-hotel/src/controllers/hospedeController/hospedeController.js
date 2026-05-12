import { db } from "../../config/db.js";

const logActivity = async (idUsuario, acao, detalhes) => {
    try {
        await db.query(
            "INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)",
            [idUsuario, acao, detalhes]
        );
    } catch (erro) {
        console.error("Erro ao registrar log:", erro.message);
    }
};

const createHospede = async (req, res) => {
    try {
        const { nome, cpf, email, telefone, endereco } = req.body;
        const idFuncionario = req.user?.id || req.user?.sub;

        if (!nome || !cpf) {
            return res.status(400).json({ message: "Nome e CPF são obrigatórios." });
        }

        const [rows] = await db.query("SELECT id FROM hospedes WHERE cpf = ?", [cpf]);
        if (rows && rows.length > 0) {
            return res.status(400).json({ message: "Este CPF já está cadastrado no sistema." });
        }

        const [result] = await db.query(
            "INSERT INTO hospedes (nome, cpf, email, telefone, endereco) VALUES (?, ?, ?, ?, ?)",
            [nome, cpf, email || null, telefone || null, endereco || null]
        );

        if (idFuncionario) {
            await logActivity(idFuncionario, "CRIAR_HOSPEDE", `Hóspede ${nome} (CPF: ${cpf}) cadastrado.`);
        }

        return res.status(201).json({
            message: "Hóspede cadastrado com sucesso.",
            id: result.insertId
        });

    } catch (error) {
        console.error("Erro no servidor (createHospede):", error);
        return res.status(500).json({
            message: "Erro interno ao cadastrar hóspede.",
            detalhes: error.message
        });
    }
};

const getAllHospedes = async (req, res) => {
    try {
        const [lista] = await db.query("SELECT * FROM hospedes ORDER BY nome ASC");
        
        return res.status(200).json({
            total: lista.length,
            dados: lista
        });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao buscar listagem de hóspedes." });
    }
};

const updateHospede = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, telefone, endereco } = req.body;
        const idFuncionario = req.user?.id;

        const [hospede] = await db.query("SELECT nome FROM hospedes WHERE id = ?", [id]);
        if (hospede.length === 0) {
            return res.status(404).json({ message: "Hóspede não encontrado." });
        }

        await db.query(
            "UPDATE hospedes SET nome = ?, email = ?, telefone = ?, endereco = ? WHERE id = ?",
            [nome, email, telefone, endereco, id]
        );

        await logActivity(idFuncionario, "UPDATE_HOSPEDE", `Dados do hóspede ${nome} foram atualizados.`);

        return res.status(200).json({ message: "Dados atualizados com sucesso." });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao atualizar hóspede." });
    }
};

const deleteHospede = async (req, res) => {
    try {
        const { id } = req.params;
        const idFuncionario = req.user?.id;
        const tipoUsuario = req.user?.tipo;

        if (tipoUsuario !== 'GERENTE') {
            return res.status(403).json({ message: "Acesso negado. Apenas gerentes podem excluir hóspedes." });
        }

        const [hospede] = await db.query("SELECT nome FROM hospedes WHERE id = ?", [id]);
        if (hospede.length === 0) {
            return res.status(404).json({ message: "Hóspede não encontrado." });
        }

        const [reservas] = await db.query("SELECT id FROM reservas WHERE hospede_id = ? AND status = 'ATIVA'", [id]);
        if (reservas.length > 0) return res.status(400).json({ message: "Hóspede possui reservas ativas." });

        await db.query("DELETE FROM hospedes WHERE id = ?", [id]);
        await logActivity(idFuncionario, "DELETE_HOSPEDE", `Hóspede ${hospede[0].nome} removido do sistema.`);

        return res.status(200).json({ message: "Hóspede removido com sucesso." });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao deletar hóspede." });
    }
};

export { createHospede, getAllHospedes, updateHospede, deleteHospede };
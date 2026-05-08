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

const createRoom = async (req, res) => {
    try {
        const { room_number, tipo, preco, capacidade, descricao } = req.body;
        const idFuncionario = req.user?.id;

        if (!room_number || !tipo || !preco) {
            return res.status(400).json({ message: "Número, tipo e preço são obrigatórios." })
        };

        const [quartoExistente] = await db.query(
            "SELECT id FROM quartos WHERE room_number = ?",
            [room_number]
        );

        if (quartoExistente.length > 0) {
            return res.status(400).json({ message: "Este número de quarto já está cadastrado." })
        }
        if (descricao && descricao.length > 255) {
            return res.status(400).json({
                message: "A descrição é muito longa. O máximo permitido são 255 caracteres."
            });
        }
        const [result] = await db.query(
            "INSERT INTO quartos (room_number, tipo, preco, capacidade, descricao, status) VALUES (?, ?, ?, ?, ?, ?)", [room_number, tipo, preco, capacidade, descricao, 'DISPONIVEL']
        );
        if (result.affectedRows === 0) return res.status(400).json({ message: "Não foi possível criar o quarto." });

        await logActivity(idFuncionario, "CRIAR_QUARTO", `Quarto ${room_number} cadastrado.`)

        return res.status(201).json({ message: "Quarto cadastrado com sucesso." })
    } catch (error) {
        console.error("Erro detalhado no servidor:", error);
        return res.status(500).json({
            message: "Erro ao criar quarto.",
            detalhes: error.message
        })
    }
};

const getAllRooms = async (req, res) => {
    try {
        const [listaQuartos] = await db.query("SELECT * FROM quartos");

        const totalQuartos = listaQuartos.length;
        const quartosDisponiveis = listaQuartos.filter(q => q.status === 'DISPONIVEL').length;
        let alertaOverbooking = null;

        // Alerta automático se a disponibilidade for menor que 10%
        if (quartosDisponiveis <= totalQuartos * 0.1) {
            alertaOverbooking = "ALERTA CRÍTICO: Capacidade máxima atingida ou próxima do limite!";
        }

        return res.status(200).json({
            total: totalQuartos,
            disponiveis: quartosDisponiveis,
            alerta: alertaOverbooking,
            dados: listaQuartos
        });
    } catch (erro) {
        return res.status(500).json({ message: "Erro ao buscar listagem de quartos." });
    }
};

const updateRoomStatus = async (req, res) => {
    try {
        const { id, novoStatus } = req.body;
        const idFuncionario = req.user?.id;

        const statusValidos = ["DISPONIVEL", "OCUPADO", "MANUTENCAO"];
        if (!statusValidos.includes(novoStatus?.toUpperCase())) {
            return res.status(400).json({ message: "Status inválido fornecido." });
        }

        const [resultado] = await db.query(
            "UPDATE quartos SET status = ? WHERE id = ?",
            [novoStatus.toUpperCase(), id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ message: "Quarto não encontrado para atualização." });
        }

        await logActivity(idFuncionario, "ALTERAR_STATUS", `Status do quarto ID ${id} alterado para ${novoStatus}.`);

        return res.status(200).json({ message: "Status atualizado com sucesso." });
    } catch (erro) {
        return res.status(500).json({ message: "Erro ao atualizar status do quarto." })
    }
};

const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const idFuncionario = req.user?.id;

        // Impedir deletar quarto ocupado (Evitar erros no sistema)
        const [room] = await db.query("SELECT status FROM quartos WHERE id = ?", [id]);
        if (room.length > 0 && room[0].status === 'OCUPADO') {
            return res.status(400).json({ message: "Não é possível remover um quarto ocupado." });
        }

        await db.query("DELETE FROM quartos WHERE id = ?", [id]);
        await logActivity(idFuncionario, "DELETE_ROOM", `Quarto ID ${id} removido.`);

        return res.status(200).json({ message: "Quarto removido com sucesso." });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao deletar quarto." });
    }
};

export { createRoom, getAllRooms, updateRoomStatus, deleteRoom };
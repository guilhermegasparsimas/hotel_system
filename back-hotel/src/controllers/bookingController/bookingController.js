import { db } from "../../config/db.js";

const logActivity = async (idUsuario, acao, detalhes) => {
    try {
        await db.query(
            "INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)",
            [idUsuario, acao, detalhes]
        );
    } catch (erro) {
        console.error("Erro no log:", erro.message);
    }
};

const checkIn = async (req, res) => {
    try {
        const { quarto_id, hospede_id, valor_total } = req.body;
        const idFuncionario = req.user?.id;

        const [quarto] = await db.query("SELECT status, room_number FROM quartos WHERE id = ?", [quarto_id]);

        if (quarto.length === 0) return res.status(404).json({ message: "Quarto não encontrado." });
        
        if (quarto[0].status !== 'DISPONIVEL') {
            return res.status(400).json({ message: "Operação negada: O quarto não está disponível." });
        }

        await db.query(
            "INSERT INTO reservas (quarto_id, hospede_id, funcionario_id, data_entrada, status_reserva, valor_total, status_pagamento) VALUES (?, ?, ?, NOW(), 'CHECKIN', ?, 'PENDENTE')",
            [quarto_id, hospede_id, idFuncionario, valor_total || 0]
        );

        await db.query("UPDATE quartos SET status = 'OCUPADO' WHERE id = ?", [quarto_id]);

        await logActivity(idFuncionario, "CHECK_IN", `Hóspede ${hospede_id} entrou no quarto ${quarto[0].room_number}`);

        return res.status(201).json({ message: "Check-in realizado com sucesso!" });
    } catch (erro) {
        return res.status(500).json({ message: "Erro ao realizar check-in.", detalhes: erro.message });
    }
};

const checkOut = async (req, res) => {
    try {
        const { quarto_id } = req.body;
        const idFuncionario = req.user?.id;

        const [reserva] = await db.query(
            "SELECT id FROM reservas WHERE quarto_id = ? AND status_reserva = 'CHECKIN'",
            [quarto_id]
        );

        if (reserva.length === 0) {
            return res.status(404).json({ message: "Não há check-in ativo para este quarto." });
        }

        await db.query(
            "UPDATE reservas SET data_saida = NOW(), status_reserva = 'CHECKOUT' WHERE id = ?",
            [reserva[0].id]
        );

        await db.query("UPDATE quartos SET status = 'LIMPEZA' WHERE id = ?", [quarto_id]);

        await logActivity(idFuncionario, "CHECK_OUT", `Check-out realizado no quarto ID ${quarto_id}`);

        return res.status(200).json({ message: "Check-out realizado e quarto enviado para limpeza." });
    } catch (erro) {
        return res.status(500).json({ message: "Erro ao realizar check-out." });
    }
};

const concluirLimpeza = async (req, res) => {
    try {
        const { quarto_id } = req.body;
        const idFuncionario = req.user?.id;

        const [quarto] = await db.query("SELECT status, room_number FROM quartos WHERE id = ?", [quarto_id]);
        
        if (quarto.length === 0 || quarto[0].status !== 'LIMPEZA') {
            return res.status(400).json({ message: "Este quarto não está em processo de limpeza." });
        }

        await db.query("UPDATE quartos SET status = 'DISPONIVEL' WHERE id = ?", [quarto_id]);

        await logActivity(idFuncionario, "LIMPEZA_CONCLUIDA", `Quarto ${quarto[0].room_number} agora está disponível.`);

        return res.status(200).json({ message: "Limpeza concluída. Quarto liberado!" });
    } catch (erro) {
        return res.status(500).json({ message: "Erro ao atualizar status de limpeza." });
    }
};

export { checkIn, checkOut, concluirLimpeza };
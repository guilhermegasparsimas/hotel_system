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
        const { quarto_id, hospede_id } = req.body;
        const idFuncionario = req.user?.id;

        const [quarto] = await db.query("SELECT status, room_number FROM quartos WHERE id = ?", [quarto_id]);

        if (quarto.length === 0) return res.status(404).json({ message: "Quarto não encontrado." });
        
        if (quarto[0].status !== 'DISPONIVEL') {
            return res.status(400).json({ message: "Operação negada: O quarto já está ocupado ou em manutenção." });
        }

        await db.query(
            "INSERT INTO reservas (quarto_id, hospede_id, funcionario_id, data_entrada, status_reserva) VALUES (?, ?, ?, NOW(), 'ATIVA')",
            [quarto_id, hospede_id, idFuncionario]
        );

        await db.query("UPDATE quartos SET status = 'OCUPADO' WHERE id = ?", [quarto_id]);

        await logActivity(idFuncionario, "CHECK_IN", `Hospede ${hospede_id} entrou no quarto ${quarto[0].room_number}`);

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
            "SELECT id FROM reservas WHERE quarto_id = ? AND status_reserva = 'ATIVA'",
            [quarto_id]
        );

        if (reserva.length === 0) {
            return res.status(404).json({ message: "Não há reserva ativa para este quarto." });
        }

        await db.query(
            "UPDATE reservas SET data_saida = NOW(), status_reserva = 'FINALIZADA' WHERE id = ?",
            [reserva[0].id]
        );

        await db.query("UPDATE quartos SET status = 'LIMPEZA' WHERE id = ?", [quarto_id]);

        await logActivity(idFuncionario, "CHECK_OUT", `Check-out realizado no quarto ID ${quarto_id}`);

        return res.status(200).json({ message: "Check-out realizado e quarto em limpeza." });
    } catch (erro) {
        return res.status(500).json({ message: "Erro ao realizar check-out." });
    }
};

const concluirLimpeza = async (req, res) => {
    try {
        const { quarto_id } = req.body;
        const idFuncionario = req.user?.id;

        const [quarto] = await db.query("SELECT status FROM quartos WHERE id = ?", [quarto_id]);
        
        if (quarto.length === 0 || quarto[0].status !== 'LIMPEZA') {
            return res.status(400).json({ message: "Este quarto não está em processo de limpeza." });
        }

        await db.query("UPDATE quartos SET status = 'DISPONIVEL' WHERE id = ?", [quarto_id]);

        await logActivity(idFuncionario, "LIMPEZA_CONCLUIDA", `Quarto ID ${quarto_id} agora está disponível.`);

        return res.status(200).json({ message: "Limpeza concluída. Quarto liberado para novos hóspedes!" });
    } catch (erro) {
        return res.status(500).json({ message: "Erro ao atualizar status de limpeza." });
    }
};

export { checkIn, checkOut, concluirLimpeza };
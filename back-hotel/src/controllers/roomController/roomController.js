import { db } from "../../config/db.js";

const logActivity = async (idUsuario, acao, detalhes) => {
    try {
        await db.query(
            "INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)",
            [idUsuario || null, acao, detalhes]
        );
    } catch (erro) {
        console.error("Erro ao registrar log:", erro.message);
    }
};

const createRoom = async (req, res) => {
    try {
        const { room_number, tipo, preco, capacidade, descricao } = req.body;

        const idFuncionario = req.user?.id || req.user?.sub;

        if (!room_number || !tipo || !preco) {
            return res.status(400).json({ message: "Número, tipo e preço são obrigatórios." });
        }

        const [rows] = await db.query(
            "SELECT id FROM quartos WHERE room_number = ?",
            [room_number]
        );

        if (rows && rows.length > 0) {
            return res.status(400).json({ message: "Este número de quarto já está cadastrado." });
        }


        const [result] = await db.query(
            "INSERT INTO quartos (room_number, tipo, preco, capacidade, descricao, status) VALUES (?, ?, ?, ?, ?, ?)",
            [room_number, tipo, preco, capacidade || 1, descricao || null, 'DISPONIVEL']
        );

        if (idFuncionario) {
            try {
                await logActivity(
                    idFuncionario,
                    "CRIAR_QUARTO",
                    `Quarto ${room_number} cadastrado com sucesso.`
                );
            } catch (logError) {
                console.error("Erro ao gerar log, mas o quarto foi criado:", logError);
                // Não travamos a resposta se apenas o log falhar
            }
        }

        return res.status(201).json({
            message: "Quarto cadastrado com sucesso.",
            id: result.insertId
        });

    } catch (error) {
        console.error("Erro no servidor (createRoom):", error);
        return res.status(500).json({
            message: "Erro interno ao criar quarto.",
            detalhes: error.message
        });
    }
};
const getAllRooms = async (req, res) => {
    try {
        const [listaQuartos] = await db.query("SELECT * FROM quartos ORDER BY room_number ASC");

        const totalQuartos = listaQuartos.length;
        const quartosDisponiveis = listaQuartos.filter(q => q.status === 'DISPONIVEL').length;

        let alertaOverbooking = null;
        if (totalQuartos > 0 && quartosDisponiveis <= totalQuartos * 0.1) {
            alertaOverbooking = "Capacidade próxima do limite!";
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
        const { id } = req.params;
        const { status: novoStatus } = req.body;
        const idFuncionario = req.user?.id || req.user?.sub;

        const statusValidos = ["DISPONIVEL", "OCUPADO", "MANUTENCAO", "LIMPEZA"];
        if (!statusValidos.includes(novoStatus?.toUpperCase())) {
            return res.status(400).json({ message: "Status inválido." });
        }

        const [roomData] = await db.query("SELECT room_number FROM quartos WHERE id = ?", [id]);
        if (roomData.length === 0) {
            return res.status(404).json({ message: "Quarto não encontrado." });
        }

        const statusFormatado = novoStatus.toUpperCase();

        await db.query("UPDATE quartos SET status = ? WHERE id = ?", [statusFormatado, id]);

        await logActivity(idFuncionario, "ALTERAR_STATUS", `Quarto ${roomData[0].room_number} alterado para ${statusFormatado}.`);

        return res.status(200).json({ message: "Status atualizado com sucesso." });
    } catch (erro) {
        return res.status(500).json({ message: "Erro ao atualizar status do quarto." })
    }
};

const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const idFuncionario = req.user?.id;
        const tipoUsuario = req.user?.tipo;

        if (tipoUsuario !== 'GERENTE') {
            return res.status(403).json({ message: "Apenas gerentes podem deletar quartos." });
        }

        const [room] = await db.query("SELECT room_number, status FROM quartos WHERE id = ?", [id]);
        if (room.length === 0) {
            return res.status(404).json({ message: "Quarto não encontrado." });
        }

        if (room[0].status === 'OCUPADO') {
            return res.status(400).json({ message: "Não é possível remover um quarto ocupado." });
        }

        await db.query("DELETE FROM quartos WHERE id = ?", [id]);
        await logActivity(idFuncionario, "DELETE_ROOM", `Quarto ${room[0].room_number} removido do sistema.`);

        return res.status(200).json({ message: "Quarto removido com sucesso." });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao deletar quarto." });
    }
};

const getStats = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT status, COUNT(*) as total FROM quartos GROUP BY status"
        );

        const stats = {
            disponiveis: 0,
            ocupados: 0,
            limpeza: 0,
            manutencao: 0
        };

        rows.forEach(row => {
            const statusAtual = row.status?.toUpperCase().trim();

            if (statusAtual === "DISPONIVEL") stats.disponiveis = Number(row.total);
            if (statusAtual === "OCUPADO") stats.ocupados = Number(row.total);
            if (statusAtual === "LIMPEZA") stats.limpeza = Number(row.total);
            if (statusAtual === "MANUTENCAO") stats.manutencao = Number(row.total);
        });

        return res.status(200).json(stats);

    } catch (erro) {
        console.error("Erro crítico na rota /stats:", erro);
        return res.status(500).json({ message: "Erro ao buscar estatísticas dos quartos." });
    }
};

export { createRoom, getAllRooms, updateRoomStatus, deleteRoom, getStats };
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

const criarReserva = async (req, res) => {
    const connection = await db.getConnection(); 
    try {
        await connection.beginTransaction(); 

        const { quarto_id, hospede_id, data_checkin, checkout, valor_total } = req.body;
        const idFuncionario = req.user?.id; 

        const [quarto] = await connection.query(
            "SELECT status, room_number FROM quartos WHERE id = ? FOR UPDATE", 
            [quarto_id]
        );

        if (quarto.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Quarto não encontrado." });
        }
        
        if (quarto[0].status !== 'DISPONIVEL') {
            await connection.rollback();
            return res.status(400).json({ message: "Operação negada: O quarto não está disponível para reserva." });
        }


        await connection.query(
            `INSERT INTO reservas 
                (quarto_id, hospede_id, funcionario_id, data_checkin, checkout, valor_total, status_reserva, status_pagamento) 
             VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMADA', 'PENDENTE')`,
            [quarto_id, hospede_id, idFuncionario, data_checkin, checkout, valor_total || 0]
        );

        // 3. Atualiza o status do quarto para 'RESERVADO' (assim ele some do Modal de novas reservas)
        await connection.query(
            "UPDATE quartos SET status = 'OCUPADO' WHERE id = ?", 
            [quarto_id]
        );

        // Se tudo deu certo até aqui, grava definitivamente no banco
        await connection.commit();

        // 4. Registra a ação no seu sistema de Logs que você já tem pronto
        await logActivity(
            idFuncionario, 
            "NOVA_RESERVA", 
            `Reserva criada para o hóspede ID ${hospede_id} no quarto ${quarto[0].room_number} (Período: ${data_checkin} até ${checkout})`
        );

        return res.status(201).json({ message: "Reserva criada com sucesso!" });

    } catch (erro) {
        // Se qualquer linha de código acima falhar, desfaz as alterações no banco
        await connection.rollback();
        console.error("Erro ao criar reserva:", erro.message);
        return res.status(500).json({ 
            message: "Erro interno ao processar a reserva.", 
            detalhes: erro.message 
        });
    } finally {
        connection.release(); // Libera a conexão de volta para o pool do banco
    }
};

const getHospedes = async (req, res) => {
    try {
        const [hospedes] = await db.query(
            "SELECT id, nome, cpf FROM hospedes ORDER BY nome ASC"
        );
        
        return res.status(200).json(hospedes);
    } catch (erro) {
        console.error("Erro ao buscar hóspedes:", erro.message);
        return res.status(500).json({ 
            message: "Erro interno ao buscar a lista de hóspedes.", 
            detalhes: erro.message 
        });
    }
};

const getQuartosDisponiveis = async (req, res) => {
    try {
        const [quartos] = await db.query(
            "SELECT id, room_number, tipo, preco FROM quartos WHERE status = 'DISPONIVEL' ORDER BY room_number ASC"
        );
        
        return res.status(200).json(quartos);
    } catch (erro) {
        console.error("Erro ao buscar quartos disponíveis:", erro.message);
        return res.status(500).json({ 
            message: "Erro interno ao buscar a lista de quartos disponíveis.", 
            detalhes: erro.message 
        });
    }
};

const getReservas = async (req, res) => {
    try {
        const query = `
            SELECT 
                r.id,
                r.quarto_id,
                r.hospede_id,
                r.funcionario_id,
                DATE_FORMAT(r.data_checkin, '%Y-%m-%d') AS data_checkin,
                DATE_FORMAT(r.checkout, '%Y-%m-%d') AS checkout,
                r.valor_total,
                r.status_reserva,
                r.status_pagamento,
                h.nome AS hospede_nome,
                h.cpf AS hospede_cpf,
                q.room_number AS quarto_numero,
                q.tipo AS quarto_tipo
            FROM reservas r
            INNER JOIN hospedes h ON r.hospede_id = h.id
            INNER JOIN quartos q ON r.quarto_id = q.id
            ORDER BY r.created_at DESC
        `;

        const [linhas] = await db.execute(query); 

        return res.status(200).json(linhas);

    } catch (error) {
        console.error("Erro ao buscar reservas no banco:", error);
        return res.status(500).json({ 
            message: "Erro interno ao buscar a listagem de reservas." 
        });
    }
};

export { checkIn, checkOut, concluirLimpeza, criarReserva, getHospedes, getQuartosDisponiveis, getReservas };
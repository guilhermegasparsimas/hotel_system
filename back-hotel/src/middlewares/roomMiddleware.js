
const validateRoomData = (req, res, next) => {
    const { room_number, tipo, preco, capacidade } = req.body;

    if (!room_number || !tipo || !preco || !capacidade) {
        return res.status(400).json({ 
            message: "Dados incompletos. 'room_number', 'tipo', 'preco' e 'capacidade' são obrigatórios." 
        });
    }

    if (isNaN(preco) || preco <= 0) {
        return res.status(400).json({ message: "O preço deve ser um número válido e maior que zero." });
    }

    if (!Number.isInteger(capacidade) || capacidade <= 0) {
        return res.status(400).json({ message: "A capacidade deve ser um número inteiro maior que zero." });
    }

    next();
};

const authorizeEmployee = (req, res, next) => {

    const usuarioLogado = req.user;

    if (!usuarioLogado) {
        return res.status(401).json({ message: "Usuário não autenticado." });
    }

    if (usuarioLogado.tipo !== "FUNCIONARIO") {
        return res.status(403).json({ 
            message: "Acesso negado. Apenas funcionários podem gerenciar quartos e reservas." 
        });
    }

    next();
};

export { validateRoomData, authorizeEmployee };
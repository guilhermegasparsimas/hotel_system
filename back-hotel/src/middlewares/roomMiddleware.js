
const validateRoomData = (req, res, next) => {
    const { room_number, tipo, preco, capacidade } = req.body;

    if (!room_number || !tipo || !preco || !capacidade) {
        return res.status(400).json({ 
           message: "Dados incompletos. Número, tipo, preço e capacidade são obrigatórios." 
        });
    }

    const precoNum = parseFloat(preco);
    if (isNaN(precoNum) || precoNum <= 0) {
        return res.status(400).json({ message: "O preço deve ser um número válido e maior que zero." });
    }

    const capNum = parseInt(capacidade);
    if (isNaN(capNum) || capNum <= 0) {
        return res.status(400).json({ message: "A capacidade deve ser um número inteiro maior que zero." });
    }

    req.body.tipo = tipo.toUpperCase().trim();
    next();
};

const authorizeEmployee = (req, res, next) => {

    const usuarioLogado = req.usuario;

    if (!usuarioLogado) {
        return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const cargosPermitidos = ["GERENTE", "RECEPCIONISTA"];

    if (!cargosPermitidos.includes(usuarioLogado.tipo)) {
        return res.status(403).json({ 
            message: "Acesso negado. Seu cargo não possui permissão para gerenciar unidades." 
        });
    }

    next();
};

export { validateRoomData, authorizeEmployee };
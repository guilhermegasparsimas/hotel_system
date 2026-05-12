
const validateHospedeData = (req, res, next) => {
    const { nome, cpf, email, telefone } = req.body;

    if (!nome || !cpf) {
        return res.status(400).json({ 
            message: "Dados incompletos. Nome e CPF são obrigatórios para o cadastro." 
        });
    }

    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
        return res.status(400).json({ message: "O CPF informado é inválido. Deve conter 11 dígitos." });
    }

    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "O formato do e-mail informado é inválido." });
        }
    }

    req.body.nome = nome.trim().toUpperCase();
    req.body.cpf = cpfLimpo;
    if (email) req.body.email = email.toLowerCase().trim();
    if (telefone) req.body.telefone = telefone.replace(/\D/g, '');

    next();
};


const authorizeHospedeAction = (req, res, next) => {
    const usuarioLogado = req.usuario || req.user; // Suporte para ambos os formatos de token   

    if (!usuarioLogado) {
        return res.status(401).json({ message: "Sessão expirada ou usuário não identificado." });
    }

    const cargosPermitidos = ["GERENTE", "RECEPCIONISTA"];

    if (!cargosPermitidos.includes(usuarioLogado.tipo)) {
        return res.status(403).json({ 
            message: "Acesso negado. Apenas Gerentes ou Recepcionistas podem gerenciar hóspedes." 
        });
    }

    next();
};

export { validateHospedeData, authorizeHospedeAction };
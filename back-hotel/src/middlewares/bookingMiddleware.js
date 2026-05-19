import jwt from 'jsonwebtoken';


const bookingMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            message: "Acesso negado. Você precisa estar logado para realizar esta operação." 
        });
    }

    try {

        const secret = process.env.JWT_SECRET || 'milionario_rico';
        const decoded = jwt.verify(token, secret);

        req.user = decoded;

        next(); 
    } catch (error) {
        console.error("Erro na validação do token:", error.message);
        return res.status(403).json({ 
            message: "Sua sessão expirou ou o token é inválido. Faça login novamente." 
        });
    }
};

export default bookingMiddleware;
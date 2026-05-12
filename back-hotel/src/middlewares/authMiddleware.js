import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) return res.status(401).json({ message: "Token não fornecido." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'milionario_rico');
        
        req.usuario = {
            id: decoded.sub, 
            tipo: decoded.tipo
        } 
        console.log(decoded)
        next(); 
    } catch (error) {
        res.status(401).json({ message: "Sessão inválida ou expirada. Faça login novamente." });
    }
};

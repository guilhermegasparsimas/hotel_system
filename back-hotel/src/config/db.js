import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const db = mysql2.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'milionario',
    database: process.env.DB_DATABASE || 'hotel_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection()
    .then(conn => {
        console.log("✅ Banco de Dados conectado com sucesso!");
        conn.release();
    })
    .catch(err => {
        console.error("❌ Erro ao conectar no banco:", err.message);
    });

export { db };
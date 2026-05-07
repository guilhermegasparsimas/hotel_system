import { app } from './app.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 7070

app.listen(PORT, () => {
    console.log(`Api rodando na porta ${PORT}`)
});

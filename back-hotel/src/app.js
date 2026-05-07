import express from 'express';
import cors from 'cors';
import userRouter from './routes/userRoute.js';
import authRouter from './routes/authRoute.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('teste')
});

app.use(userRouter);
app.use('/auth', authRouter);

export { app };
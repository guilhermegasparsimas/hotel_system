import express from 'express';
import cors from 'cors';
import userRouter from './routes/userRoute.js';
import authRouter from './routes/authRoute.js';
import roomRouter from './routes/roomRoute.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('teste')
});

app.use(userRouter);
app.use('/auth', authRouter);
app.use('/quartos', roomRouter);
app.use('/hospedes', (await import('./routes/hospedeRoute.js')).default);
app.use('/', (await import('./routes/bookingRoute.js')).default);

export { app };
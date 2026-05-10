import express from 'express';
import { checkIn, checkOut, concluirLimpeza } from '../controllers/bookingController/bookingController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const bookingRouter = express.Router();

bookingRouter.post('/checkin', verificarToken, checkIn);
bookingRouter.post('/checkout', verificarToken, checkOut);
bookingRouter.patch('/concluir-limpeza', verificarToken, concluirLimpeza);

export default bookingRouter;
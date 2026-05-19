import { Router } from 'express';
import { 
    checkIn, 
    checkOut, 
    concluirLimpeza,
    criarReserva,
    getHospedes,
    getQuartosDisponiveis,
    getReservas
} from '../controllers/bookingController/bookingController.js';
import bookingMiddleware from '../middlewares/bookingMiddleware.js';
import { db } from '../config/db.js'; 

const bookingRouter = Router();
-

bookingRouter.get('/hospedes', bookingMiddleware, getHospedes);
bookingRouter.get('/quartos/disponiveis', bookingMiddleware, getQuartosDisponiveis);



bookingRouter.post('/reservas', bookingMiddleware, criarReserva); 
bookingRouter.post('/checkin', bookingMiddleware, checkIn);
bookingRouter.post('/checkout', bookingMiddleware, checkOut);
bookingRouter.get('/reservas', bookingMiddleware, getReservas);

export default bookingRouter;
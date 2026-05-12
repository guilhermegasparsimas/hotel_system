import express from 'express';
import { createRoom, deleteRoom, getAllRooms, getStats, updateRoomStatus } from '../controllers/roomController/roomController.js';
import { authorizeEmployee, validateRoomData } from '../middlewares/roomMiddleware.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const roomRouter = express.Router();

roomRouter.get('/stats', verificarToken, getStats);
roomRouter.get('/', verificarToken, getAllRooms);
roomRouter.post('/', verificarToken, authorizeEmployee, validateRoomData, createRoom);
roomRouter.put('/status', verificarToken, authorizeEmployee,updateRoomStatus);
roomRouter.delete('/:id', verificarToken, deleteRoom);

export default roomRouter;
import express from 'express';
import { createRoom, deleteRoom, getAllRooms, updateRoomStatus } from '../controllers/roomController/roomController.js';
import { authorizeEmployee, validateRoomData } from '../middlewares/roomMiddleware.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const roomRouter = express.Router();

roomRouter.post('/quartos', verificarToken, authorizeEmployee, validateRoomData, createRoom);
roomRouter.get('/quartos', getAllRooms);
roomRouter.patch('/quartos/:id', updateRoomStatus);
roomRouter.delete('/quartos/:id', deleteRoom);

export default roomRouter;
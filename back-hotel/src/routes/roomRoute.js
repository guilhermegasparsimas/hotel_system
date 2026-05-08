import express from 'express';
import { createRoom, deleteRoom, getAllRooms, updateRoomStatus } from '../controllers/roomController/roomController.js';
import { authorizeEmployee, validateRoomData } from '../middlewares/roomMiddleware.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const roomRouter = express.Router();

roomRouter.post('/room', verificarToken, authorizeEmployee, validateRoomData, createRoom);
roomRouter.get('/room', getAllRooms);
roomRouter.patch('/room/:id', updateRoomStatus);
roomRouter.delete('/room/:id', deleteRoom);

export default roomRouter;
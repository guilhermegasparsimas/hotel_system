import express from 'express';
import { createUser, editUser, getUser } from '../controllers/userController/userController.js';

const userRouter = express.Router();

userRouter.post('/user', createUser);
userRouter.get('/user', getUser);
userRouter.patch('/user/:id', editUser);

export default userRouter;
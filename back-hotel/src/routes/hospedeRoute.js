import express from "express";
import { createHospede, deleteHospede, getAllHospedes, updateHospede } from "../controllers/hospedeController/hospedeController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { validateHospedeData } from "../middlewares/hospedeMiddleware.js";
import { authorizeEmployee } from "../middlewares/roomMiddleware.js";
const hospedeRouter = express.Router();

hospedeRouter.post('/', verificarToken, authorizeEmployee, validateHospedeData, createHospede);
hospedeRouter.get('/', verificarToken, getAllHospedes);
hospedeRouter.put('/:id', verificarToken, authorizeEmployee, validateHospedeData, updateHospede);
hospedeRouter.delete('/:id', verificarToken, authorizeEmployee, deleteHospede);

export default hospedeRouter;
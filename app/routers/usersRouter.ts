import express, {Request, Response, Router} from 'express';
import {check} from 'express-validator';
import UsersController from '../controllers/usersController';
import {middleware} from "../middleware/middleware";
import {roleMiddleware} from "../middleware/roleMiddleware";

const router = Router();
const usersController = new UsersController();

router.get('/', roleMiddleware(false), usersController.getAll);
router.post('/login', usersController.login);

router.post('/register', (req: Request, res: Response) => usersController.insert(req, res));

export default router;
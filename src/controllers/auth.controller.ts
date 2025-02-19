import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { RegisterUserPayload, LoginPayload } from '../types';
import userService from '../services/user.service';

const login = async (
    req: Request<object, object, LoginPayload>,
    res: Response
) => {
    const { email = null, password = null } = req.body;

    if (email && password) {
        const token = await authService.loginWithPassword(email, password);
        return res.status(200).json({
            message: 'Login successful!',
            token,
        });
    } else {
        return res.status(400).json({
            message: 'Invalid credentials!',
        });
    }
};

const updateUserScore = async (req: Request, res: Response) => {
    const { score } = req.body;
    const user = await userService.updateUserScore(req.user!.id, score);
    return res.status(200).json({
        user,
    });
};

const register = async (
    req: Request<object, object, RegisterUserPayload>,
    res: Response
) => {
    const { email = undefined, name, password, phone = undefined } = req.body;
    await userService.createUser({
        email,
        phone,
        name,
        password,
    });
    return res.status(200).json({
        message: `Registration successful!`,
    });
};

const me = async (req: Request, res: Response) => {
    const user = await userService.getUserById(req.user!.id);
    return res.status(200).json({
        user,
    });
};

export default {
    login,
    register,
    updateUserScore,
    me,
};

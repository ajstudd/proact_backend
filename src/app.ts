import dotenv from 'dotenv';
dotenv.config();
import { checkEnv } from './utils/env';
checkEnv();

import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { HttpError } from './helpers/HttpError';
import routes from './routes';

const app = express();

app.use(morgan('dev'));

const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '16MB' }));
app.use(express.static('public'));

//this will expose the file to the client , can be a security issue
// app.use('/file', express.static('uploads'));

app.use('/api/v1', routes);

app.get('/', (req, res) => {
    res.send('Hello Proactive India');
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    return res
        .status(err.code < 600 ? err.code : 500)
        .json({ ...err, message: err.message });
});

export default app;

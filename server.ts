import cors from 'cors';
import * as path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import {db as db_obj } from './models/db.model';
import { appRouter } from './routes/index';
import express from "express"
import { AppError } from './utils/appError';

const errorHandler = new AppError("", 500).errorHandler;

const app: express.Application = express();

app.use(cookieParser());
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

db_obj.sequelize.sync({alter: process.env.DB_ALTER? JSON.parse(process.env.DB_ALTER) : false, force: process.env.DB_FORCE? JSON.parse(process.env.DB_FORCE): false}).then(async () => {
    console.log("Database Connected");
});

const port: number = process.env.PORT? Number(process.env.PORT) : 9080;
const listening = () => {
    console.log("Server is running");
    console.log(`Running on localhost: ${port}`);
};

app.listen(port, listening);
appRouter(app);

app.use(errorHandler);

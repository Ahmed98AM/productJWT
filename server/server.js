"use strict";
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const db = require('./models/db.model');
const appRouter = require('./routes/index');
const cors = require('cors');
const AppError = require('./utils/appError');
const errorHandler = new AppError().errorHandler;

const app = express();

app.use(cookieParser());
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

db.sequelize.sync({alter: JSON.parse(process.env.DB_ALTER), force: JSON.parse(process.env.DB_FORCE)}).then(async () => {
    console.log("Database Connected");
});

const port = process.env.PORT || 9080;
const listening = () => {
    console.log("Server is running");
    console.log(`Running on localhost: ${port}`);
};

app.listen(port, listening);
appRouter(app);

app.use(errorHandler);

module.exports = app;
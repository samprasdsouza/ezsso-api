const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const engine = require("ejs-mate");


const { notFound, errorHandler } = require('./middlewares/index.js');

const app = express();

require('dotenv').config();

app.use(helmet());
app.use(bodyParser.json());


app.engine("ejs", engine);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

const userLogin = require('./routes');



app.use('/user', userLogin);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
require("dotenv").config()

const express = require("express");
const app = express();
const morgan = require("morgan");
const mysql = require('mysql');
const myConnection = require('express-myconnection');
const ejs = require("ejs");
const session = require("express-session");

app.use(morgan("dev"));

app.set('view engine', 'ejs');
app.use(express.static("public"));

const PORT = 4000; 
const dbOptions = {
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306,
    database: 'ecommerce'
};
  
app.use(myConnection(mysql, dbOptions, 'pool'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({
    secret: "secret",
    saveUninitialized: true,
    resave: false
}))

const rutas = require("./routes/routes");
app.use("/", rutas);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})
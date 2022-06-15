require("dotenv").config()

const express = require("express");
const app = express();
const morgan = require("morgan");
const mysql = require('mysql');
const myConnection = require('express-myconnection');
const session = require("express-session");

app.use(morgan("dev"));

app.set('view engine', 'ejs');
app.use(express.static("public"));

const PORT = process.env.PORT || 4000; 
const dbOptions = {
    host: 'mysql-bdproyectos.alwaysdata.net',
    user: '272842_adt',
    password: 'sql2415david',
    port: 3306,
    database: 'bdproyectos_ecommerce'
};
  
app.use(myConnection(mysql, dbOptions, 'pool'));

app.use(session({
    secret: "secret",
    saveUninitialized: true,
    resave: false
}))

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const rutas = require("./routes/routes");
app.use("/", rutas);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})
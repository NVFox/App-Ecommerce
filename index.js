const express = require("express");
const app = express();
const morgan = require("morgan");
const mysql = require('mysql');
const myConnection = require('express-myconnection');
const ejs = require("ejs");

const rutas = require("./routes/routes");

const PORT = 4000; 
const dbOptions = {
    host: 'localhost',
    user: 'root',
    password: '',
    port: 3306,
    database: 'ecommerce'
};
  
app.use(myConnection(mysql, dbOptions, 'pool'));
app.use(morgan("dev"));

app.use("/", rutas);

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.use(express.static("public"));

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})
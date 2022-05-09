const express = require("express");
const app = express();
const morgan = require("morgan");
const mysql = require('mysql');
const myConnection = require('express-myconnection');
const ejs = require("ejs");

app.use(morgan("dev"));

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
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

const rutas = require("./routes/routes");
app.use("/", rutas);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})
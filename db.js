const mysql = require("mysql2"); //guardamos la libreria

const connection = mysql.createConnection({
    host: "localhost", 
    user: "root",
    password: "",
    database: "ticket_system"
});

connection.connect((err) => {
    if(err){
    console.log("Error de coneccion a la base de datos", err);
    }
    console.log("Coneccion a MySQL exitosa");
})
//con esto permitimos poder usar la base de datos
module.exports = connection;
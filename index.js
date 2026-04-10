const express = require("express");
const cors = require("cors");
//colocar informacion de la base de datos para poder utilizarla
const db = require("./db");

const app = express(); //nucleo de referencia en las funciones de la api(se ejecuta todas las funciones de express)
//solo se configuran una vez
const PORT = 3000; //delcaramos el puerto que queremos que utilice

//implementar cors
app.use(cors());
//MIDDLEWARE PARA LEER JSON
app.use(express.json());

//GET

app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener los usuarios" });
    }
    res.json(result);
  });
});
//POST
app.post("/crearUsers", (req, res) => {
  //GET por ID
  app.get("/users/:id", (req, res) => {
    const id = req.params.id;
    db.query("SELECT * FROM users WHERE id = ?", [id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Error al obtener los usuarios" });
      }
      res.json(result);
    });
  }); // funcion llamada users del tipo get
  db.query(
    "INSERT INTO users (name, last_name, username, email, password, rol, career_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      req.body.name,
      req.body.last_name,
      req.body.username,
      req.body.email,
      req.body.password,
      req.body.rol,
      req.body.career_id,
    ],
  );
  const body = req.body;
  console.log(body);
  //console.log(body.name)
  res.send("Usuario creado correctamente");
});


//Endpoint PUT actualizar
app.put("/actualizar/:id", (req, res) => {
 const { name, last_name } = req.body;
    db.query(`UPDATE users SET name = ?, last_name = ? WHERE id = ?`, [name, last_name, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: "Error al actualizar" });
        res.json({ mensaje: "Usuario actualizado" });
    });
});


//DELETE - eliminar un usuario
app.delete("/eliminar/:idusuario", (req, res) => {
  const { idusuario } = req.params;
  console.log(`Eliminando usuario con ID: ${idusuario}`);
  
  db.query("DELETE FROM users WHERE id = ?", [idusuario], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al eliminar el usuario" });

  res.status(200).send(`Usuario ${idusuario} eliminado correctamente`);
});
});






//Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor crriendo en http://localhost:${PORT}`);
});

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

//POST
app.post("/crearUsers", (req, res) => {
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

// PUT - actualizar usuario por ID
app.put("/users/:id", (req, res) => {
  const id = req.params.id;

  const { name, last_name, username, email, password, rol, career_id, active } =
    req.body;

  db.query(
    `UPDATE users SET name = ?, last_name = ?, username = ?, email = ?, password = ?, rol = ?, career_id = ?, active = ? WHERE id = ?`,
    [name, last_name, username, email, password, rol, career_id, active, id],
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ error: "Error al actualizar el usuario" });
      }

      res.json({ message: "Usuario actualizado correctamente" });
    },
  );
});

//DELETE - eliminar un usuario
app.delete("/eliminar/:idusuario", (req, res) => {
  const { idusuario } = req.params;
  console.log(`Eliminando usuario con ID: ${idusuario}`);

  db.query("DELETE FROM users WHERE id = ?", [idusuario], (err, result) => {
    if (err)
      return res.status(500).json({ error: "Error al eliminar el usuario" });

    res.status(200).send(`Usuario ${idusuario} eliminado correctamente`);
  });
});

// =========================
// AUTENTICACIÓN + INTENTOS FALLIDOS
// =========================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error" });

      if (result.length === 0) {
        return res.status(401).json({ error: "Usuario no existe" });
      }

      const user = result[0];

      if (user.failed_attempts >= 3) {
        return res.status(403).json({ error: "Usuario bloqueado" });
      }

      if (user.password !== password) {
        db.query(
          "UPDATE users SET failed_attempts = failed_attempts + 1 WHERE id = ?",
          [user.id],
        );

        return res.status(401).json({ error: "Contraseña incorrecta" });
      }

      db.query("UPDATE users SET failed_attempts = 0 WHERE id = ?", [user.id]);

      res.json(user);
    },
  );
});

// =========================
// CATÁLOGOS
// =========================
app.get("/careers", (req, res) => {
  db.query("SELECT * FROM careers", (err, result) => {
    if (err) return res.status(500).json({ error: "Error" });
    res.json(result);
  });
});

app.get("/types", (req, res) => {
  db.query("SELECT * FROM types", (err, result) => {
    if (err) return res.status(500).json({ error: "Error" });
    res.json(result);
  });
});

app.get("/categories", (req, res) => {
  db.query("SELECT * FROM categories", (err, result) => {
    if (err) return res.status(500).json({ error: "Error" });
    res.json(result);
  });
});

// =========================
// TICKETS (CRUD)
// =========================
app.post("/tickets", (req, res) => {
  const { title, description, type_id, priority, created_by } = req.body;

  db.query(
    "INSERT INTO tickets (title, description, type_id, priority, created_by) VALUES (?, ?, ?, ?, ?)",
    [title, description, type_id, priority, created_by],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error al crear ticket" });

      res.json({ message: "Ticket creado" });
    },
  );
});

app.get("/tickets", (req, res) => {
  db.query("SELECT * FROM tickets", (err, result) => {
    if (err) return res.status(500).json({ error: "Error" });
    res.json(result);
  });
});

app.get("/tickets/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM tickets WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Error" });

    res.json(result[0]);
  });
});

app.put("/tickets/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority } = req.body;

  db.query(
    "UPDATE tickets SET title = ?, description = ?, status = ?, priority = ? WHERE id = ?",
    [title, description, status, priority, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error" });

      res.json({ message: "Ticket actualizado" });
    },
  );
});

app.delete("/tickets/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM tickets WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Error" });

    res.json({ message: "Ticket eliminado" });
  });
});

// =========================
// ASIGNACIÓN DE TICKETS
// =========================
app.post("/asignar", (req, res) => {
  const { id_ticket, id_user } = req.body;

  db.query(
    "INSERT INTO tickets_devs (id_ticket, id_user) VALUES (?, ?)",
    [id_ticket, id_user],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error" });

      res.json({ message: "Ticket asignado" });
    },
  );
});

// =========================
// CONSULTAS (FILTROS)
// =========================
app.get("/tickets/status/:status", (req, res) => {
  const { status } = req.params;

  db.query(
    "SELECT * FROM tickets WHERE status = ?",
    [status],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error" });

      res.json(result);
    },
  );
});

app.get("/tickets/buscar/:texto", (req, res) => {
  const { texto } = req.params;

  db.query(
    "SELECT * FROM tickets WHERE title LIKE ?",
    [`%${texto}%`],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error" });

      res.json(result);
    },
  );
});

// =========================
// KPI (MÉTRICAS)
// =========================
app.get("/kpi/total", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM tickets", (err, result) => {
    if (err) return res.status(500).json({ error: "Error" });

    res.json(result[0]);
  });
});

app.get("/kpi/status", (req, res) => {
  db.query(
    "SELECT status, COUNT(*) AS total FROM tickets GROUP BY status",
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error" });

      res.json(result);
    },
  );
});

//Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

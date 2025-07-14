const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Crear directorio de uploads si no existe
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configurar multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Conectar a SQLite
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Crear tablas si no existen
db.serialize(() => {
  // Tabla de alumnos
  db.run(`CREATE TABLE IF NOT EXISTS alumnos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    materia TEXT NOT NULL,
    nivel TEXT,
    contacto TEXT,
    objetivos TEXT,
    temario TEXT,
    estado_pago TEXT DEFAULT 'pendiente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabla de clases
  db.run(`CREATE TABLE IF NOT EXISTS clases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alumno_id INTEGER,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME,
    notas TEXT,
    archivo_pdf TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alumno_id) REFERENCES alumnos (id)
  )`);

  // Tabla de disponibilidad semanal
  db.run(`CREATE TABLE IF NOT EXISTS disponibilidad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dia_semana INTEGER NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    disponible BOOLEAN DEFAULT 1
  )`);

  // Tabla de dudas
  db.run(`CREATE TABLE IF NOT EXISTS dudas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alumno_id INTEGER,
    pregunta TEXT NOT NULL,
    respuesta TEXT,
    fecha DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (alumno_id) REFERENCES alumnos (id)
  )`);
});

// RUTAS - ALUMNOS
// Obtener todos los alumnos
app.get('/api/alumnos', (req, res) => {
  db.all(`
    SELECT a.*, 
           (SELECT fecha || ' ' || hora_inicio 
            FROM clases c 
            WHERE c.alumno_id = a.id 
              AND datetime(c.fecha || ' ' || c.hora_inicio) > datetime('now', 'localtime')
            ORDER BY c.fecha ASC, c.hora_inicio ASC 
            LIMIT 1) as proxima_clase
    FROM alumnos a 
    ORDER BY a.nombre
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Obtener un alumno por ID
app.get('/api/alumnos/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM alumnos WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Alumno no encontrado' });
      return;
    }
    res.json(row);
  });
});

// Crear nuevo alumno
app.post('/api/alumnos', (req, res) => {
  const { nombre, materia, nivel, contacto, objetivos } = req.body;
  
  if (!nombre || !materia) {
    res.status(400).json({ error: 'Nombre y materia son requeridos' });
    return;
  }

  db.run(
    'INSERT INTO alumnos (nombre, materia, nivel, contacto, objetivos) VALUES (?, ?, ?, ?, ?)',
    [nombre, materia, nivel || '', contacto || '', objetivos || ''],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Alumno creado exitosamente' });
    }
  );
});

// Actualizar alumno
app.put('/api/alumnos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, materia, nivel, contacto, objetivos, temario, estado_pago } = req.body;

  db.run(
    `UPDATE alumnos 
     SET nombre = ?, materia = ?, nivel = ?, contacto = ?, objetivos = ?, temario = ?, estado_pago = ?
     WHERE id = ?`,
    [nombre, materia, nivel, contacto, objetivos, temario, estado_pago, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Alumno no encontrado' });
        return;
      }
      res.json({ message: 'Alumno actualizado exitosamente' });
    }
  );
});

// RUTAS - CLASES
// Obtener clases de un alumno
app.get('/api/alumnos/:id/clases', (req, res) => {
  const { id } = req.params;
  db.all(
    'SELECT * FROM clases WHERE alumno_id = ? ORDER BY fecha DESC, hora_inicio DESC',
    [id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Crear nueva clase
app.post('/api/clases', upload.single('archivo'), (req, res) => {
  const { alumno_id, fecha, hora_inicio, hora_fin, notas } = req.body;
  const archivo_pdf = req.file ? req.file.filename : null;

  if (!alumno_id || !fecha || !hora_inicio) {
    res.status(400).json({ error: 'alumno_id, fecha y hora_inicio son requeridos' });
    return;
  }

  db.run(
    'INSERT INTO clases (alumno_id, fecha, hora_inicio, hora_fin, notas, archivo_pdf) VALUES (?, ?, ?, ?, ?, ?)',
    [alumno_id, fecha, hora_inicio, hora_fin || null, notas || '', archivo_pdf],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Clase registrada exitosamente' });
    }
  );
});

// Obtener clases próximas (7 días)
app.get('/api/clases/proximas', (req, res) => {
  db.all(`
    SELECT c.*, a.nombre as alumno_nombre, a.materia
    FROM clases c
    JOIN alumnos a ON c.alumno_id = a.id
    WHERE datetime(c.fecha || ' ' || c.hora_inicio) > datetime('now', 'localtime')
      AND datetime(c.fecha || ' ' || c.hora_inicio) <= datetime('now', '+7 days', 'localtime')
    ORDER BY c.fecha ASC, c.hora_inicio ASC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// RUTAS - DUDAS
// Obtener dudas de un alumno
app.get('/api/alumnos/:id/dudas', (req, res) => {
  const { id } = req.params;
  db.all(
    'SELECT * FROM dudas WHERE alumno_id = ? ORDER BY fecha DESC',
    [id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Crear nueva duda
app.post('/api/dudas', (req, res) => {
  const { alumno_id, pregunta, respuesta } = req.body;

  if (!alumno_id || !pregunta) {
    res.status(400).json({ error: 'alumno_id y pregunta son requeridos' });
    return;
  }

  db.run(
    'INSERT INTO dudas (alumno_id, pregunta, respuesta) VALUES (?, ?, ?)',
    [alumno_id, pregunta, respuesta || ''],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Duda registrada exitosamente' });
    }
  );
});

// Actualizar respuesta de una duda
app.put('/api/dudas/:id', (req, res) => {
  const { id } = req.params;
  const { respuesta } = req.body;

  db.run(
    'UPDATE dudas SET respuesta = ? WHERE id = ?',
    [respuesta, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Duda no encontrada' });
        return;
      }
      res.json({ message: 'Respuesta actualizada exitosamente' });
    }
  );
});

// RUTAS - DISPONIBILIDAD
// Obtener disponibilidad semanal
app.get('/api/disponibilidad', (req, res) => {
  db.all('SELECT * FROM disponibilidad ORDER BY dia_semana, hora_inicio', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Crear/actualizar disponibilidad
app.post('/api/disponibilidad', (req, res) => {
  const { dia_semana, hora_inicio, hora_fin, disponible } = req.body;

  if (dia_semana === undefined || !hora_inicio || !hora_fin) {
    res.status(400).json({ error: 'dia_semana, hora_inicio y hora_fin son requeridos' });
    return;
  }

  // Verificar si ya existe
  db.get(
    'SELECT id FROM disponibilidad WHERE dia_semana = ? AND hora_inicio = ? AND hora_fin = ?',
    [dia_semana, hora_inicio, hora_fin],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (row) {
        // Actualizar
        db.run(
          'UPDATE disponibilidad SET disponible = ? WHERE id = ?',
          [disponible !== false, row.id],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ message: 'Disponibilidad actualizada' });
          }
        );
      } else {
        // Crear
        db.run(
          'INSERT INTO disponibilidad (dia_semana, hora_inicio, hora_fin, disponible) VALUES (?, ?, ?, ?)',
          [dia_semana, hora_inicio, hora_fin, disponible !== false],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ id: this.lastID, message: 'Disponibilidad creada' });
          }
        );
      }
    }
  );
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});

module.exports = app;
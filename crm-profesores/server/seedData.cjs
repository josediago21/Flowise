const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const seedData = () => {
  console.log('🌱 Poblando la base de datos con datos de prueba...');

  db.serialize(() => {
    // Crear tablas si no existen
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

    db.run(`CREATE TABLE IF NOT EXISTS disponibilidad (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dia_semana INTEGER NOT NULL,
      hora_inicio TIME NOT NULL,
      hora_fin TIME NOT NULL,
      disponible BOOLEAN DEFAULT 1
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS dudas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alumno_id INTEGER,
      pregunta TEXT NOT NULL,
      respuesta TEXT,
      fecha DATE DEFAULT CURRENT_DATE,
      FOREIGN KEY (alumno_id) REFERENCES alumnos (id)
    )`);

    // Insertar alumnos de ejemplo
    const alumnos = [
      {
        nombre: 'María González',
        materia: 'Matemáticas',
        nivel: 'Bachillerato',
        contacto: '+34 666 123 456',
        objetivos: 'Preparar selectividad - necesita refuerzo en derivadas e integrales',
        estado_pago: 'pagado'
      },
      {
        nombre: 'Pablo Martín',
        materia: 'Física',
        nivel: 'Universidad',
        contacto: 'pablo.martin@email.com',
        objetivos: 'Apoyo en mecánica cuántica para examen final',
        estado_pago: 'pendiente'
      },
      {
        nombre: 'Ana Ruiz',
        materia: 'Inglés',
        nivel: 'ESO',
        contacto: '+34 677 987 654',
        objetivos: 'Mejorar speaking y preparar B1',
        estado_pago: 'pagado'
      },
      {
        nombre: 'Carlos López',
        materia: 'Química',
        nivel: 'Bachillerato',
        contacto: '+34 655 321 789',
        objetivos: 'Refuerzo en química orgánica',
        estado_pago: 'pendiente'
      }
    ];

    // Limpiar datos existentes
    db.run('DELETE FROM clases');
    db.run('DELETE FROM dudas');
    db.run('DELETE FROM disponibilidad');
    db.run('DELETE FROM alumnos');

    // Insertar alumnos
    const insertAlumno = db.prepare(`
      INSERT INTO alumnos (nombre, materia, nivel, contacto, objetivos, estado_pago) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    alumnos.forEach(alumno => {
      insertAlumno.run(
        alumno.nombre, 
        alumno.materia, 
        alumno.nivel, 
        alumno.contacto, 
        alumno.objetivos, 
        alumno.estado_pago
      );
    });
    insertAlumno.finalize();

    // Insertar clases de ejemplo
    const clases = [
      {
        alumno_id: 1,
        fecha: '2024-01-15',
        hora_inicio: '16:00',
        hora_fin: '17:00',
        notas: 'Repasamos derivadas básicas. María ha entendido bien la regla de la cadena.'
      },
      {
        alumno_id: 1,
        fecha: '2024-01-22',
        hora_inicio: '16:00',
        hora_fin: '17:00',
        notas: 'Trabajamos integrales por partes. Necesita más práctica con ejercicios complejos.'
      },
      {
        alumno_id: 2,
        fecha: '2024-01-16',
        hora_inicio: '18:00',
        hora_fin: '19:00',
        notas: 'Introducción a mecánica cuántica - principio de incertidumbre de Heisenberg.'
      },
      {
        alumno_id: 3,
        fecha: '2024-01-17',
        hora_inicio: '17:00',
        hora_fin: '18:00',
        notas: 'Conversación en inglés sobre hobbies. Ana mejora mucho su fluidez.'
      }
    ];

    const insertClase = db.prepare(`
      INSERT INTO clases (alumno_id, fecha, hora_inicio, hora_fin, notas) 
      VALUES (?, ?, ?, ?, ?)
    `);

    clases.forEach(clase => {
      insertClase.run(
        clase.alumno_id,
        clase.fecha,
        clase.hora_inicio,
        clase.hora_fin,
        clase.notas
      );
    });

    // Insertar clases futuras para la semana
    const hoy = new Date();
    const mañana = new Date(hoy);
    mañana.setDate(hoy.getDate() + 1);
    const pasadoMañana = new Date(hoy);
    pasadoMañana.setDate(hoy.getDate() + 2);

    const clasesFuturas = [
      {
        alumno_id: 1,
        fecha: mañana.toISOString().split('T')[0],
        hora_inicio: '16:00',
        hora_fin: '17:00',
        notas: ''
      },
      {
        alumno_id: 3,
        fecha: pasadoMañana.toISOString().split('T')[0],
        hora_inicio: '17:00',
        hora_fin: '18:00',
        notas: ''
      }
    ];

    clasesFuturas.forEach(clase => {
      insertClase.run(
        clase.alumno_id,
        clase.fecha,
        clase.hora_inicio,
        clase.hora_fin,
        clase.notas
      );
    });
    insertClase.finalize();

    // Insertar dudas de ejemplo
    const dudas = [
      {
        alumno_id: 1,
        pregunta: '¿Cuál es la diferencia entre límite y derivada?',
        respuesta: 'La derivada es el límite del cociente incremental cuando el incremento tiende a cero. Representa la pendiente de la recta tangente.',
        fecha: '2024-01-15'
      },
      {
        alumno_id: 2,
        pregunta: '¿Por qué no se puede conocer simultáneamente la posición y velocidad de una partícula?',
        respuesta: 'Esto se debe al principio de incertidumbre de Heisenberg. Es una limitación fundamental de la naturaleza, no de nuestros instrumentos.',
        fecha: '2024-01-16'
      },
      {
        alumno_id: 3,
        pregunta: '¿Cuándo uso "will" y cuándo "going to"?',
        respuesta: '"Will" para decisiones espontáneas y predicciones. "Going to" para planes hechos y predicciones con evidencia.',
        fecha: '2024-01-17'
      }
    ];

    const insertDuda = db.prepare(`
      INSERT INTO dudas (alumno_id, pregunta, respuesta, fecha) 
      VALUES (?, ?, ?, ?)
    `);

    dudas.forEach(duda => {
      insertDuda.run(
        duda.alumno_id,
        duda.pregunta,
        duda.respuesta,
        duda.fecha
      );
    });
    insertDuda.finalize();

    // Insertar disponibilidad de ejemplo
    const disponibilidades = [
      // Lunes
      { dia_semana: 1, hora_inicio: '16:00', hora_fin: '17:00', disponible: 1 },
      { dia_semana: 1, hora_inicio: '17:00', hora_fin: '18:00', disponible: 1 },
      { dia_semana: 1, hora_inicio: '18:00', hora_fin: '19:00', disponible: 1 },
      
      // Martes
      { dia_semana: 2, hora_inicio: '16:00', hora_fin: '17:00', disponible: 1 },
      { dia_semana: 2, hora_inicio: '17:00', hora_fin: '18:00', disponible: 1 },
      { dia_semana: 2, hora_inicio: '18:00', hora_fin: '19:00', disponible: 1 },
      
      // Miércoles
      { dia_semana: 3, hora_inicio: '16:00', hora_fin: '17:00', disponible: 1 },
      { dia_semana: 3, hora_inicio: '17:00', hora_fin: '18:00', disponible: 1 },
      
      // Jueves
      { dia_semana: 4, hora_inicio: '16:00', hora_fin: '17:00', disponible: 1 },
      { dia_semana: 4, hora_inicio: '17:00', hora_fin: '18:00', disponible: 1 },
      { dia_semana: 4, hora_inicio: '18:00', hora_fin: '19:00', disponible: 1 },
      
      // Viernes
      { dia_semana: 5, hora_inicio: '16:00', hora_fin: '17:00', disponible: 1 },
      { dia_semana: 5, hora_inicio: '17:00', hora_fin: '18:00', disponible: 1 }
    ];

    const insertDisponibilidad = db.prepare(`
      INSERT INTO disponibilidad (dia_semana, hora_inicio, hora_fin, disponible) 
      VALUES (?, ?, ?, ?)
    `);

    disponibilidades.forEach(disp => {
      insertDisponibilidad.run(
        disp.dia_semana,
        disp.hora_inicio,
        disp.hora_fin,
        disp.disponible
      );
    });
    insertDisponibilidad.finalize();

    console.log('✅ Datos de prueba insertados correctamente');
    console.log('📚 4 alumnos creados');
    console.log('📅 ' + (clases.length + clasesFuturas.length) + ' clases insertadas');
    console.log('❓ ' + dudas.length + ' dudas registradas');
    console.log('⏰ ' + disponibilidades.length + ' franjas de disponibilidad configuradas');
  });

  db.close((err) => {
    if (err) {
      console.error('Error al cerrar la base de datos:', err);
    } else {
      console.log('🗄️ Base de datos cerrada correctamente');
    }
  });
};

// Ejecutar si se llama directamente
if (require.main === module) {
  seedData();
}

module.exports = seedData;
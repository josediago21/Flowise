# CRM para Profesores Particulares 👨‍🏫

Una aplicación web simple y funcional tipo CRM diseñada específicamente para profesores particulares que trabajan por cuenta propia. Enfocada en validar la utilidad real para la gestión del seguimiento de alumnos y horarios de clase.

## 🎯 Objetivo del MVP

Validar si esta herramienta ayuda al profesor a:
1. **Ahorrar tiempo** en el seguimiento del alumno
2. **Evitar pérdidas** por cambios de horario
3. **Centralizar** su comunicación y planificación

## 🧩 Funcionalidades Principales

### 👤 Dashboard del Profesor
- Lista de alumnos activos con próximas clases
- Resumen de clases próximas en los próximos 7 días
- Estadísticas rápidas (total alumnos, clases semanales, pagos pendientes)
- Botón para añadir nuevos alumnos

### 📚 Página Individual del Alumno
- **Información completa**: nombre, nivel, materia, contacto, objetivos
- **Temario compartido**: editable en texto libre
- **Seguimiento de clases**: 
  - Registro de fecha, hora y notas de cada clase
  - Subida de archivos PDF (capturas de pizarra, ejercicios)
  - Botón "Enviar por WhatsApp" (simulado)
- **Dudas resueltas**: registro de preguntas y respuestas
- **Estado del pago**: clase pagada o pendiente

### 📅 Horario Semanal
- Vista de calendario semanal interactivo (lunes a domingo)
- Gestión de disponibilidad por franjas horarias
- Clases reservadas visibles con nombre del alumno
- Generación de links de reserva para enviar a alumnos (simulado)

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm o yarn

### Configuración Inicial

1. **Clonar o descargar el proyecto**
   ```bash
   cd crm-profesores
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Poblar la base de datos con datos de prueba**
   ```bash
   npm run seed
   ```
   Esto creará 4 alumnos de ejemplo con clases, dudas y disponibilidad configurada.

### Ejecutar la Aplicación

**Opción 1: Ejecutar frontend y backend simultáneamente (recomendado)**
```bash
npm run dev:full
```

**Opción 2: Ejecutar por separado**
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## 📱 Uso de la Aplicación

### Primeros Pasos
1. Abrir http://localhost:5173 en tu navegador
2. Explorar el dashboard con los alumnos de prueba
3. Hacer clic en un alumno para ver su página de detalle
4. Probar la gestión de horarios en la sección "Horarios"

### Flujo de Trabajo Típico
1. **Añadir un nuevo alumno** desde el dashboard
2. **Configurar tu disponibilidad** en la página de horarios
3. **Registrar clases** desde la página del alumno
4. **Gestionar dudas** y actualizar el temario
5. **Simular envío por WhatsApp** de resúmenes de clase

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** con Vite para desarrollo rápido
- **React Router** para navegación
- **Tailwind CSS** para diseño responsive y moderno
- **Lucide React** para iconos

### Backend
- **Node.js** con Express para API REST
- **SQLite** para base de datos ligera y portable
- **Multer** para subida de archivos PDF
- **CORS** para comunicación frontend-backend

### Base de Datos
```sql
- alumnos (información personal y académica)
- clases (registro de sesiones con notas y archivos)
- dudas (preguntas y respuestas)
- disponibilidad (horarios semanales del profesor)
```

## 📊 Datos de Prueba Incluidos

La aplicación incluye datos de ejemplo para facilitar la evaluación:

- **4 alumnos** de diferentes materias (Matemáticas, Física, Inglés, Química)
- **6 clases** registradas con notas detalladas
- **2 clases futuras** para probar la vista de "próximas clases"
- **3 dudas resueltas** con preguntas y respuestas
- **Disponibilidad semanal** configurada de lunes a viernes

## 🎨 Características de Diseño

- **Responsive**: Funciona perfectamente en móvil y desktop
- **Intuitivo**: Diseñado para profesores sin conocimientos técnicos
- **Accesible**: Colores y contrastes apropiados
- **Moderno**: Interfaz limpia con Tailwind CSS

## 🔧 Funcionalidades Simuladas

Como MVP de validación, algunas funcionalidades están simuladas:

- **WhatsApp**: Los botones muestran alerts con el texto que se enviaría
- **Links de reserva**: Se genera un enlace simulado para enviar a alumnos
- **Pagos**: Solo gestión de estado (pagado/pendiente)

## 📁 Estructura del Proyecto

```
crm-profesores/
├── src/                     # Frontend React
│   ├── components/          # Componentes reutilizables
│   ├── pages/              # Páginas principales
│   └── App.jsx             # Componente principal
├── server/                 # Backend Node.js
│   ├── index.js            # Servidor Express
│   ├── seedData.js         # Datos de prueba
│   └── database.sqlite     # Base de datos SQLite
├── tailwind.config.js      # Configuración de Tailwind
└── package.json           # Dependencias y scripts
```

## 🚀 Scripts Disponibles

- `npm run dev`: Ejecutar solo el frontend
- `npm run server`: Ejecutar solo el backend
- `npm run dev:full`: Ejecutar frontend y backend simultáneamente
- `npm run seed`: Poblar la base de datos con datos de prueba
- `npm run build`: Construir la aplicación para producción

## 💡 Ideas para Extensión

Si el MVP demuestra utilidad, se podrían añadir:

- Integración real con WhatsApp Business API
- Sistema de pagos con Stripe
- Notificaciones por email
- Calendario sincronizado con Google Calendar
- Reportes y estadísticas avanzadas
- Sistema de backup automático
- Modo multi-profesor

## 🎯 Público Objetivo

Profesores particulares que:
- Trabajan por cuenta propia
- Dan clases online o presenciales
- Actualmente usan WhatsApp y Google Calendar
- No tienen conocimientos técnicos avanzados
- Buscan centralizar su gestión de alumnos

## 📞 Validación

Para validar la utilidad, observar si el profesor:
- Reduce el tiempo dedicado a organización
- Mejora el seguimiento de progreso de alumnos
- Evita confusiones de horarios
- Centraliza mejor su información
- Se siente más profesional en su gestión

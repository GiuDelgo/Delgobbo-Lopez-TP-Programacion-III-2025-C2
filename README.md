# 🏋️ Papota Gym - Sistema de Autoservicio

Sistema de autoservicio para la venta de suplementos y pesas, con panel de administración.

## 👥 Integrantes
- Delgobbo
- Lopez

---

## 📋 Requisitos Previos

- **Node.js** (v14 o superior)
- **MySQL** (v5.7 o superior)
- **npm** (viene con Node.js)

---

## 🚀 Instalación y Configuración

### **1. Clonar el Repositorio**

```bash
git clone <url-del-repositorio>
cd Delgobbo-Lopez-TP-Programacion-III-2025-C2
```

### **2. Configurar el Backend**

#### **2.1. Instalar Dependencias**

```bash
cd back
npm install
```

#### **2.2. Crear la Base de Datos**

Abre MySQL Workbench (o tu cliente MySQL) y ejecuta:

```sql
CREATE DATABASE papota_gym CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### **2.3. Configurar Variables de Entorno**

Crea un archivo `.env` en la carpeta `back/` basándote en `.env.example`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
STRING_DB=mysql://root:TU_CONTRASEÑA@localhost:3306/papota_gym
PORT=3000
ORIGIN=*
SESSION_SECRET=mi-secreto-super-seguro-2025
```

**⚠️ IMPORTANTE:** Reemplaza `TU_CONTRASEÑA` con tu contraseña de MySQL.

**Nota:** Puedes usar el archivo `.env.example` como referencia.

#### **2.4. Iniciar el Servidor Backend**

```bash
node index.js
```

Deberías ver:
```
🔗 Conexión a la base de datos establecida correctamente.
📊 Modelos sincronizados con la base de datos.
✅ Usuario administrador creado automáticamente
   📧 Correo: admin@papota.com
   🔐 Contraseña: admin123
🚀 Servidor corriendo en http://localhost:3000
🔐 Panel admin: http://localhost:3000/admin/login
```

**Nota:** El usuario administrador se crea automáticamente la primera vez que inicias el servidor.

### **3. Configurar el Frontend**

#### **3.1. Instalar Dependencias (si las hay)**

```bash
cd ../front
npm install
```

#### **3.2. Abrir la Aplicación**

Abre el archivo `front/views/bienvenida.html` con **Live Server** en VS Code o accede directamente desde tu navegador.

---

## 🌐 URLs de la Aplicación

### **Frontend (Cliente):**
- **Bienvenida:** `front/views/bienvenida.html`
- **Productos:** `front/views/productos.html`
- **Carrito:** `front/views/carrito.html`
- **Ticket:** `front/views/ticket.html`

### **Backend (API):**
- **Base URL:** `http://localhost:3000`
- **Productos:** `http://localhost:3000/productos`
- **Usuarios:** `http://localhost:3000/usuario`
- **Ventas:** `http://localhost:3000/ventas`

### **Panel de Administración:**
- **Login:** `http://localhost:3000/admin/login`
- **Dashboard:** `http://localhost:3000/admin/dashboard` (requiere login)

---

## 🔑 Credenciales de Acceso

### **Panel de Administración:**
- **Correo:** `admin@papota.com`
- **Contraseña:** `admin123`

---

## 📁 Estructura del Proyecto

```
Delgobbo-Lopez-TP-Programacion-III-2025-C2/
├── back/                           # Backend (Node.js + Express + Sequelize)
│   ├── controllers/                # Controladores (lógica de negocio)
│   │   ├── admin.controller.js     # Panel de administración
│   │   ├── productos.controller.js
│   │   ├── usuario.controller.js
│   │   └── ventas.controller.js
│   ├── db/
│   │   └── sequelize.js            # Configuración de Sequelize
│   ├── models/                     # Modelos de base de datos
│   │   ├── detalleVenta.js
│   │   ├── productos.js
│   │   ├── relaciones.js
│   │   ├── usuario.js
│   │   └── ventas.js
│   ├── routes/                     # Rutas de la API
│   │   ├── admin.routes.js
│   │   ├── productos.routes.js
│   │   ├── usuario.routes.js
│   │   └── ventas.routes.js
│   ├── views/                      # Vistas EJS (panel de admin)
│   │   └── admin/
│   │       ├── dashboard.ejs
│   │       ├── login.ejs
│   │       └── producto-form.ejs
│   ├── public/                     # Archivos estáticos
│   │   └── css/
│   │       └── admin.css
│   ├── uploads/                    # Imágenes de productos
│   ├── .env.example                # Plantilla de configuración
│   ├── index.js                    # Servidor principal
│   └── package.json
│
└── front/                          # Frontend (HTML + CSS + JS)
    ├── imgs/                       # Imágenes
    ├── scripts/                    # JavaScript
    │   ├── bienvenida.js
    │   ├── carrito.js
    │   ├── main.js
    │   ├── producto.js
    │   └── productos-pagina.js
    ├── style/                      # CSS
    │   ├── bienvenida.css
    │   ├── carrito.css
    │   ├── productos.css
    │   └── ticket.css
    └── views/                      # HTML
        ├── bienvenida.html
        ├── carrito.html
        ├── productos.html
        └── ticket.html
```

---

## 🛠️ Tecnologías Utilizadas

### **Backend:**
- Node.js
- Express.js
- Sequelize (ORM)
- MySQL
- EJS (motor de plantillas)
- bcrypt (encriptación)
- express-session (sesiones)
- multer (carga de archivos)

### **Frontend:**
- HTML5
- CSS3
- JavaScript (Vanilla)
- Bootstrap 5
- LocalStorage

---

## 📝 Funcionalidades

### **Cliente (Frontend):**
- ✅ Pantalla de bienvenida con ingreso de nombre
- ✅ Visualización de productos por categoría (Suplementos y Pesas)
- ✅ Carrito de compras
- ✅ Generación de ticket
- ✅ Diseño responsive

### **Administrador (Panel EJS):**
- ✅ Login con autenticación
- ✅ Dashboard con listado de productos
- ✅ Alta de productos
- ✅ Edición de productos
- ✅ Baja lógica (activar/desactivar productos)
- ✅ Separación por tipo de producto

### **API (Backend):**
- ✅ CRUD completo de productos
- ✅ Gestión de usuarios
- ✅ Registro de ventas
- ✅ Relación muchos a muchos entre ventas y productos
- ✅ Validación de datos

---

## 🐛 Solución de Problemas

### **Error: "Access denied for user"**
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de que el usuario tenga permisos en la base de datos

### **Error: "Unknown database"**
- Crea la base de datos: `CREATE DATABASE papota_gym;`

### **Error: "Cannot find module"**
- Ejecuta `npm install` en la carpeta correspondiente

### **El frontend no muestra productos**
- Verifica que el backend esté corriendo
- Revisa la consola del navegador (F12) para ver errores de CORS
- Asegúrate de que haya productos activos en la base de datos

---

## 📚 Documentación Adicional

- **Variables de entorno:** Ver `back/.env.example`

---

## 📞 Contacto

Para dudas o problemas, contactar a los integrantes del equipo.

---

## 📄 Licencia

Este proyecto es parte de un trabajo práctico académico para Programación III - 2025 C2.




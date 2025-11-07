# 📚 Documentación Detallada del Código - Papota Gym

## 📋 Índice

- [Backend](#backend)
  - [Archivo Principal](#archivo-principal)
  - [Controladores](#controladores)
  - [Modelos](#modelos)
  - [Rutas](#rutas)
  - [Base de Datos](#base-de-datos)
  - [Vistas Admin](#vistas-admin)
- [Frontend](#frontend)
  - [Vistas HTML](#vistas-html)
  - [Scripts JavaScript](#scripts-javascript)
  - [Estilos CSS](#estilos-css)
- [Archivos de Configuración](#archivos-de-configuración)

---

# 🔧 BACKEND

## 📄 Archivo Principal

### `back/index.js`

**Propósito:** Punto de entrada del servidor backend. Configura Express, middlewares, rutas y conexión a la base de datos.

**¿Qué hace?**

1. **Carga Variables de Entorno:**
```javascript
require('dotenv').config();
```
- Lee el archivo `.env` para obtener configuración sensible (contraseñas, puertos, etc.)

2. **Configura Express:**
```javascript
const express = require("express");
const app = express();
```
- Crea la aplicación web

3. **Configura Middlewares:**
```javascript
app.use(express.json());                    // Parsea JSON en requests
app.use(express.urlencoded({ extended: true })); // Parsea formularios
app.use(cors({ origin: process.env.ORIGIN }));   // Permite CORS
```

4. **Configura Sesiones:**
```javascript
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 horas
}));
```
- Maneja sesiones de usuarios (para login del panel admin)

5. **Configura Motor de Plantillas:**
```javascript
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
```
- Usa EJS para renderizar vistas del panel admin

6. **Sirve Archivos Estáticos:**
```javascript
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```
- `/public` → CSS del admin
- `/uploads` → Imágenes de productos

7. **Registra Rutas:**
```javascript
app.use("/usuario", usuarioRoutes);
app.use("/productos", productosRoutes);
app.use("/ventas", ventasRoutes);
app.use("/admin", adminRoutes);
```

8. **Crea Usuario Admin Automáticamente:**
```javascript
async function crearUsuarioAdminSiNoExiste() {
    const adminExistente = await Usuario.findOne({ where: { correo: 'admin@papota.com' } });
    if (!adminExistente) {
        const contraseñaHasheada = await bcrypt.hash('admin123', 10);
        await Usuario.create({
            nombre: 'Admin',
            correo: 'admin@papota.com',
            contraseña: contraseñaHasheada
        });
    }
}
```
- Verifica si existe el usuario admin
- Si no existe, lo crea con contraseña hasheada

9. **Conecta a la Base de Datos e Inicia el Servidor:**
```javascript
sequelize.authenticate()
    .then(() => sequelize.sync({ alter: true }))
    .then(() => crearUsuarioAdminSiNoExiste())
    .then(() => {
        app.listen(process.env.PORT || 3000);
    });
```

**Flujo de Ejecución:**
```
1. Cargar .env
2. Configurar Express
3. Conectar a MySQL
4. Sincronizar modelos (crear/actualizar tablas)
5. Crear usuario admin si no existe
6. Iniciar servidor en puerto 3000
```

---

## 🎮 Controladores

### `back/controllers/productos.controller.js`

**Propósito:** Lógica de negocio para el CRUD de productos.

#### **Método: `listar(req, res)`**

**¿Qué hace?** Obtiene lista de productos con filtros opcionales.

**Parámetros de Query:**
- `q` → Busca en nombre o marca (parcial)
- `tipo` → Filtra por tipo_producto (Pesa | Suplemento)
- `marca` → Filtra por marca exacta

**Ejemplo de uso:**
```
GET /productos?q=proteina&tipo=Suplemento
```

**Código clave:**
```javascript
const where = {};
if (q) {
    where[Op.or] = [
        { nombre: { [Op.like]: `%${q}%` } },
        { marca:  { [Op.like]: `%${q}%` } }
    ];
}
if (tipo) where.tipo_producto = tipo;
if (marca) where.marca = marca;

const productos = await Producto.findAll({ where, order: [['id', 'ASC']] });
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Proteína Whey",
    "marca": "ENA",
    "precio": 15000,
    "tipo_producto": "Suplemento",
    "cantidad_gramos_ml": 1000,
    "peso": null,
    "activo": true,
    "imagen": "/uploads/proteina.jpg"
  }
]
```

---

#### **Método: `obtenerPorId(req, res)`**

**¿Qué hace?** Obtiene un producto específico por su ID.

**Parámetros:**
- `req.params.id` → ID del producto

**Ejemplo:**
```
GET /productos/5
```

**Código:**
```javascript
const id = Number(req.params.id);
const prod = await Producto.findByPk(id);
if (prod) {
    return res.status(200).json(prod);
} else {
    return res.status(404).json({ error: 'Producto no encontrado' });
}
```

---

#### **Método: `crear(req, res)`**

**¿Qué hace?** Crea un nuevo producto.

**Body esperado:**
```json
{
  "nombre": "Creatina",
  "marca": "ENA",
  "precio": 8000,
  "tipo_producto": "Suplemento",
  "cantidad_gramos_ml": 300
}
```

**Lógica importante:**
```javascript
// Regla de consistencia por tipo:
let _peso = null, _cantidad = null;
if (tipo_producto === 'Pesa') {
    _peso = Number(peso ?? 0);
    _cantidad = null;  // Las pesas NO tienen cantidad_gramos_ml
}
if (tipo_producto === 'Suplemento') {
    _cantidad = Number(cantidad_gramos_ml ?? 0);
    _peso = null;  // Los suplementos NO tienen peso
}
```

**¿Por qué?** Porque el modelo usa **Single Table Inheritance** (una tabla para dos tipos de productos).

---

#### **Método: `actualizar(req, res)`**

**¿Qué hace?** Actualiza un producto existente.

**Ejemplo:**
```
PUT /productos/5
Body: { "precio": 9000 }
```

**Lógica:**
```javascript
// Mantiene valores actuales si no llegan en el body
let changes = {
    nombre: nombre ?? prod.nombre,
    marca:  marca  ?? prod.marca,
    precio: (precio == null ? prod.precio : Number(precio)),
    tipo_producto: tipo_producto ?? prod.tipo_producto
};

// Reaplica regla de consistencia
if (changes.tipo_producto === 'Pesa') {
    changes.peso = (peso === undefined ? prod.peso : Number(peso));
    changes.cantidad_gramos_ml = null;
} else {
    changes.cantidad_gramos_ml = (cantidad_gramos_ml === undefined ? prod.cantidad_gramos_ml : Number(cantidad_gramos_ml));
    changes.peso = null;
}
```

---

#### **Método: `cambiarEstado(req, res)`**

**¿Qué hace?** **NADA** - No está implementado.

**Código:**
```javascript
async cambiarEstado(req, res) {
    return res.status(501).json({ 
        error: 'Ruta no implementada: el modelo Producto no tiene "estado"' 
    });
}
```

**⚠️ Problema:** La ruta existe pero no funciona. Debería implementarse o eliminarse.

---

### `back/controllers/ventas.controller.js`

**Propósito:** Maneja el registro y consulta de ventas.

#### **Método: `registrarVenta(req, res)`**

**¿Qué hace?** Registra una venta completa con sus detalles.

**Body esperado:**
```json
{
  "nombreCliente": "Juan Pérez",
  "carritoDeCompras": [
    {
      "producto": {
        "id": 1,
        "nombre": "Proteína Whey",
        "precio": 15000
      },
      "cantidad": 2
    },
    {
      "producto": {
        "id": 3,
        "nombre": "Creatina",
        "precio": 8000
      },
      "cantidad": 1
    }
  ]
}
```

**Flujo de ejecución:**

1. **Valida datos:**
```javascript
if (!nombreCliente || !carritoDeCompras || carritoDeCompras.length === 0) {
    return res.status(400).json({ error: 'Datos de venta incompletos' });
}
```

2. **Calcula totales:**
```javascript
for (const item of carritoDeCompras) {
    const subtotal = item.cantidad * item.producto.precio;
    precioTotalCalculado += subtotal;
    
    detallesDeVenta.push({
        ProductoId: item.producto.id,
        cantidadProducto: item.cantidad,
        precioUnitario: item.producto.precio,
        subtotal: subtotal
    });
}
```

3. **Crea la venta:**
```javascript
const nuevaVenta = await Venta.create({
    nombreCliente: nombreCliente,
    fecha: new Date(),
    precioTotal: precioTotalCalculado
});
```

4. **Crea los detalles:**
```javascript
const detallesFinales = detallesDeVenta.map(detalle => ({
    ...detalle,
    VentumId: nuevaVenta.id  // Relaciona con la venta
}));

await DetalleVenta.bulkCreate(detallesFinales);
```

**Respuesta:**
```json
{
  "id": 15,
  "nombreCliente": "Juan Pérez",
  "fecha": "2024-11-07T10:30:00.000Z",
  "precioTotal": 38000
}
```

---

#### **Método: `listarVentasDetalle(req, res)`**

**¿Qué hace?** Lista todas las ventas con sus productos.

**Ejemplo:**
```
GET /ventas
```

**Código con JOIN:**
```javascript
const ventas = await Venta.findAll({
    include: [{
        model: Producto,
        as: 'Productos',
        through: {
            model: DetalleVenta,
            attributes: ['cantidadProducto', 'precioUnitario', 'subtotal']
        }
    }],
    order: [['fecha', 'DESC']]
});
```

**Respuesta:**
```json
[
  {
    "id": 15,
    "nombreCliente": "Juan Pérez",
    "fecha": "2024-11-07T10:30:00.000Z",
    "precioTotal": 38000,
    "Productos": [
      {
        "id": 1,
        "nombre": "Proteína Whey",
        "precio": 15000,
        "DetalleVentum": {
          "cantidadProducto": 2,
          "precioUnitario": 15000,
          "subtotal": 30000
        }
      }
    ]
  }
]
```

---

### `back/controllers/usuario.controller.js`

**Propósito:** CRUD básico de usuarios.

**⚠️ PROBLEMA CRÍTICO:** Este controlador **NO hashea las contraseñas**.

#### **Método: `crear(req, res)`**

**¿Qué hace?** Crea un usuario.

**Body esperado:**
```json
{
  "nombreUsuario": "juan",
  "contraseña": "123456"
}
```

**Código actual (INSEGURO):**
```javascript
const user = await Usuario.create({ nombreUsuario, contraseña });
```

**❌ Problema:** Guarda la contraseña en **texto plano**.

**✅ Debería ser:**
```javascript
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(contraseña, 10);
const user = await Usuario.create({ 
    nombreUsuario, 
    contraseña: hashedPassword 
});
```

---

#### **Método: `listar(req, res)`**

**¿Qué hace?** Lista todos los usuarios (sin contraseñas).

**Código:**
```javascript
const usuarios = await Usuario.findAll({
    attributes: ['id', 'nombreUsuario']  // NO incluye contraseña
});
```

---

### `back/controllers/admin.controller.js`

**Propósito:** Controlador del panel de administración.

#### **Método: `mostrarLogin(req, res)`**

**¿Qué hace?** Renderiza la página de login.

**Código:**
```javascript
res.render('admin/login', { error: null });
```

**Renderiza:** `back/views/admin/login.ejs`

---

#### **Método: `procesarLogin(req, res)`**

**¿Qué hace?** Valida credenciales y crea sesión.

**Body esperado:**
```json
{
  "correo": "admin@papota.com",
  "contraseña": "admin123"
}
```

**Flujo:**

1. **Busca usuario:**
```javascript
const usuario = await Usuario.findOne({ where: { correo } });
if (!usuario) {
    return res.render('admin/login', { 
        error: 'Correo o contraseña incorrectos' 
    });
}
```

2. **Verifica contraseña:**
```javascript
const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
if (!contraseñaValida) {
    return res.render('admin/login', { 
        error: 'Correo o contraseña incorrectos' 
    });
}
```

3. **Crea sesión:**
```javascript
req.session.usuarioId = usuario.id;
req.session.usuarioNombre = usuario.nombre;
res.redirect('/admin/dashboard');
```

---

#### **Método: `logout(req, res)`**

**¿Qué hace?** Cierra la sesión.

**Código:**
```javascript
req.session.destroy((err) => {
    res.redirect('/admin/login');
});
```

---

#### **Método: `mostrarDashboard(req, res)`**

**¿Qué hace?** Muestra el panel principal con productos.

**Código:**
```javascript
const productos = await Producto.findAll();

const suplementos = productos.filter(p => p.tipo_producto === 'Suplemento');
const pesas = productos.filter(p => p.tipo_producto === 'Pesa');

res.render('admin/dashboard', {
    usuario: { nombre: req.session.usuarioNombre },
    suplementos,
    pesas,
    mensaje: req.query.mensaje || null
});
```

**Renderiza:** `back/views/admin/dashboard.ejs`

---

#### **Método: `mostrarFormulario(req, res)`**

**¿Qué hace?** Muestra formulario para crear/editar producto.

**Código:**
```javascript
const { id } = req.params;
let producto = null;

if (id) {
    // Modo edición
    producto = await Producto.findByPk(id);
}

res.render('admin/producto-form', {
    usuario: { nombre: req.session.usuarioNombre },
    producto,
    esEdicion: !!id
});
```

**Rutas:**
- `/admin/producto/nuevo` → Crear
- `/admin/producto/editar/5` → Editar producto ID 5

---

#### **Método: `guardarProducto(req, res)`**

**¿Qué hace?** Crea o actualiza un producto.

**Body:**
```javascript
const { nombre, marca, precio, tipo_producto, peso, cantidad_gramos_ml, imagen } = req.body;
```

**Lógica:**
```javascript
const datosProducto = {
    nombre,
    marca,
    precio: parseFloat(precio),
    tipo_producto,
    peso: tipo_producto === 'Pesa' ? parseFloat(peso) : null,
    cantidad_gramos_ml: tipo_producto === 'Suplemento' ? parseInt(cantidad_gramos_ml) : null,
    imagen: imagen || null,
    activo: true
};

if (id) {
    // Actualizar
    await Producto.update(datosProducto, { where: { id } });
} else {
    // Crear
    await Producto.create(datosProducto);
}

res.redirect('/admin/dashboard?mensaje=Producto guardado');
```

---

#### **Método: `cambiarEstado(req, res)`**

**¿Qué hace?** Activa o desactiva un producto.

**Body:**
```json
{
  "activo": "true"  // o "false"
}
```

**Código:**
```javascript
await Producto.update(
    { activo: activo === 'true' },
    { where: { id } }
);

const mensaje = activo === 'true' 
    ? 'Producto activado correctamente' 
    : 'Producto desactivado correctamente';

res.redirect(`/admin/dashboard?mensaje=${mensaje}`);
```

---

## 🗄️ Modelos

### `back/models/productos.js`

**Propósito:** Define la estructura de la tabla `producto`.

**Estrategia:** **Single Table Inheritance** (una tabla para Pesas y Suplementos).

**Campos:**

```javascript
{
    id: INTEGER (PK, AUTO_INCREMENT),
    
    // COMUNES A TODOS
    nombre: TEXT (NOT NULL),
    marca: TEXT (NOT NULL),
    precio: FLOAT (NOT NULL),
    
    // DISCRIMINADOR
    tipo_producto: ENUM('Pesa', 'Suplemento') (NOT NULL),
    
    // VARIABLES (NULLABLE)
    peso: FLOAT (NULL),                    // Solo para Pesas
    cantidad_gramos_ml: FLOAT (NULL),      // Solo para Suplementos
    
    // ADICIONALES
    activo: BOOLEAN (DEFAULT true),
    imagen: TEXT (NULL)
}
```

**Ejemplo de registros:**

| id | nombre | marca | precio | tipo_producto | peso | cantidad_gramos_ml | activo |
|----|--------|-------|--------|---------------|------|-------------------|--------|
| 1 | Proteína Whey | ENA | 15000 | Suplemento | NULL | 1000 | true |
| 2 | Mancuerna 10kg | Rogue | 8000 | Pesa | 10 | NULL | true |

**¿Por qué NULL?**
- Las **Pesas** tienen `peso` pero NO tienen `cantidad_gramos_ml`
- Los **Suplementos** tienen `cantidad_gramos_ml` pero NO tienen `peso`

---

### `back/models/usuario.js`

**Propósito:** Define la tabla `usuario`.

**Campos:**

```javascript
{
    id: INTEGER (PK, AUTO_INCREMENT),
    nombre: TEXT (NOT NULL),
    correo: STRING (NOT NULL, UNIQUE),
    contraseña: TEXT (NOT NULL)
}
```

**⚠️ Inconsistencia:**
- El **modelo** tiene: `nombre`, `correo`, `contraseña`
- El **controlador** espera: `nombreUsuario`, `contraseña`

**Ejemplo de registro:**

| id | nombre | correo | contraseña |
|----|--------|--------|------------|
| 1 | Admin | admin@papota.com | $2b$10$... (hash bcrypt) |

---

### `back/models/ventas.js`

**Propósito:** Define la tabla `venta`.

**Campos:**

```javascript
{
    id: INTEGER (PK, AUTO_INCREMENT),
    nombreCliente: TEXT (NOT NULL),
    fecha: DATE (NOT NULL),
    precioTotal: FLOAT (NOT NULL)
}
```

**Ejemplo:**

| id | nombreCliente | fecha | precioTotal |
|----|---------------|-------|-------------|
| 1 | Juan Pérez | 2024-11-07 10:30:00 | 38000 |

---

### `back/models/detalleVenta.js`

**Propósito:** Tabla intermedia para la relación N:M entre Venta y Producto.

**Campos:**

```javascript
{
    id: INTEGER (PK, AUTO_INCREMENT),
    VentumId: INTEGER (FK → venta.id),
    ProductoId: INTEGER (FK → producto.id),
    cantidadProducto: INTEGER (NOT NULL),
    precioUnitario: FLOAT (NOT NULL),
    subtotal: FLOAT (NOT NULL)
}
```

**⚠️ Nota:** `VentumId` es el nombre que Sequelize genera automáticamente (plural latino de Venta).

**Ejemplo:**

| id | VentumId | ProductoId | cantidadProducto | precioUnitario | subtotal |
|----|----------|------------|------------------|----------------|----------|
| 1 | 1 | 1 | 2 | 15000 | 30000 |
| 2 | 1 | 3 | 1 | 8000 | 8000 |

**Significado:** En la venta #1, se compraron 2 unidades del producto #1 y 1 unidad del producto #3.

---

### `back/models/relaciones.js`

**Propósito:** Define las relaciones entre modelos.

**Código:**

```javascript
// Relación N:M entre Venta y Producto
Venta.belongsToMany(Producto, { 
    through: DetalleVenta,
    foreignKey: 'VentumId',
    as: 'Productos'
});

Producto.belongsToMany(Venta, { 
    through: DetalleVenta,
    foreignKey: 'ProductoId',
    as: 'Ventas'
});
```

**Diagrama:**

```
Venta (1) ←→ (N) DetalleVenta (N) ←→ (1) Producto

Venta:
  - id
  - nombreCliente
  - fecha
  - precioTotal

DetalleVenta:
  - VentumId (FK)
  - ProductoId (FK)
  - cantidadProducto
  - precioUnitario
  - subtotal

Producto:
  - id
  - nombre
  - precio
  - ...
```

**Permite hacer:**
```javascript
// Obtener productos de una venta
const venta = await Venta.findByPk(1, {
    include: [{ model: Producto, as: 'Productos' }]
});

// Obtener ventas de un producto
const producto = await Producto.findByPk(1, {
    include: [{ model: Venta, as: 'Ventas' }]
});
```

---

## 🛣️ Rutas

### `back/routes/productos.routes.js`

**Propósito:** Define endpoints de la API de productos.

**Rutas:**

```javascript
GET    /productos           → listar()
GET    /productos/:id       → obtenerPorId()
POST   /productos           → crear()
PUT    /productos/:id       → actualizar()
PATCH  /productos/:id/estado → cambiarEstado()
```

**Ejemplos de uso:**

```bash
# Listar todos los productos
curl http://localhost:3000/productos

# Buscar suplementos
curl http://localhost:3000/productos?tipo=Suplemento

# Obtener producto específico
curl http://localhost:3000/productos/5

# Crear producto
curl -X POST http://localhost:3000/productos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Creatina",
    "marca": "ENA",
    "precio": 8000,
    "tipo_producto": "Suplemento",
    "cantidad_gramos_ml": 300
  }'

# Actualizar precio
curl -X PUT http://localhost:3000/productos/5 \
  -H "Content-Type: application/json" \
  -d '{ "precio": 9000 }'
```

---

### `back/routes/ventas.routes.js`

**Propósito:** Endpoints para ventas.

**Rutas:**

```javascript
POST /ventas     → registrarVenta()
GET  /ventas     → listarVentasDetalle()
```

**Ejemplo:**

```bash
# Registrar venta
curl -X POST http://localhost:3000/ventas \
  -H "Content-Type: application/json" \
  -d '{
    "nombreCliente": "Juan Pérez",
    "carritoDeCompras": [
      {
        "producto": { "id": 1, "nombre": "Proteína", "precio": 15000 },
        "cantidad": 2
      }
    ]
  }'

# Listar ventas
curl http://localhost:3000/ventas
```

---

### `back/routes/usuario.routes.js`

**Propósito:** Endpoints para usuarios.

**Rutas:**

```javascript
POST /usuario    → crear()
GET  /usuario    → listar()
```

---

### `back/routes/admin.routes.js`

**Propósito:** Rutas del panel de administración.

**Middleware de autenticación:**

```javascript
function verificarAutenticacion(req, res, next) {
    if (req.session && req.session.usuarioId) {
        return next();  // Usuario logueado, continuar
    }
    res.redirect('/admin/login');  // No logueado, redirigir a login
}
```

**Rutas públicas (sin autenticación):**

```javascript
GET  /admin/login         → mostrarLogin()
POST /admin/login         → procesarLogin()
GET  /admin/logout        → logout()
```

**Rutas protegidas (requieren login):**

```javascript
GET  /admin/dashboard                    → mostrarDashboard()
GET  /admin/producto/nuevo               → mostrarFormulario()
GET  /admin/producto/editar/:id          → mostrarFormulario()
POST /admin/producto/guardar             → guardarProducto()
POST /admin/producto/guardar/:id         → guardarProducto()
POST /admin/producto/:id/cambiar-estado  → cambiarEstado()
```

**Flujo de autenticación:**

```
Usuario → /admin/dashboard
         ↓
    ¿Tiene sesión?
    ├─ SÍ → Mostrar dashboard
    └─ NO → Redirigir a /admin/login
```

---

## 🗄️ Base de Datos

### `back/db/sequelize.js`

**Propósito:** Configura la conexión a MySQL usando Sequelize.

**Código:**

```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.STRING_DB, {
    dialect: 'mysql',
    logging: false  // No mostrar queries SQL en consola
});

module.exports = sequelize;
```

**Variable de entorno:**
```env
STRING_DB=mysql://root:password@localhost:3306/papota_gym
```

**Formato:**
```
mysql://usuario:contraseña@host:puerto/nombre_base_datos
```

**¿Qué hace Sequelize?**
- ORM (Object-Relational Mapping)
- Convierte objetos JavaScript en queries SQL
- Maneja conexiones automáticamente
- Sincroniza modelos con tablas

**Ejemplo:**
```javascript
// JavaScript
await Producto.findAll({ where: { tipo_producto: 'Pesa' } });

// SQL generado
SELECT * FROM producto WHERE tipo_producto = 'Pesa';
```

---

## 🎨 Vistas Admin

### `back/views/admin/login.ejs`

**Propósito:** Página de inicio de sesión del panel admin.

**Tecnología:** EJS (Embedded JavaScript Templates)

**Estructura:**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Login - Panel Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
</head>
<body>
    <div class="login-card">
        <div class="login-header">
            <h2>Panel de Administración</h2>
            <p>Papota Gym</p>
        </div>
        
        <div class="login-body">
            <!-- Mostrar error si existe -->
            <% if (error) { %>
                <div class="alert alert-danger"><%= error %></div>
            <% } %>
            
            <!-- Formulario de login -->
            <form method="POST" action="/admin/login">
                <input type="email" name="correo" placeholder="Correo" required>
                <input type="password" name="contraseña" placeholder="Contraseña" required>
                <button type="submit">Iniciar Sesión</button>
            </form>
        </div>
    </div>
</body>
</html>
```

**Variables EJS:**
- `error` → Mensaje de error (null si no hay error)

**Flujo:**
1. Usuario ingresa correo y contraseña
2. Form hace POST a `/admin/login`
3. Si es correcto → Redirige a `/admin/dashboard`
4. Si es incorrecto → Recarga con mensaje de error

---

### `back/views/admin/dashboard.ejs`

**Propósito:** Panel principal con lista de productos.

**Variables EJS:**
- `usuario` → `{ nombre: 'Admin' }`
- `suplementos` → Array de productos tipo Suplemento
- `pesas` → Array de productos tipo Pesa
- `mensaje` → Mensaje de éxito/error (opcional)

**Estructura:**

```html
<div class="dashboard">
    <!-- Header -->
    <header>
        <h1>Bienvenido, <%= usuario.nombre %></h1>
        <a href="/admin/logout">Cerrar Sesión</a>
    </header>
    
    <!-- Mensaje de éxito -->
    <% if (mensaje) { %>
        <div class="alert alert-success"><%= mensaje %></div>
    <% } %>
    
    <!-- Sección Suplementos -->
    <section>
        <h2>Suplementos</h2>
        <a href="/admin/producto/nuevo" class="btn btn-primary">Nuevo Producto</a>
        
        <table>
            <thead>
                <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Marca</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <% suplementos.forEach(producto => { %>
                    <tr class="<%= producto.activo ? '' : 'inactivo' %>">
                        <td>
                            <img src="<%= producto.imagen || '/imgs/logo.png' %>" 
                                 alt="<%= producto.nombre %>">
                        </td>
                        <td><%= producto.nombre %></td>
                        <td><%= producto.marca %></td>
                        <td>$<%= producto.precio %></td>
                        <td><%= producto.cantidad_gramos_ml %> gr/ml</td>
                        <td>
                            <span class="badge <%= producto.activo ? 'bg-success' : 'bg-secondary' %>">
                                <%= producto.activo ? 'Activo' : 'Inactivo' %>
                            </span>
                        </td>
                        <td>
                            <!-- Botón Editar -->
                            <a href="/admin/producto/editar/<%= producto.id %>" 
                               class="btn btn-sm btn-warning">
                                <i class="bi bi-pencil"></i> Editar
                            </a>
                            
                            <!-- Botón Activar/Desactivar -->
                            <form method="POST" 
                                  action="/admin/producto/<%= producto.id %>/cambiar-estado" 
                                  style="display:inline">
                                <input type="hidden" name="activo" 
                                       value="<%= !producto.activo %>">
                                <button class="btn btn-sm <%= producto.activo ? 'btn-danger' : 'btn-success' %>">
                                    <i class="bi bi-<%= producto.activo ? 'eye-slash' : 'eye' %>"></i>
                                    <%= producto.activo ? 'Desactivar' : 'Activar' %>
                                </button>
                            </form>
                        </td>
                    </tr>
                <% }) %>
            </tbody>
        </table>
    </section>
    
    <!-- Sección Pesas (similar) -->
    <section>
        <h2>Pesas</h2>
        <!-- ... similar a Suplementos ... -->
    </section>
</div>
```

**Características:**
- Muestra productos separados por tipo
- Botones para crear, editar, activar/desactivar
- Indicador visual de estado (activo/inactivo)
- Imágenes con fallback al logo

---

### `back/views/admin/producto-form.ejs`

**Propósito:** Formulario para crear/editar productos.

**Variables EJS:**
- `usuario` → `{ nombre: 'Admin' }`
- `producto` → Objeto producto (null si es nuevo)
- `esEdicion` → true si es edición, false si es nuevo

**Estructura:**

```html
<div class="form-container">
    <h1><%= esEdicion ? 'Editar Producto' : 'Nuevo Producto' %></h1>
    
    <form method="POST" 
          action="/admin/producto/guardar<%= esEdicion ? '/' + producto.id : '' %>">
        
        <!-- Nombre -->
        <div class="form-group">
            <label>Nombre</label>
            <input type="text" name="nombre" 
                   value="<%= producto ? producto.nombre : '' %>" 
                   required>
        </div>
        
        <!-- Marca -->
        <div class="form-group">
            <label>Marca</label>
            <input type="text" name="marca" 
                   value="<%= producto ? producto.marca : '' %>" 
                   required>
        </div>
        
        <!-- Precio -->
        <div class="form-group">
            <label>Precio</label>
            <input type="number" name="precio" step="0.01"
                   value="<%= producto ? producto.precio : '' %>" 
                   required>
        </div>
        
        <!-- Tipo de Producto -->
        <div class="form-group">
            <label>Tipo de Producto</label>
            <select name="tipo_producto" id="tipo_producto" required>
                <option value="Suplemento" 
                        <%= producto && producto.tipo_producto === 'Suplemento' ? 'selected' : '' %>>
                    Suplemento
                </option>
                <option value="Pesa" 
                        <%= producto && producto.tipo_producto === 'Pesa' ? 'selected' : '' %>>
                    Pesa
                </option>
            </select>
        </div>
        
        <!-- Campos dinámicos según tipo -->
        <div id="campos-suplemento" style="display: none;">
            <div class="form-group">
                <label>Cantidad (gr/ml)</label>
                <input type="number" name="cantidad_gramos_ml" 
                       value="<%= producto ? producto.cantidad_gramos_ml : '' %>">
            </div>
        </div>
        
        <div id="campos-pesa" style="display: none;">
            <div class="form-group">
                <label>Peso (kg)</label>
                <input type="number" name="peso" step="0.01"
                       value="<%= producto ? producto.peso : '' %>">
            </div>
        </div>
        
        <!-- URL de Imagen -->
        <div class="form-group">
            <label>URL de Imagen (opcional)</label>
            <input type="text" name="imagen" 
                   value="<%= producto ? producto.imagen : '' %>">
        </div>
        
        <!-- Botones -->
        <div class="form-actions">
            <button type="submit" class="btn btn-primary">
                <%= esEdicion ? 'Actualizar' : 'Crear' %> Producto
            </button>
            <a href="/admin/dashboard" class="btn btn-secondary">Cancelar</a>
        </div>
    </form>
</div>

<script>
    // Mostrar/ocultar campos según tipo de producto
    const tipoSelect = document.getElementById('tipo_producto');
    const camposSuplemento = document.getElementById('campos-suplemento');
    const camposPesa = document.getElementById('campos-pesa');
    
    function actualizarCampos() {
        if (tipoSelect.value === 'Suplemento') {
            camposSuplemento.style.display = 'block';
            camposPesa.style.display = 'none';
        } else {
            camposSuplemento.style.display = 'none';
            camposPesa.style.display = 'block';
        }
    }
    
    tipoSelect.addEventListener('change', actualizarCampos);
    actualizarCampos(); // Ejecutar al cargar
</script>
```

**Lógica JavaScript:**
- Muestra campos diferentes según el tipo de producto seleccionado
- Si es Suplemento → muestra campo "Cantidad (gr/ml)"
- Si es Pesa → muestra campo "Peso (kg)"

---

# 🎨 FRONTEND

## 📄 Vistas HTML

### `front/views/bienvenida.html`

**Propósito:** Página de inicio donde el usuario ingresa su nombre.

**Estructura:**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Bienvenida - Papota Gym</title>
    <link rel="stylesheet" href="../style/bienvenida.css">
</head>
<body>
    <div class="container">
        <img src="../imgs/logo.png" alt="Papota Gym">
        <h1>Bienvenido a Papota Gym</h1>
        
        <form id="form-bienvenida">
            <input type="text" 
                   id="nombre-usuario" 
                   placeholder="Ingresa tu nombre" 
                   required>
            <button type="submit">Continuar</button>
        </form>
    </div>
    
    <script src="../scripts/bienvenida.js"></script>
</body>
</html>
```

**Flujo:**
1. Usuario ingresa su nombre
2. JavaScript guarda en localStorage
3. Redirige a `productos.html`

---

### `front/views/productos.html`

**Propósito:** Catálogo de productos con dos filas (Suplementos y Pesas).

**Estructura:**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Productos - Papota Gym</title>
    <link rel="stylesheet" href="../style/productos.css">
</head>
<body>
    <header>
        <img src="../imgs/logo_chico.png" alt="Papota Gym">
        <h1>Catálogo de Productos</h1>
        <a href="carrito.html" class="btn-carrito">
            🛒 Ver Carrito
        </a>
    </header>
    
    <main>
        <!-- Fila A: Suplementos -->
        <section>
            <h2>Suplementos</h2>
            <div id="filaA" class="productos-grid">
                <!-- Se llena dinámicamente con JavaScript -->
            </div>
        </section>
        
        <!-- Fila B: Pesas -->
        <section>
            <h2>Pesas</h2>
            <div id="filaB" class="productos-grid">
                <!-- Se llena dinámicamente con JavaScript -->
            </div>
        </section>
    </main>
    
    <script type="module" src="../scripts/main.js"></script>
</body>
</html>
```

**Carga dinámica:**
- JavaScript hace `fetch` a `http://localhost:3000/productos`
- Separa productos por tipo
- Crea cards HTML para cada producto
- Los inserta en `#filaA` y `#filaB`

---

### `front/views/carrito.html`

**Propósito:** Muestra el carrito de compras.

**Estructura:**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Carrito - Papota Gym</title>
    <link rel="stylesheet" href="../style/carrito.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
</head>
<body>
    <div class="container">
        <h1>Tu Carrito de Compras</h1>
        
        <table class="table">
            <thead>
                <tr>
                    <th>Imagen</th>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="carrito-body">
                <!-- Se llena dinámicamente -->
            </tbody>
        </table>
        
        <div class="total">
            <h3>Total: $<span id="total-general">0</span></h3>
        </div>
        
        <div class="acciones">
            <a href="productos.html" class="btn btn-secondary">Seguir Comprando</a>
            <button id="btn-confirmar" class="btn btn-success">Confirmar Compra</button>
        </div>
    </div>
    
    <!-- Modal de Confirmación -->
    <div class="modal" id="confirmModal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5>Confirmar Compra</h5>
                </div>
                <div class="modal-body">
                    <p>Total a pagar: $<span id="total-modal">0</span></p>
                    <p>¿Deseas confirmar la compra?</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button id="btn-modal-confirmar" class="btn btn-success">Confirmar</button>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../scripts/carrito.js"></script>
</body>
</html>
```

**Funcionalidades:**
- Muestra productos del localStorage
- Permite cambiar cantidades
- Permite eliminar productos
- Calcula total automáticamente
- Modal de confirmación antes de comprar

---

### `front/views/ticket.html`

**Propósito:** Muestra el ticket de compra después de confirmar.

**Estructura:**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Ticket - Papota Gym</title>
    <link rel="stylesheet" href="../style/ticket.css">
</head>
<body>
    <div class="ticket-container">
        <div class="ticket">
            <img src="../imgs/logo.png" alt="Papota Gym">
            <h1>¡Gracias por tu compra!</h1>
            
            <div class="ticket-info">
                <p><strong>Cliente:</strong> <span id="nombre-cliente"></span></p>
                <p><strong>Fecha:</strong> <span id="fecha-compra"></span></p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody id="ticket-body">
                    <!-- Se llena dinámicamente -->
                </tbody>
            </table>
            
            <div class="ticket-total">
                <h3>TOTAL: $<span id="ticket-total">0</span></h3>
            </div>
            
            <div class="ticket-actions">
                <button onclick="window.print()" class="btn btn-primary">Imprimir</button>
                <a href="productos.html" class="btn btn-secondary">Nueva Compra</a>
            </div>
        </div>
    </div>
    
    <script src="../scripts/ticket.js"></script>
</body>
</html>
```

**Datos:**
- Lee del localStorage el último carrito
- Muestra nombre del cliente
- Lista productos comprados
- Muestra total
- Permite imprimir

---

## 📜 Scripts JavaScript

### `front/scripts/bienvenida.js`

**Propósito:** Maneja el formulario de bienvenida.

**Código:**

```javascript
document.getElementById('form-bienvenida').addEventListener('submit', (e) => {
    e.preventDefault();  // Evitar envío del form
    
    const nombre = document.getElementById('nombre-usuario').value.trim();
    
    if (nombre) {
        // Guardar en localStorage
        localStorage.setItem('nombreUsuarioPapota', nombre);
        
        // Redirigir a productos
        window.location.href = './productos.html';
    } else {
        alert('Por favor ingresa tu nombre');
    }
});
```

**Flujo:**
1. Usuario escribe su nombre
2. Click en "Continuar"
3. Guarda nombre en localStorage
4. Redirige a productos.html

---

### `front/scripts/main.js`

**Propósito:** Carga productos desde la API y los muestra.

**Código completo:**

```javascript
import { Producto } from "./producto.js";

const rutaProductos = "http://localhost:3000/productos";
const maxProductos = 10;

async function traerProductos() {
    try {
        // 1. Fetch a la API
        const res = await fetch(rutaProductos);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const productos = await res.json();
        
        // 2. Obtener contenedores HTML
        const contenedorA = document.getElementById("filaA");
        const contenedorB = document.getElementById("filaB");
        if (!contenedorA || !contenedorB) return;
        
        // 3. Normalizar y filtrar
        const norm = s => (s ?? '').toString().trim().toLowerCase();
        const filaA = productos
            .filter(p => norm(p.tipo_producto) === 'suplemento')
            .slice(0, maxProductos);
        const filaB = productos
            .filter(p => norm(p.tipo_producto) === 'pesa')
            .slice(0, maxProductos);
        
        // 4. Crear cards para Suplementos
        filaA.forEach(p => {
            const productoINST = new Producto(
                p.id, 
                p.nombre, 
                p.precio, 
                p.imagen ?? null
            );
            const cardElement = productoINST.crearCard();
            contenedorA.appendChild(cardElement);
        });
        
        // 5. Crear cards para Pesas
        filaB.forEach(p => {
            const productoINST = new Producto(
                p.id, 
                p.nombre, 
                p.precio, 
                p.imagen ?? null
            );
            const cardElement = productoINST.crearCard();
            contenedorB.appendChild(cardElement);
        });
        
        // 6. Inicializar eventos de los botones
        Producto.inicializarEventos();
        
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

// Ejecutar al cargar la página
traerProductos();
```

**Flujo:**
```
1. Hacer fetch a /productos
2. Recibir JSON con productos
3. Separar por tipo (Suplemento/Pesa)
4. Crear instancias de clase Producto
5. Generar HTML de cada card
6. Insertar en contenedores
7. Activar eventos de botones
```

---

### `front/scripts/producto.js`

**Propósito:** Clase que representa un producto y maneja el carrito.

**Código completo:**

```javascript
export class Producto {
    constructor(id = null, nombre = null, precio = null, img = null) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.img = img || 'https://via.placeholder.com/300x200?text=Producto';
    }
    
    /**
     * Método estático para actualizar el carrito
     * @param {Producto} producto - Producto a agregar/actualizar
     * @param {number} cantidad - Nueva cantidad
     */
    static actualizarCarrito(producto, cantidad) {
        // 1. Obtener carrito actual
        let carritoDeCompras = JSON.parse(
            localStorage.getItem("carritoDeCompras")
        ) ?? [];
        
        const nuevaCantidad = cantidad;
        
        // 2. Buscar si el producto ya está en el carrito
        const itemEncontradoIndex = carritoDeCompras.findIndex(
            item => item.producto.id === producto.id
        );
        
        if (itemEncontradoIndex !== -1) {
            // 3a. Si existe, actualizar cantidad
            carritoDeCompras[itemEncontradoIndex].cantidad = nuevaCantidad;
        } else {
            // 3b. Si no existe, agregar nuevo
            carritoDeCompras.push({
                producto: producto,
                cantidad: nuevaCantidad
            });
        }
        
        // 4. Guardar en localStorage
        localStorage.setItem(
            "carritoDeCompras", 
            JSON.stringify(carritoDeCompras)
        );
    }
    
    /**
     * Crea el HTML de una card de producto
     * @returns {HTMLElement} Elemento div con la card
     */
    crearCard() {
        // 1. Crear contenedor principal
        const card = document.createElement('div');
        card.className = 'card';
        
        // 2. Crear imagen
        const img = document.createElement('img');
        img.src = this.img;
        img.alt = this.nombre;
        
        // 3. Crear cuerpo de la card
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        // 4. Crear título
        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = this.nombre;
        
        // 5. Crear precio
        const price = document.createElement('p');
        price.className = 'card-text';
        price.textContent = `$${this.precio}`;
        
        // 6. Crear input de cantidad
        const input = document.createElement('input');
        input.type = 'number';
        input.value = '0';
        input.min = '0';
        
        // 7. Crear botón
        const button = document.createElement('button');
        button.className = 'btn-actualizar';
        button.textContent = 'Actualizar';
        
        // 8. Guardar datos del producto en el botón
        button.dataset.producto = JSON.stringify(this);
        
        // 9. Ensamblar elementos
        cardBody.appendChild(title);
        cardBody.appendChild(price);
        cardBody.appendChild(input);
        cardBody.appendChild(button);
        
        card.appendChild(img);
        card.appendChild(cardBody);
        
        return card;
    }
    
    /**
     * Inicializa eventos de todos los botones "Actualizar"
     */
    static inicializarEventos() {
        const botonesActualizar = document.getElementsByClassName('btn-actualizar');
        
        Array.from(botonesActualizar).forEach(boton => {
            boton.addEventListener('click', (event) => {
                const botonPresionado = event.currentTarget;
                
                // 1. Obtener datos del producto desde el botón
                const productoJSON = botonPresionado.dataset.producto;
                const producto = JSON.parse(productoJSON);
                
                // 2. Obtener cantidad del input
                const cardElement = botonPresionado.closest('.card');
                const inputCantidad = cardElement.querySelector('input[type="number"]');
                const cantidad = parseInt(inputCantidad.value) || 0;
                
                // 3. Actualizar carrito
                Producto.actualizarCarrito(producto, cantidad);
                
                // 4. Feedback visual (opcional)
                alert(`${producto.nombre} actualizado en el carrito`);
            });
        });
    }
}
```

**Estructura del localStorage:**

```javascript
// carritoDeCompras
[
    {
        producto: {
            id: 1,
            nombre: "Proteína Whey",
            precio: 15000,
            img: "/uploads/proteina.jpg"
        },
        cantidad: 2
    },
    {
        producto: {
            id: 3,
            nombre: "Creatina",
            precio: 8000,
            img: "/uploads/creatina.jpg"
        },
        cantidad: 1
    }
]
```

---

### `front/scripts/carrito.js`

**Propósito:** Maneja la vista del carrito de compras.

**Funciones principales:**

#### **1. `getCarrito()`**

```javascript
function getCarrito() {
    return JSON.parse(localStorage.getItem("carritoDeCompras")) ?? [];
}
```
- Lee el carrito del localStorage
- Retorna array vacío si no existe

---

#### **2. `saveCarrito(carrito)`**

```javascript
function saveCarrito(carrito) {
    localStorage.setItem("carritoDeCompras", JSON.stringify(carrito));
}
```
- Guarda el carrito en localStorage

---

#### **3. `renderCarrito()`**

**¿Qué hace?** Renderiza la tabla del carrito.

```javascript
function renderCarrito() {
    const tbody = document.getElementById("carrito-body");
    const totalGeneralEl = document.getElementById("total-general");
    const carrito = getCarrito();
    
    // 1. Deshabilitar botón si está vacío
    const confirmarBtn = document.getElementById("btn-confirmar");
    if (confirmarBtn) {
        confirmarBtn.disabled = carrito.length === 0;
    }
    
    // 2. Mostrar mensaje si está vacío
    if (!carrito || carrito.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    Tu carrito está vacío
                </td>
            </tr>`;
        totalGeneralEl.textContent = "0";
        return;
    }
    
    // 3. Calcular total y generar HTML
    let total = 0;
    
    tbody.innerHTML = carrito.map((item, index) => {
        const p = item.producto;
        const subtotal = p.precio * item.cantidad;
        total += subtotal;
        
        return `
            <tr>
                <td>
                    <img src="${p.img}" alt="${p.nombre}" 
                         style="width:70px; height:70px;">
                </td>
                <td>${p.nombre}</td>
                <td>$${p.precio}</td>
                <td>
                    <input type="number" 
                           class="form-control cantidad-carrito"
                           min="1" 
                           value="${item.cantidad}" 
                           data-index="${index}">
                </td>
                <td>$${subtotal}</td>
                <td>
                    <button class="btn btn-danger btn-eliminar" 
                            data-index="${index}">
                        Eliminar
                    </button>
                </td>
            </tr>`;
    }).join("");
    
    totalGeneralEl.textContent = total;
    
    // 4. Eventos para cambiar cantidad
    document.querySelectorAll(".cantidad-carrito").forEach(input => {
        input.addEventListener("change", e => {
            const i = Number(e.target.dataset.index);
            let nuevaCant = Number(e.target.value);
            if (isNaN(nuevaCant) || nuevaCant < 1) nuevaCant = 1;
            
            const carritoActual = getCarrito();
            carritoActual[i].cantidad = nuevaCant;
            saveCarrito(carritoActual);
            renderCarrito();
        });
    });
    
    // 5. Eventos para eliminar
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", e => {
            const i = Number(e.target.dataset.index);
            const carritoActual = getCarrito();
            carritoActual.splice(i, 1);  // Eliminar del array
            saveCarrito(carritoActual);
            renderCarrito();
        });
    });
}
```

---

#### **4. `setupConfirmar()`**

**¿Qué hace?** Maneja la confirmación de compra.

```javascript
function setupConfirmar() {
    const btn = document.getElementById("btn-confirmar");
    const modalEl = document.getElementById('confirmModal');
    const btnModalConfirmar = document.getElementById('btn-modal-confirmar');
    
    btn.addEventListener("click", () => {
        const carrito = getCarrito();
        if (!carrito.length) return;
        
        // Mostrar modal de Bootstrap
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        
        // Evento del botón de confirmación
        btnModalConfirmar.onclick = async () => {
            btnModalConfirmar.disabled = true;  // Evitar doble click
            
            try {
                // 1. Preparar datos
                const nombreCliente = localStorage.getItem("nombreUsuarioPapota") || "Cliente";
                const carritoDeCompras = getCarrito().filter(it => (it?.cantidad ?? 0) > 0);
                
                // 2. Enviar al backend
                const res = await fetch("http://localhost:3000/ventas", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nombreCliente, carritoDeCompras })
                });
                
                if (!res.ok) throw new Error('Error al registrar venta');
                
                // 3. Redirigir a ticket
                modal.hide();
                window.location.href = "./ticket.html";
                
            } catch (e) {
                console.error("Error:", e);
                alert("Error al registrar la venta");
                btnModalConfirmar.disabled = false;
            }
        };
    });
}
```

**Flujo de confirmación:**
```
1. Click en "Confirmar Compra"
2. Mostrar modal con total
3. Click en "Confirmar" del modal
4. POST a /ventas con:
   - nombreCliente
   - carritoDeCompras
5. Si OK → Redirigir a ticket.html
6. Si ERROR → Mostrar alerta
```

---

### `front/scripts/ticket.js`

**Propósito:** Muestra el ticket de compra.

**Código:**

```javascript
document.addEventListener("DOMContentLoaded", () => {
    // 1. Obtener datos
    const nombreCliente = localStorage.getItem("nombreUsuarioPapota") || "Cliente";
    const carrito = JSON.parse(localStorage.getItem("carritoDeCompras")) || [];
    
    // 2. Mostrar nombre y fecha
    document.getElementById("nombre-cliente").textContent = nombreCliente;
    document.getElementById("fecha-compra").textContent = new Date().toLocaleString();
    
    // 3. Renderizar productos
    const tbody = document.getElementById("ticket-body");
    let total = 0;
    
    tbody.innerHTML = carrito.map(item => {
        const p = item.producto;
        const subtotal = p.precio * item.cantidad;
        total += subtotal;
        
        return `
            <tr>
                <td>${p.nombre}</td>
                <td>${item.cantidad}</td>
                <td>$${p.precio}</td>
                <td>$${subtotal}</td>
            </tr>`;
    }).join("");
    
    // 4. Mostrar total
    document.getElementById("ticket-total").textContent = total;
    
    // 5. Limpiar carrito
    localStorage.removeItem("carritoDeCompras");
});
```

**Flujo:**
1. Lee carrito del localStorage
2. Muestra nombre del cliente
3. Muestra fecha actual
4. Lista productos con subtotales
5. Muestra total
6. **Limpia el carrito** del localStorage

---

### `front/scripts/productos-pagina.js`

**Propósito:** Script adicional para la página de productos (si existe).

*Nota: Este archivo aparece en la estructura pero puede estar vacío o ser redundante con `main.js`.*

---

## 🎨 Estilos CSS

### `front/style/bienvenida.css`

**Propósito:** Estilos para la página de bienvenida.

**Características:**
- Diseño centrado
- Logo grande
- Formulario estilizado
- Colores del tema (morado/violeta)

**Estructura típica:**

```css
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-family: 'Arial', sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}

.container {
    background: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    text-align: center;
}

img {
    width: 200px;
    margin-bottom: 20px;
}

input {
    width: 100%;
    padding: 15px;
    border: 2px solid #667eea;
    border-radius: 10px;
    font-size: 16px;
}

button {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 18px;
    cursor: pointer;
    margin-top: 20px;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}
```

---

### `front/style/productos.css`

**Propósito:** Estilos para el catálogo de productos.

**Características:**
- Grid responsive
- Cards de productos
- Hover effects
- Header con logo y carrito

**Estructura típica:**

```css
/* Header */
header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
}

/* Grid de productos */
.productos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    padding: 20px;
}

/* Card de producto */
.card {
    background: white;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    overflow: hidden;
    transition: transform 0.3s;
}

.card:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.card-body {
    padding: 20px;
}

.card-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
}

.card-text {
    font-size: 24px;
    color: #667eea;
    font-weight: bold;
}

input[type="number"] {
    width: 100%;
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 5px;
    margin: 10px 0;
}

.btn-actualizar {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
}

.btn-actualizar:hover {
    opacity: 0.9;
}
```

---

### `front/style/carrito.css`

**Propósito:** Estilos para la página del carrito.

**Características:**
- Tabla responsive
- Botones de acción
- Total destacado
- Modal de confirmación

**Estructura típica:**

```css
body {
    background: #f5f5f5;
    font-family: 'Arial', sans-serif;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background: white;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

h1 {
    color: #667eea;
    text-align: center;
    margin-bottom: 30px;
}

table {
    width: 100%;
    border-collapse: collapse;
}

thead {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

th, td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

tbody tr:hover {
    background: #f9f9f9;
}

.total {
    text-align: right;
    margin-top: 20px;
    font-size: 24px;
    font-weight: bold;
    color: #667eea;
}

.acciones {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
}

.btn {
    padding: 15px 30px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    transition: all 0.3s;
}

.btn-success {
    background: #28a745;
    color: white;
}

.btn-success:hover {
    background: #218838;
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn-danger {
    background: #dc3545;
    color: white;
}
```

---

### `front/style/ticket.css`

**Propósito:** Estilos para el ticket de compra.

**Características:**
- Diseño de ticket imprimible
- Formato de recibo
- Botones de acción

**Estructura típica:**

```css
body {
    background: #f5f5f5;
    font-family: 'Courier New', monospace;
}

.ticket-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
}

.ticket {
    background: white;
    max-width: 600px;
    padding: 40px;
    border: 2px dashed #333;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.ticket img {
    width: 150px;
    display: block;
    margin: 0 auto 20px;
}

.ticket h1 {
    text-align: center;
    color: #667eea;
    margin-bottom: 30px;
}

.ticket-info {
    border-top: 2px dashed #333;
    border-bottom: 2px dashed #333;
    padding: 20px 0;
    margin: 20px 0;
}

table {
    width: 100%;
    margin: 20px 0;
}

th, td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.ticket-total {
    text-align: right;
    font-size: 24px;
    font-weight: bold;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 2px solid #333;
}

.ticket-actions {
    display: flex;
    justify-content: space-around;
    margin-top: 30px;
}

/* Estilos para impresión */
@media print {
    body {
        background: white;
    }
    
    .ticket-actions {
        display: none;
    }
    
    .ticket {
        border: none;
        box-shadow: none;
    }
}
```

---

# ⚙️ ARCHIVOS DE CONFIGURACIÓN

## `back/package.json`

**Propósito:** Define dependencias y scripts del backend.

```json
{
  "name": "back",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "dev": "node --watch --env-files.env ./index.js",
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "bcrypt": "^6.0.0",           // Hasheo de contraseñas
    "cors": "^2.8.5",              // CORS
    "dotenv": "^17.2.3",           // Variables de entorno
    "ejs": "^3.1.10",              // Motor de plantillas
    "express": "^5.1.0",           // Framework web
    "express-session": "^1.18.2",  // Manejo de sesiones
    "multer": "^2.0.2",            // Upload de archivos
    "mysql2": "^3.15.3",           // Driver MySQL
    "sequelize": "^6.37.7",        // ORM
    "zod": "^4.1.12"               // Validación (no usado aún)
  }
}
```

**Scripts:**
- `npm start` → Inicia el servidor
- `npm run dev` → Modo desarrollo con auto-reload

---

## `front/package.json`

**Propósito:** Configuración del frontend (si usa npm).

```json
{
  "name": "front",
  "version": "1.0.0",
  "type": "module"  // Permite usar import/export
}
```

---

## `back/.env`

**Propósito:** Variables de entorno sensibles (NO se sube a Git).

```env
STRING_DB=mysql://root:password@localhost:3306/papota_gym
PORT=3000
ORIGIN=*
SESSION_SECRET=mi-secreto-super-seguro-2025
```

**Variables:**
- `STRING_DB` → Conexión a MySQL
- `PORT` → Puerto del servidor
- `ORIGIN` → Orígenes permitidos para CORS
- `SESSION_SECRET` → Clave para firmar sesiones

---

## `back/.gitignore`

**Propósito:** Archivos que NO se suben a Git.

```
# Dependencias
node_modules/
package-lock.json

# Variables de entorno
.env

# Bases de datos locales
*.sqlite
*.db

# Archivos de sistema
.DS_Store
Thumbs.db
*.log

# Uploads
uploads/*
!uploads/.gitkeep
```

---

## `README.md`

**Propósito:** Documentación principal del proyecto.

Contiene:
- Descripción del proyecto
- Requisitos previos
- Instrucciones de instalación
- Configuración
- Uso
- Estructura del proyecto
- Tecnologías utilizadas

---

## `TEST-CHECKLIST.md`

**Propósito:** Checklist de pruebas manuales.

Contiene:
- Lista de funcionalidades a probar
- Pasos para cada prueba
- Resultados esperados
- Solución de problemas

---

## `ACCESO-PANEL-ADMIN.md`

**Propósito:** Guía para acceder al panel de administración.

Contiene:
- Pasos para iniciar el servidor
- Credenciales de acceso
- Rutas disponibles
- Solución de problemas comunes

---

# 📊 RESUMEN DE FLUJOS

## Flujo Completo de Compra

```
1. Usuario → bienvenida.html
   ↓ Ingresa nombre
   ↓ Guarda en localStorage
   
2. Usuario → productos.html
   ↓ main.js hace fetch a /productos
   ↓ Renderiza cards
   ↓ Usuario selecciona cantidad
   ↓ Click en "Actualizar"
   ↓ producto.js guarda en localStorage
   
3. Usuario → carrito.html
   ↓ carrito.js lee localStorage
   ↓ Renderiza tabla
   ↓ Usuario puede modificar cantidades
   ↓ Click en "Confirmar Compra"
   ↓ Modal de confirmación
   ↓ Click en "Confirmar"
   ↓ POST a /ventas
   
4. Backend → ventas.controller.js
   ↓ Valida datos
   ↓ Calcula totales
   ↓ Crea registro en tabla venta
   ↓ Crea registros en tabla detalleVenta
   ↓ Responde con venta creada
   
5. Usuario → ticket.html
   ↓ ticket.js lee localStorage
   ↓ Muestra ticket
   ↓ Limpia carrito
```

---

## Flujo de Autenticación Admin

```
1. Usuario → /admin/login
   ↓ Ingresa correo y contraseña
   ↓ POST a /admin/login
   
2. Backend → admin.controller.procesarLogin()
   ↓ Busca usuario en BD
   ↓ Verifica contraseña con bcrypt
   ↓ Si OK: Crea sesión
   ↓ Si ERROR: Muestra error
   
3. Usuario → /admin/dashboard
   ↓ Middleware verifica sesión
   ↓ Si tiene sesión: Muestra dashboard
   ↓ Si no tiene sesión: Redirige a login
```

---

## Flujo de Creación de Producto

```
1. Admin → /admin/producto/nuevo
   ↓ Llena formulario
   ↓ Selecciona tipo (Pesa/Suplemento)
   ↓ JavaScript muestra campos específicos
   ↓ POST a /admin/producto/guardar
   
2. Backend → admin.controller.guardarProducto()
   ↓ Valida datos
   ↓ Aplica regla de consistencia:
   │  - Si Pesa: peso != null, cantidad = null
   │  - Si Suplemento: cantidad != null, peso = null
   ↓ Crea registro en tabla producto
   ↓ Redirige a dashboard con mensaje
   
3. Admin → /admin/dashboard
   ↓ Ve el nuevo producto en la lista
```

---

# 🎓 CONCEPTOS CLAVE

## Single Table Inheritance (STI)

**¿Qué es?**
Estrategia para guardar diferentes tipos de entidades en una sola tabla.

**En este proyecto:**
- **Una tabla:** `producto`
- **Dos tipos:** Pesa y Suplemento
- **Discriminador:** Campo `tipo_producto`
- **Campos variables:** `peso` (Pesas) y `cantidad_gramos_ml` (Suplementos)

**Ventajas:**
- ✅ Menos tablas
- ✅ Queries más simples
- ✅ Fácil agregar nuevos tipos

**Desventajas:**
- ❌ Campos NULL
- ❌ Validación en código

---

## Relación Many-to-Many (N:M)

**¿Qué es?**
Relación donde múltiples registros de una tabla se relacionan con múltiples de otra.

**En este proyecto:**
- **Venta** ←→ **Producto**
- Una venta puede tener muchos productos
- Un producto puede estar en muchas ventas

**Tabla intermedia:** `detalleVenta`
- Guarda la relación
- Guarda datos adicionales (cantidad, precio, subtotal)

**SQL equivalente:**
```sql
SELECT v.*, p.*
FROM venta v
JOIN detalleVenta dv ON v.id = dv.VentumId
JOIN producto p ON p.id = dv.ProductoId
WHERE v.id = 1;
```

---

## Sesiones en Express

**¿Qué son?**
Mecanismo para mantener estado entre requests HTTP.

**¿Cómo funcionan?**
1. Usuario hace login
2. Servidor crea sesión y guarda datos
3. Servidor envía cookie con ID de sesión
4. Navegador guarda cookie
5. En cada request, navegador envía cookie
6. Servidor lee cookie y recupera sesión

**En este proyecto:**
```javascript
// Crear sesión (login)
req.session.usuarioId = usuario.id;
req.session.usuarioNombre = usuario.nombre;

// Leer sesión (dashboard)
const nombre = req.session.usuarioNombre;

// Destruir sesión (logout)
req.session.destroy();
```

---

## LocalStorage

**¿Qué es?**
Almacenamiento persistente en el navegador.

**Características:**
- ✅ Persiste entre sesiones
- ✅ Capacidad: ~5-10 MB
- ❌ Solo strings
- ❌ No seguro (accesible por JavaScript)

**En este proyecto:**
```javascript
// Guardar
localStorage.setItem('nombreUsuarioPapota', 'Juan');
localStorage.setItem('carritoDeCompras', JSON.stringify(carrito));

// Leer
const nombre = localStorage.getItem('nombreUsuarioPapota');
const carrito = JSON.parse(localStorage.getItem('carritoDeCompras'));

// Eliminar
localStorage.removeItem('carritoDeCompras');
```

---

# 🔚 FIN DE LA DOCUMENTACIÓN

Este documento cubre **todos los archivos** del proyecto explicando:
- ✅ Qué hace cada archivo
- ✅ Cómo funciona
- ✅ Qué tecnologías usa
- ✅ Cómo se relaciona con otros archivos
- ✅ Ejemplos de código
- ✅ Flujos completos

**Para más información:**
- README.md → Guía de instalación
- ACCESO-PANEL-ADMIN.md → Guía del panel admin
- TEST-CHECKLIST.md → Checklist de pruebas


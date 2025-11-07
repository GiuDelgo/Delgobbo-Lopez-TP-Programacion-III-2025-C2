# 🔐 Guía de Acceso al Panel de Administración

## 📋 Pasos para Acceder

### **1️⃣ Asegurarse que el Backend esté Corriendo**

```bash
cd back
node index.js
```

Deberías ver:
```
Servidor corriendo en http://localhost:3000
Base de datos conectada
```

---

### **2️⃣ Acceder al Panel de Login**

Abre tu navegador y ve a:

```
http://localhost:3000/admin/login
```

---

### **3️⃣ Iniciar Sesión**

Ingresa las credenciales (creadas automáticamente al iniciar el servidor):
- **Correo:** `admin@papota.com`
- **Contraseña:** `admin123`

**Nota:** El usuario admin se crea automáticamente la primera vez que inicias el servidor.

---

### **4️⃣ ¡Listo! Ahora puedes:**

✅ Ver todos los productos en el dashboard  
✅ Crear nuevos productos  
✅ Editar productos existentes  
✅ Activar/Desactivar productos  
✅ Gestionar suplementos y pesas  

---

## 🌐 Rutas Disponibles

| URL | Descripción |
|-----|-------------|
| `http://localhost:3000/admin/login` | Página de inicio de sesión |
| `http://localhost:3000/admin/dashboard` | Panel principal (requiere login) |
| `http://localhost:3000/admin/producto/nuevo` | Crear producto (requiere login) |
| `http://localhost:3000/admin/producto/editar/:id` | Editar producto (requiere login) |
| `http://localhost:3000/admin/logout` | Cerrar sesión |

---

## 🔧 Solución de Problemas

### ❌ **Error: "Cannot GET /admin/login"**
**Causa:** El servidor no está corriendo  
**Solución:** Ejecuta `node index.js` desde la carpeta `back/`

### ❌ **Error: "Correo o contraseña incorrectos"**
**Causa:** El usuario admin no se creó correctamente  
**Solución:** 
1. Verifica que el servidor se haya iniciado correctamente
2. Busca en los logs el mensaje "✅ Usuario administrador creado automáticamente"
3. Si no aparece, ejecuta manualmente: `node crear-usuario-admin.js`

### ❌ **Error: "Cannot connect to database"**
**Causa:** MySQL no está corriendo o credenciales incorrectas  
**Solución:** 
1. Verifica que MySQL esté corriendo
2. Revisa el archivo `.env` con las credenciales correctas

### ❌ **La página no carga estilos**
**Causa:** Bootstrap CDN no carga  
**Solución:** Verifica tu conexión a internet

---

## 🔑 Cambiar Contraseña del Admin

Si quieres cambiar las credenciales, edita el archivo `back/crear-usuario-admin.js`:

```javascript
// Líneas 15-17
const nombre = 'Admin';
const correo = 'admin@papota.com';      // ← Cambia aquí
const contraseñaPlana = 'admin123';     // ← Cambia aquí
```

Luego ejecuta de nuevo:
```bash
node crear-usuario-admin.js
```

---

## 📸 Capturas de Pantalla

### Login
![Login](./docs/login.png)

### Dashboard
![Dashboard](./docs/dashboard.png)

### Formulario de Producto
![Formulario](./docs/producto-form.png)

---

## 🚀 Flujo Completo

```
1. Clonar repo
   ↓
2. npm install (en back/)
   ↓
3. Configurar .env
   ↓
4. node index.js (crea el admin automáticamente)
   ↓
5. Abrir http://localhost:3000/admin/login
   ↓
6. Ingresar credenciales (admin@papota.com / admin123)
   ↓
7. ¡Usar el panel de admin! 🎉
```

---

## 📞 Contacto

Si tienes problemas, contacta a:
- Franco Delgobbo
- [Tu compañera]

---

**Última actualización:** Noviembre 2024


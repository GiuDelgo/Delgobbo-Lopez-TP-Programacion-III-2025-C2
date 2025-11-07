# ✅ Checklist de Pruebas - Papota Gym

## 🎯 Objetivo
Verificar que todo el sistema funcione correctamente después de los cambios.

---

## 📋 CHECKLIST DE PRUEBAS

### **1. Backend - Inicio del Servidor** ✅

#### **Pasos:**
```bash
cd back
node index.js
```

#### **✅ Deberías Ver:**
```
🔗 Conexión a la base de datos establecida correctamente.
📊 Modelos sincronizados con la base de datos.
✅ Usuario administrador creado automáticamente
   📧 Correo: admin@papota.com
   🔐 Contraseña: admin123
🚀 Servidor corriendo en http://localhost:3000
🔐 Panel admin: http://localhost:3000/admin/login
```

#### **❌ Si NO ves esto:**
- Verifica que MySQL esté corriendo
- Verifica el archivo `.env`
- Revisa errores en la consola

---

### **2. Panel de Admin - Login** ✅

#### **Pasos:**
1. Abre el navegador
2. Ve a: `http://localhost:3000/admin/login`
3. Ingresa:
   - **Correo:** `admin@papota.com`
   - **Contraseña:** `admin123`
4. Click en "Iniciar Sesión"

#### **✅ Deberías Ver:**
- Redirección a `/admin/dashboard`
- Panel con lista de productos
- Dos secciones: "Suplementos" y "Pesas"
- Botones: "Nuevo Producto", "Editar", "Activar/Desactivar"

#### **❌ Si NO funciona:**
- Error "Correo o contraseña incorrectos" → Verifica que el usuario se creó (revisa logs del servidor)
- Error "Cannot GET /admin/login" → El servidor no está corriendo
- Página en blanco → Revisa la consola del navegador (F12)

---

### **3. Panel de Admin - Crear Producto** ✅

#### **Pasos:**
1. En el dashboard, click en "Nuevo Producto"
2. Llena el formulario:
   - **Nombre:** "Proteína Test"
   - **Marca:** "Test Brand"
   - **Precio:** 5000
   - **Tipo:** Suplemento
   - **Cantidad (gr/ml):** 1000
   - **Imagen:** (dejar vacío o poner una URL)
3. Click en "Guardar"

#### **✅ Deberías Ver:**
- Redirección al dashboard
- Mensaje: "Producto creado correctamente"
- El nuevo producto aparece en la lista de Suplementos

#### **❌ Si NO funciona:**
- Error 500 → Revisa logs del servidor
- No aparece el producto → Refresca la página (F5)

---

### **4. Panel de Admin - Editar Producto** ✅

#### **Pasos:**
1. En el dashboard, busca el producto "Proteína Test"
2. Click en el botón "Editar" (ícono de lápiz)
3. Cambia el precio a: 6000
4. Click en "Guardar"

#### **✅ Deberías Ver:**
- Redirección al dashboard
- Mensaje: "Producto actualizado correctamente"
- El precio del producto cambió a 6000

---

### **5. Panel de Admin - Desactivar Producto** ✅

#### **Pasos:**
1. En el dashboard, busca el producto "Proteína Test"
2. Click en el botón "Desactivar" (ícono de ojo tachado)

#### **✅ Deberías Ver:**
- Mensaje: "Producto desactivado correctamente"
- El producto aparece con estilo diferente (gris o tachado)
- El botón cambió a "Activar"

---

### **6. API REST - Obtener Productos** ✅

#### **Pasos:**
1. Abre una nueva pestaña del navegador
2. Ve a: `http://localhost:3000/productos`

#### **✅ Deberías Ver:**
```json
[
  {
    "id": 1,
    "nombre": "Proteína Test",
    "marca": "Test Brand",
    "precio": 6000,
    "tipo_producto": "Suplemento",
    "cantidad_gramos_ml": 1000,
    "imagen": null,
    "activo": false
  }
]
```

---

### **7. Frontend - Ver Productos** ✅

#### **Pasos:**
1. Abre: `front/views/productos.html` con Live Server
2. Verifica que carguen los productos de la base de datos

#### **✅ Deberías Ver:**
- Productos cargados desde la API
- Imágenes (o logo por defecto si no tienen imagen)
- Precios correctos
- Solo productos activos

#### **❌ Si NO funciona:**
- Error CORS → Verifica que el backend tenga `cors` configurado
- No cargan productos → Abre consola del navegador (F12) y busca errores
- Error de red → Verifica que el backend esté corriendo

---

### **8. Frontend - Agregar al Carrito** ✅

#### **Pasos:**
1. En `productos.html`, click en un producto
2. Click en "Agregar al Carrito"
3. Ve a: `carrito.html`

#### **✅ Deberías Ver:**
- El producto en el carrito
- Precio correcto
- Botones para aumentar/disminuir cantidad
- Total calculado correctamente

---

### **9. Verificar Usuario Admin en Base de Datos** ✅

#### **Pasos (MySQL):**
```sql
USE papota_gym;
SELECT * FROM usuario;
```

#### **✅ Deberías Ver:**
```
+----+-------+-------------------+--------------------------------------------------------------+
| id | nombre| correo            | contraseña (hash)                                            |
+----+-------+-------------------+--------------------------------------------------------------+
| 1  | Admin | admin@papota.com  | $2b$10$... (hash de bcrypt)                                   |
+----+-------+-------------------+--------------------------------------------------------------+
```

---

### **10. Verificar Productos en Base de Datos** ✅

#### **Pasos (MySQL):**
```sql
USE papota_gym;
SELECT id, nombre, marca, precio, tipo_producto, activo FROM productos;
```

#### **✅ Deberías Ver:**
- Lista de productos
- El producto "Proteína Test" que creaste
- Campo `activo` con valor 0 o 1

---

## 🔧 PRUEBAS ADICIONALES

### **Test 11: Cerrar Sesión** ✅
1. En el panel de admin, click en "Cerrar Sesión"
2. Deberías ser redirigido a `/admin/login`
3. Intenta acceder a `/admin/dashboard` sin login
4. Deberías ser redirigido a `/admin/login`

### **Test 12: Sesión Persistente** ✅
1. Inicia sesión en el panel de admin
2. Cierra el navegador
3. Abre el navegador de nuevo
4. Ve a `/admin/dashboard`
5. Deberías seguir con sesión iniciada (por 24 horas)

### **Test 13: Imágenes de Productos** ✅
1. Crea un producto con URL de imagen
2. Verifica que la imagen se muestre en el dashboard
3. Verifica que la imagen se muestre en el frontend

---

## 📊 RESUMEN DE RESULTADOS

| Test | Descripción | Estado | Notas |
|------|-------------|--------|-------|
| 1 | Inicio del servidor | ⬜ | |
| 2 | Login admin | ⬜ | |
| 3 | Crear producto | ⬜ | |
| 4 | Editar producto | ⬜ | |
| 5 | Desactivar producto | ⬜ | |
| 6 | API REST | ⬜ | |
| 7 | Frontend productos | ⬜ | |
| 8 | Carrito | ⬜ | |
| 9 | Usuario en BD | ⬜ | |
| 10 | Productos en BD | ⬜ | |
| 11 | Cerrar sesión | ⬜ | |
| 12 | Sesión persistente | ⬜ | |
| 13 | Imágenes | ⬜ | |

**Leyenda:**
- ⬜ No probado
- ✅ Funciona
- ❌ Falla
- ⚠️ Funciona con problemas

---

## 🐛 ERRORES COMUNES Y SOLUCIONES

### **Error: "Cannot connect to database"**
```bash
# Solución:
1. Verifica que MySQL esté corriendo
2. Revisa el archivo .env
3. Verifica usuario y contraseña de MySQL
```

### **Error: "Usuario administrador ya existe"**
```bash
# Es normal si ya corriste el servidor antes
# El sistema detecta que el usuario ya existe y no lo vuelve a crear
```

### **Error: "Cannot GET /admin/login"**
```bash
# Solución:
cd back
node index.js
```

### **Error CORS en Frontend**
```bash
# Solución:
# Verifica que en back/index.js esté:
app.use(cors({ origin: process.env.ORIGIN }));
```

---

## 🎯 CRITERIOS DE ÉXITO

✅ **Sistema Funcionando Correctamente Si:**
1. El servidor inicia sin errores
2. El usuario admin se crea automáticamente
3. Puedes hacer login en el panel de admin
4. Puedes crear, editar y desactivar productos
5. La API REST responde correctamente
6. El frontend carga productos desde la BD
7. El carrito funciona correctamente

---

## 📞 AYUDA

Si algún test falla:
1. Revisa los logs del servidor (terminal donde corre `node index.js`)
2. Revisa la consola del navegador (F12)
3. Verifica que MySQL esté corriendo
4. Verifica el archivo `.env`
5. Contacta al equipo de desarrollo

---

**Última actualización:** Noviembre 2024  
**Versión:** 1.0


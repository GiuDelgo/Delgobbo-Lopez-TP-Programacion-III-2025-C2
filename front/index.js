const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Asegurar que env.json exista (copiar desde env.prod.json si no existe)
const envPath = path.join(__dirname, 'env.json');
const envProdPath = path.join(__dirname, 'env.prod.json');

if (!fs.existsSync(envPath) && fs.existsSync(envProdPath)) {
    fs.copyFileSync(envProdPath, envPath);
    console.log('Copiado env.prod.json a env.json');
}

// Redirigir rutas raíz a bienvenida
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'bienvenida.html'));
});

// Ruta específica para env.json
app.get('/env.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'env.json'));
});

// Rutas para páginas HTML (antes de los archivos estáticos para evitar conflictos)
const htmlFiles = ['bienvenida', 'productos', 'carrito', 'ticket'];
htmlFiles.forEach(fileName => {
    app.get(`/${fileName}`, (req, res) => {
        const filePath = path.join(__dirname, 'views', `${fileName}.html`);
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).send('Página no encontrada');
        }
    });
    
    app.get(`/${fileName}.html`, (req, res) => {
        const filePath = path.join(__dirname, 'views', `${fileName}.html`);
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).send('Página no encontrada');
        }
    });
});

// Servir archivos estáticos (scripts, style, imgs, etc.) - DEBE IR AL FINAL
app.use(express.static(path.join(__dirname)));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Frontend servidor corriendo en puerto ${PORT}`);
}).on('error', (err) => {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
});


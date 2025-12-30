// Script para copiar env.prod.json a env.json antes del deploy
const fs = require('fs');
const path = require('path');

const envProdPath = path.join(__dirname, 'env.prod.json');
const envPath = path.join(__dirname, 'env.json');

if (fs.existsSync(envProdPath)) {
    fs.copyFileSync(envProdPath, envPath);
    console.log('✓ Copiado env.prod.json a env.json para producción');
} else {
    console.warn('⚠ env.prod.json no encontrado, usando env.json existente');
}


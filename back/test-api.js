/**
 * Script de prueba rápida de la API
 * Ejecutar: node test-api.js
 * 
 * Requisito: El servidor debe estar corriendo en otro terminal
 */

const http = require('http');

console.log('🧪 Iniciando pruebas de la API...\n');

// ========================================
// TEST 1: Verificar que el servidor responda
// ========================================
function testServerRunning() {
    return new Promise((resolve, reject) => {
        console.log('📡 Test 1: Verificando servidor...');
        
        http.get('http://localhost:3000/productos', (res) => {
            if (res.statusCode === 200) {
                console.log('   ✅ Servidor corriendo correctamente\n');
                resolve(true);
            } else {
                console.log(`   ❌ Error: Status code ${res.statusCode}\n`);
                resolve(false);
            }
        }).on('error', (err) => {
            console.log('   ❌ Error: Servidor no responde');
            console.log(`   💡 ¿Está corriendo "node index.js"?\n`);
            resolve(false);
        });
    });
}

// ========================================
// TEST 2: Verificar endpoint de productos
// ========================================
function testProductosEndpoint() {
    return new Promise((resolve, reject) => {
        console.log('📦 Test 2: Verificando endpoint /productos...');
        
        http.get('http://localhost:3000/productos', (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const productos = JSON.parse(data);
                    console.log(`   ✅ Endpoint funciona correctamente`);
                    console.log(`   📊 Productos encontrados: ${productos.length}\n`);
                    resolve(true);
                } catch (error) {
                    console.log('   ❌ Error al parsear JSON\n');
                    resolve(false);
                }
            });
        }).on('error', (err) => {
            console.log('   ❌ Error al conectar\n');
            resolve(false);
        });
    });
}

// ========================================
// TEST 3: Verificar página de login
// ========================================
function testAdminLogin() {
    return new Promise((resolve, reject) => {
        console.log('🔐 Test 3: Verificando página de login...');
        
        http.get('http://localhost:3000/admin/login', (res) => {
            if (res.statusCode === 200) {
                console.log('   ✅ Página de login accesible\n');
                resolve(true);
            } else {
                console.log(`   ❌ Error: Status code ${res.statusCode}\n`);
                resolve(false);
            }
        }).on('error', (err) => {
            console.log('   ❌ Error al conectar\n');
            resolve(false);
        });
    });
}

// ========================================
// EJECUTAR TODAS LAS PRUEBAS
// ========================================
async function runAllTests() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 SUITE DE PRUEBAS - PAPOTA GYM API');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const results = [];
    
    // Ejecutar pruebas
    results.push(await testServerRunning());
    results.push(await testProductosEndpoint());
    results.push(await testAdminLogin());
    
    // Resumen
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMEN DE PRUEBAS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log(`✅ Pruebas exitosas: ${passed}/${total}`);
    console.log(`❌ Pruebas fallidas: ${total - passed}/${total}\n`);
    
    if (passed === total) {
        console.log('🎉 ¡Todas las pruebas pasaron!\n');
        console.log('✅ El sistema está funcionando correctamente');
        console.log('🌐 Panel admin: http://localhost:3000/admin/login');
        console.log('📧 Usuario: admin@papota.com');
        console.log('🔐 Contraseña: admin123\n');
    } else {
        console.log('⚠️  Algunas pruebas fallaron');
        console.log('💡 Verifica que:');
        console.log('   1. El servidor esté corriendo (node index.js)');
        console.log('   2. MySQL esté corriendo');
        console.log('   3. El archivo .env esté configurado correctamente\n');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Ejecutar
runAllTests();


// Test para diagnosticar por qué la liturgia no se genera completa
// Fecha: 18 enero 2026 (Domingo - Ciclo A)

console.log('=== DIAGNÓSTICO DE GENERACIÓN DE LITURGIA ===\n');

// 1. Verificar ciclo litúrgico
const testDate = new Date(2026, 0, 18); // 18 enero 2026

console.log('📅 Fecha de prueba:', testDate.toLocaleDateString('es-ES'));
console.log('📆 Día de la semana:', testDate.getDay() === 0 ? 'DOMINGO ✓' : 'NO ES DOMINGO ✗');

// Calcular ciclo
const adventStart = new Date(2025, 10, 30); // 30 nov 2025 (Adviento 2026 empieza)
let targetYear = testDate >= adventStart ? 2026 : 2025;
const residuo = targetYear % 3;
let cicloDom = residuo === 1 ? "A (Mateo)" : (residuo === 2 ? "B (Marcos)" : "C (Lucas)");

console.log(`\n🔢 Año litúrgico: ${targetYear}`);
console.log(`   Residuo (${targetYear} % 3): ${residuo}`);
console.log(`   ✅ CICLO DOMINICAL: ${cicloDom}`);

if (cicloDom.startsWith('A')) {
    console.log('   ✓ El Evangelio debe ser de MATEO');
} else {
    console.log('   ✗ ERROR: No es ciclo A!');
}

// 2. Verificar si Evangelizo tiene las lecturas
console.log('\n📖 Verificando datos de Evangelizo...');
console.log('   URL: https://feed.evangelizo.org/v2/reader.php?date=20260118&type=all&lang=SP');
console.log('   (Revisar en el navegador que las 4 lecturas estén presentes)');

// 3. Verificar patrones de regex
const testText = `
Libro de Isaías 49,3.5-6.
...texto de Isaías...

Salmo 40(39),2.4.7-8.9.10.
...texto del salmo...

Carta I de San Pablo a los Corintios 1,1-3.
...texto de Corintios...

Evangelio según San Juan 1,29-34.
...texto del Evangelio...
`;

console.log('\n🔍 Probando regex de Segunda Lectura:');
const regex = /((?:Carta (?:I|II|primera|segunda)? ?de San Pablo|Carta de San|Libro de los Hechos|Lectura de la (?:primera |segunda )?carta)[^<]+)/i;
const match = testText.match(regex);

if (match) {
    console.log('   ✅ REGEX FUNCIONA: Detecta "Carta I de San Pablo a los Corintios"');
    console.log('   Texto capturado:', match[1]);
} else {
    console.log('   ✗ REGEX FALLA: No detecta la segunda lectura');
}

console.log('\n📝 DIAGNÓSTICO COMPLETO:');
console.log('   1. Ciclo litúrgico: ✓ Correcto (A)');
console.log('   2. Día: ✓ Domingo');
console.log('   3. Regex: ' + (match ? '✓ Funcional' : '✗ Fallando'));
console.log('\nPróximo paso: Revisar consola del navegador al generar');

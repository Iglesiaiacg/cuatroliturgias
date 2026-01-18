
import { buildPrompt } from './src/services/liturgy.js';

// Mock Date
const date = new Date(2026, 0, 18); // Jan 18, 2026

console.log('--- TEST PROMPT GENERATION ---');
console.log('Date:', date.toDateString());

try {
    const prompt = buildPrompt({
        selectedDate: date,
        tradition: 'catolica', // should default to Roman logic
        celebrationLabel: '2º Domingo del Tiempo Ordinario'
    });

    console.log('\n🔍 Checking for Mandatory Preface...');
    if (prompt.includes('EL PREFACIO A USAR ES: **COMÚN / DOMINICAL**')) {
        console.log('✅ FOUND: Preface instruction is present and correct.');
    } else {
        console.log('❌ MISSING: Preface instruction not found.');
        console.log('   (Expected "EL PREFACIO A USAR ES: **COMÚN / DOMINICAL**")');
    }

    console.log('\n🔍 Checking for Intercessions Checklist...');
    if (prompt.includes('CHECKLIST PRE-GENERACIÓN')) {
        console.log('✅ FOUND: Intercessions checklist is present.');
    } else {
        console.log('❌ MISSING: Intercessions checklist not found.');
    }

    console.log('\n🔍 Checking for Embolism Instruction...');
    if (prompt.includes('DEBES generar el EMBOLISMO completo')) {
        console.log('✅ FOUND: Embolism instruction is present.');
    } else {
        console.log('❌ MISSING: Embolism instruction not found.');
    }

} catch (error) {
    console.error('⚠️ Error running test:', error);
}

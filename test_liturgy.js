
import { identifyFeast } from './src/services/liturgy.js';

const testDates = [
    new Date(2025, 0, 19), // Late Jan (Part 1)
    new Date(2025, 7, 24), // Aug 24 (Part 2)
    new Date(2025, 10, 23) // Christ King
];

console.log("--- TEST RESULTS ---");
testDates.forEach(d => {
    console.log(`${d.toDateString()} -> ${identifyFeast(d)}`);
});

const axios = require('axios');

const url = 'https://feed.evangelizo.org/v2/reader.php?date=20260118&type=all&lang=SP';

axios.get(url)
    .then(res => {
        console.log('=== EVANGELIZO API RESPONSE FOR JANUARY 18, 2026 ===');
        console.log('Status:', res.status);
        console.log('Data length:', res.data.length);
        console.log('\n=== RAW HTML (first 4000 chars) ===');
        console.log(res.data.substring(0, 4000));
        console.log('\n=== SEARCHING FOR SEGUNDA LECTURA PATTERNS ===');

        const patterns = [
            'Libro de los Hechos',
            'Lectura de la carta',
            'Lectura de la primera carta',
            'Lectura de la segunda carta',
            'Segunda lectura',
            'Corintios',
            'Romanos',
            'Tesalonicenses'
        ];

        patterns.forEach(pattern => {
            if (res.data.match(new RegExp(pattern, 'i'))) {
                console.log(`✓ Found: "${pattern}"`);
            }
        });
    })
    .catch(err => console.error('Error:', err.message));

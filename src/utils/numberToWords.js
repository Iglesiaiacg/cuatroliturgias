export const numberToWords = (amount) => {
    if (!amount) return '';

    // Basic implementation for typical amounts
    // For a production app, a dedicated library like 'numero-a-letras' might be better,
    // but a simple function works for this scope to avoid extra heavy deps if possible.
    // However, given the complexity of Spanish numbers, using a robust logic is key.

    // Simplified logic for "X Pesos 00/100 M.N."
    const integerPart = Math.floor(amount);
    const decimalPart = Math.round((amount - integerPart) * 100);

    const units = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const tens = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];

    const convertGroup = (n) => {
        if (n === 0) return '';
        if (n === 100) return 'CIEN';

        let str = '';

        // Hundreds
        if (n >= 100) {
            const h = Math.floor(n / 100);
            if (h === 1 && n % 100 !== 0) str += 'CIENTO ';
            else if (h === 5) str += 'QUINIENTOS ';
            else if (h === 7) str += 'SETECIENTOS ';
            else if (h === 9) str += 'NOVECIENTOS ';
            else if (h > 1) str += units[h] + 'CIENTOS ';
            n %= 100;
        }

        // Tens & Units
        if (n >= 10) {
            if (n < 20) {
                str += teens[n - 10] + ' ';
                n = 0;
            } else if (n >= 20 && n < 30) {
                if (n === 20) str += 'VEINTE ';
                else str += 'VEINTI' + units[n % 10] + ' ';
                n = 0;
            } else {
                const t = Math.floor(n / 10);
                str += tens[t];
                if (n % 10 !== 0) str += ' Y ';
                else str += ' ';
                n %= 10;
            }
        }

        if (n > 0) {
            str += units[n] + ' ';
        }

        return str;
    };

    let words = '';

    if (integerPart === 0) words = 'CERO ';
    else {
        // Thousands
        if (integerPart >= 1000) {
            const k = Math.floor(integerPart / 1000);
            if (k === 1) words += 'MIL ';
            else words += convertGroup(k) + 'MIL ';
            // Remainder
            words += convertGroup(integerPart % 1000);
        } else {
            words += convertGroup(integerPart);
        }
    }

    return `(${words.trim()} PESOS ${decimalPart.toString().padStart(2, '0')}/100 M.N.)`;
};

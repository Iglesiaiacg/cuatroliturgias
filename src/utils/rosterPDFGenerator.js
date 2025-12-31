import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable'; // Ensure this is installed or use fallback

/**
 * Generates a PDF for the Monthly Roster
 * @param {Object} rosterData - { 'YYYY-MM-DD': { roleId: { assignedTo: name, ... } } }
 * @param {number} month - 0-11
 * @param {number} year
 */
export function generateRosterPDF(rosterData, month, year) {
    const doc = new jsPDF({ orientation: 'landscape' });

    // Title
    const monthName = new Date(year, month).toLocaleString('es-ES', { month: 'long' });
    doc.setFontSize(18);
    doc.text(`Rol de Ministerios - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`, 14, 20);
    doc.setFontSize(10);
    doc.text("Cuatro Liturgias", 14, 26);

    // Prepare Data for Table
    // Columns: Liturgy/Date | Presider | Preacher | M.C. | Lector 1 | Lector 2 | Musician

    const head = [['Fecha / Liturgia', 'Celebrante', 'Predicador', 'M.C. / Acólito', 'Lector', 'Músico']];
    const body = [];

    // Sort dates
    const dates = Object.keys(rosterData).sort();

    dates.forEach(date => {
        const dayAssignments = rosterData[date];
        const dateObj = new Date(date + 'T12:00:00'); // simple parse
        const dayStr = dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });

        // Extract names safely
        const getName = (roleId) => dayAssignments[roleId]?.assignedTo || '-';

        body.push([
            dayStr,
            getName('presider'),
            getName('preacher'),
            getName('acolyte'), // Assuming MC/Acolyte is one column for print
            getName('lector'),
            getName('musician')
        ]);
    });

    autoTable(doc, {
        head: head,
        body: body,
        startY: 35,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [66, 66, 66] },
    });

    doc.save(`Rol_Ministerios_${monthName}_${year}.pdf`);
}

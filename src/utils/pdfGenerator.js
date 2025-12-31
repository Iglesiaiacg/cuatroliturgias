import { jsPDF } from "jspdf";

/**
 * Generates a PDF for the given setlist and songs
 * @param {Object} setlist - { title, date, ... }
 * @param {Array} songs - Array of full song objects { title, key, lyrics, ... }
 */
export function generateSetlistPDF(setlist, songs) {
    const doc = new jsPDF();

    // Config
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = margin;

    // Helper: Add Page if needed
    const checkPageBreak = (spaceNeeded = 20) => {
        if (y + spaceNeeded > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
    };

    // --- TITLE PAGE / HEADER ---
    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.text(setlist.title || "Setlist", pageWidth / 2, y, { align: "center" });
    y += 10;

    doc.setFontSize(14);
    doc.setFont("times", "normal");
    const dateStr = setlist.dateObj ? setlist.dateObj.toLocaleDateString() : setlist.date;
    doc.text(dateStr || "", pageWidth / 2, y, { align: "center" });
    y += 20;

    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // --- SONGS ---
    songs.forEach((song, index) => {
        if (!song) return;

        checkPageBreak(40); // Check if we at least have space for title

        // Song Title & Metadata
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(`${index + 1}. ${song.title}`, margin, y);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const keyText = `Tono: ${song.key || '?'}`;
        const catText = song.category ? ` | ${song.category.toUpperCase()}` : "";
        doc.text(keyText + catText, margin, y + 6);
        y += 12;

        // Lyrics & Chords
        doc.setFont("courier", "normal"); // Monospace for chords alignment
        doc.setFontSize(10);

        const lines = song.lyrics.split('\n');

        lines.forEach(line => {
            checkPageBreak(5);
            // Simple cleaning of brackets for readability if preferred, 
            // OR keep them for musicians. Let's keep them but maybe styled?
            // jsPDF doesn't do rich text easily. We'll just dump text.
            // Improve: separate chords line if we had a parser here, 
            // but for now creating a readable monospaced dump is a huge win.

            // Clean tabs
            const cleanLine = line.replace(/\t/g, "    ");

            // If line wraps, split it
            const splitLines = doc.splitTextToSize(cleanLine, pageWidth - (margin * 2));
            doc.text(splitLines, margin, y);
            y += (5 * splitLines.length);
        });

        y += 10; // Spacing between songs
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: "right" });
        doc.text("Cuatro Liturgias - Generado Automáticamente", margin, pageHeight - 10);
    }

    doc.save(`${setlist.title.replace(/\s+/g, '_')}_Musicos.pdf`);
}

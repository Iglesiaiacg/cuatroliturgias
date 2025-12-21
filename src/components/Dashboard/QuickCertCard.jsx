import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function QuickCertCard() {
    const [name, setName] = useState('');
    const [type, setType] = useState('membresia');
    const [loading, setLoading] = useState(false);

    const generatePDF = () => {
        if (!name.trim()) return;
        setLoading(true);

        try {
            const doc = new jsPDF();

            // Fonts & Style
            doc.setFont("times", "bold");
            doc.setFontSize(24);
            doc.text("Iglesia Anglicana Comunidad de Gracia", 105, 40, { align: "center" });

            doc.setFontSize(18);
            doc.setFont("times", "italic");
            doc.text("A quien corresponda:", 105, 60, { align: "center" });

            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);

            const dateStr = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });

            let text = "";
            let title = "";

            if (type === 'membresia') {
                title = "CONSTANCIA DE MEMBRESÍA";
                text = `Por la presente hacemos constar que ${name} es un miembro activo y en plena comunión de esta congregación, participando fielmente en la vida sacramental y pastoral de nuestra iglesia.\n\nSe extiende la presente solicitud del interesado para los fines que estime convenientes.`;
            } else if (type === 'asistencia') {
                title = "CONSTANCIA DE ASISTENCIA";
                text = `Hacemos constar que ${name} asiste regularmente a los servicios divinos celebrados en esta parroquia.\n\nSe extiende la presente en la ciudad de Xalapa, Veracruz, a ${dateStr}.`;
            }

            doc.setFont("times", "bold");
            doc.setFontSize(16);
            doc.text(title, 105, 80, { align: "center" });

            doc.setFont("times", "normal");
            doc.setFontSize(12);
            doc.text(text, 105, 100, { align: "center", maxWidth: 140, lineHeightFactor: 1.5 });

            // Signature
            doc.line(70, 200, 140, 200); // Line
            doc.text("Pbro. Rector", 105, 210, { align: "center" });

            // Save
            doc.save(`Constancia_${name.replace(/\s+/g, '_')}.pdf`);

        } catch (e) {
            console.error(e);
            alert("Error al generar PDF");
        } finally {
            setLoading(false);
            setName('');
        }
    };

    return (
        <div className="neumorphic-card p-6 h-full">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-4">
                <span className="material-symbols-outlined text-sm">badge</span>
                <span className="text-xs font-bold uppercase tracking-wider">Constancias Express</span>
            </div>

            <div className="space-y-4">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre del Fiel"
                    className="w-full neumorphic-inset p-3 bg-transparent outline-none text-stone-900 dark:text-stone-100 placeholder-gray-400"
                />

                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full neumorphic-inset p-3 bg-transparent outline-none text-stone-900 dark:text-stone-100"
                >
                    <option value="membresia">Membresía</option>
                    <option value="asistencia">Asistencia</option>
                </select>

                <button
                    onClick={generatePDF}
                    disabled={!name.trim() || loading}
                    className="w-full neumorphic-btn py-3 text-sm font-bold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-primary"
                >
                    {loading ? (
                        <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-sm">print</span>
                            Generar PDF
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

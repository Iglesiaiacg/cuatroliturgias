
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function MinistryReportModal({ isOpen, onClose }) {
    const { currentUser, userRole } = useAuth();
    const [reportData, setReportData] = useState({
        period: new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
        workDone: '',
        observations: '',
        suggestions: ''
    });

    if (!isOpen) return null;

    const handleGeneratePDF = async () => {
        // --- 1. SAVE TO FIRESTORE ---
        try {
            await addDoc(collection(db, 'ministry_reports'), {
                userId: currentUser.uid,
                userName: currentUser.displayName || currentUser.email,
                userRole: userRole,
                period: reportData.period || 'General',
                workDone: reportData.workDone,
                observations: reportData.observations,
                suggestions: reportData.suggestions,
                createdAt: serverTimestamp()
            });
            console.log("Reporte guardado en la nube.");
        } catch (error) {
            console.error("Error al guardar reporte:", error);
            // Non-blocking error, user still gets their PDF
        }

        // --- 2. GENERATE PDF ---
        const doc = new jsPDF();

        // --- LOGO & HEADER ---
        const logoUrl = "https://raw.githubusercontent.com/Iglesiaiacg/cuatroliturgias/main/Emblema%20de%20la%20Iglesia%20Anglicana.png";
        try {
            const img = new Image();
            img.src = logoUrl;
            img.crossOrigin = "Anonymous";
            await new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
            });
            doc.addImage(img, 'PNG', 20, 15, 25, 25); // Adjusted ratio if needed
        } catch (e) {
            console.error("Logo error", e);
        }

        doc.setFont("times", "bold");
        doc.setFontSize(22);
        doc.text("IGLESIA ANGLICANA", 105, 25, { align: "center" });
        doc.text("COMUNIDAD DE GRACIA", 105, 33, { align: "center" });

        doc.setFontSize(14);
        doc.setTextColor(207, 163, 85); // Gold/Cream (#cfa355 approx) - RGB: 207, 163, 85
        doc.text("INFORME MINISTERIAL", 105, 45, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(0); // Reset black
        doc.setFont("times", "italic");
        doc.text(`Periodo: ${reportData.period} `, 105, 52, { align: "center" });

        // --- USER INFO ---
        doc.setLineWidth(0.5);
        doc.line(20, 58, 190, 58);

        doc.setFont("times", "bold");
        doc.text("Ministro / Servidor:", 20, 68);
        doc.setFont("times", "normal");
        doc.text(currentUser?.displayName || currentUser?.email, 60, 68);

        doc.setFont("times", "bold");
        doc.text("Rol / Ministerio:", 20, 75);
        doc.setFont("times", "normal");
        doc.text(userRole.toUpperCase(), 60, 75);

        doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-MX')} `, 140, 68);

        let y = 90;

        // --- HELPER WRAP TEXT ---
        const printSection = (title, content) => {
            doc.setFont("times", "bold");
            doc.setFontSize(12);
            doc.setTextColor(207, 163, 85); // Gold Header
            doc.text(title.toUpperCase(), 20, y);

            y += 7;
            doc.setFont("times", "normal");
            doc.setFontSize(11);
            doc.setTextColor(0);

            const splitText = doc.splitTextToSize(content || "Sin comentarios.", 170);
            doc.text(splitText, 20, y);

            y += (splitText.length * 5) + 10; // Dynamic spacing

            // Page break check
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
        };

        printSection("1. Trabajo Realizado y Logros", reportData.workDone);
        printSection("2. Observaciones Generales", reportData.observations);
        printSection("3. Propuestas de Mejora / Peticiones", reportData.suggestions);

        // --- SIGNATURES ---
        if (y < 230) y = 240; // Push to bottom if space permits
        else { doc.addPage(); y = 60; }

        doc.setDrawColor(100);
        doc.line(70, y, 140, y);
        doc.setFont("times", "bold");
        doc.setFontSize(10);
        doc.text("FIRMA", 105, y + 5, { align: "center" });
        doc.setFont("times", "italic");
        doc.setFontSize(8);
        doc.text(currentUser?.displayName || "Atentamente", 105, y + 10, { align: "center" });

        doc.save(`Informe_Ministerial_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    return createPortal(
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-[var(--bg-main)] rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">

                <div className="p-6 bg-[var(--bg-main)] border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">summarize</span>
                        Informe Ministerial
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-600 dark:hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                            <div className="w-full neumorphic-inset p-2 text-sm text-gray-700 dark:text-gray-300">
                                {currentUser?.displayName || currentUser?.email}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Periodo (Mes/Año)</label>
                            <input
                                type="text"
                                value={reportData.period}
                                onChange={e => setReportData({ ...reportData, period: e.target.value })}
                                className="w-full neumorphic-inset p-2 text-sm outline-none bg-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">1. Trabajo Realizado y Resultados</label>
                        <textarea
                            value={reportData.workDone}
                            onChange={e => setReportData({ ...reportData, workDone: e.target.value })}
                            className="w-full neumorphic-inset p-3 text-sm outline-none bg-transparent min-h-[100px]"
                            placeholder="Describa las actividades principales, cultos servidos, visitas realizadas..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">2. Observaciones Generales</label>
                        <textarea
                            value={reportData.observations}
                            onChange={e => setReportData({ ...reportData, observations: e.target.value })}
                            className="w-full neumorphic-inset p-3 text-sm outline-none bg-transparent min-h-[80px]"
                            placeholder="Dificultades encontradas, comentarios sobre la congregación..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">3. Propuestas de Mejora</label>
                        <textarea
                            value={reportData.suggestions}
                            onChange={e => setReportData({ ...reportData, suggestions: e.target.value })}
                            className="w-full neumorphic-inset p-3 text-sm outline-none bg-transparent min-h-[80px]"
                            placeholder="¿Qué necesitamos comprar? ¿Qué debemos cambiar?"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/10 flex justify-end gap-3">
                    <button onClick={onClose} className="btn-ghost">Cancelar</button>
                    <button onClick={handleGeneratePDF} className="btn-primary">
                        <span className="material-symbols-outlined text-sm">print</span>
                        Generar PDF Oficial
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
}

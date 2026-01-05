import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function RectorReportModal({ isOpen, onClose }) {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState(new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }));
    const [reports, setReports] = useState([]);
    const [remarks, setRemarks] = useState("En virtud de los informes recibidos y la observación pastoral, certifico el avance de la obra...");

    useEffect(() => {
        if (isOpen) {
            fetchReports();
        }
    }, [isOpen]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            // Fetch recent reports (last 50 for now)
            // In a real app, query by date range
            const q = query(collection(db, 'ministry_reports'), orderBy('createdAt', 'desc'), limit(50));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => doc.data());
            setReports(data);
        } catch (error) {
            console.error("Error fetching reports:", error);
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    const handleGenerateGeneralPDF = async () => {
        const doc = new jsPDF();

        // --- HEADER ---
        doc.setFont("times", "bold");
        doc.setFontSize(22);
        doc.text("IGLESIA ANGLICANA", 105, 25, { align: "center" });
        doc.text("COMUNIDAD DE GRACIA", 105, 33, { align: "center" });

        doc.setFontSize(16);
        doc.setTextColor(207, 163, 85); // Liturgical Gold
        doc.text("INFORME GENERAL AL OBISPO", 105, 45, { align: "center" });

        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.setFont("times", "italic");
        doc.text(`Rector: ${currentUser?.displayName || 'Rev. Alexis González'}`, 105, 52, { align: "center" });
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 105, 58, { align: "center" });

        doc.setLineWidth(0.5);
        doc.line(20, 65, 190, 65);

        let y = 75;

        const checkPage = (height = 10) => {
            if (y + height > 270) {
                doc.addPage();
                y = 20;
            }
        };

        // --- SECTION: RESUMEN DE MINISTERIOS ---
        doc.setFont("times", "bold");
        doc.setFontSize(14);
        doc.setTextColor(207, 163, 85);
        doc.text("I. RESUMEN DE ACTIVIDAD MINISTERIAL", 20, y);
        y += 10;

        if (reports.length === 0) {
            doc.setFont("times", "italic");
            doc.setTextColor(100);
            doc.setFontSize(10);
            doc.text("No hay reportes individuales registrados en el sistema.", 20, y);
            y += 10;
        } else {
            reports.forEach((rep, index) => {
                checkPage(40);

                // Minister Name Header
                doc.setFont("times", "bold");
                doc.setFontSize(11);
                doc.setTextColor(0);
                doc.text(`${index + 1}. ${rep.userName} (${rep.userRole}) - ${rep.period}`, 20, y);
                y += 5;

                // Content
                doc.setFont("times", "normal");
                doc.setFontSize(10);
                doc.setTextColor(60);

                const workText = doc.splitTextToSize(`LOGROS: ${rep.workDone || 'Sin reporte'}`, 170);
                doc.text(workText, 25, y);
                y += (workText.length * 4) + 2;

                if (rep.suggestions) {
                    const suggText = doc.splitTextToSize(`PETICIONES: ${rep.suggestions}`, 170);
                    doc.text(suggText, 25, y);
                    y += (suggText.length * 4) + 2;
                }

                y += 5; // Spacing between ministers
            });
        }

        checkPage(20);
        // --- RECTOR'S REMARKS (Dynamic) ---
        y += 5;
        doc.setFont("times", "bold");
        doc.setFontSize(14);
        doc.setTextColor(207, 163, 85);
        doc.text("II. OBSERVACIONES DEL RECTOR", 20, y);
        y += 10;

        doc.setFont("times", "normal");
        doc.setTextColor(0);
        doc.setFontSize(11);

        // Use remarks from state
        const splitRemarks = doc.splitTextToSize(remarks, 170);
        doc.text(splitRemarks, 20, y);
        y += (splitRemarks.length * 5) + 5;

        doc.save(`Informe_General_Obispo_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    return createPortal(
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-[var(--bg-main)] rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">

                <div className="p-6 bg-[var(--bg-main)] border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">history_edu</span>
                        Informe General al Obispo
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-600 dark:hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    <div className="neumorphic-card p-4 bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20">
                        <h3 className="text-sm font-bold text-orange-800 dark:text-orange-200 mb-2">Resumen de Datos</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Se han encontrado <strong className="text-primary">{reports.length}</strong> reportes de ministerios recientes.
                            Este documento compilará automáticamente esta información para su presentación.
                        </p>
                    </div>

                    {/* Rector's Remarks Editor */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">II. Observaciones del Rector</h3>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="w-full h-32 p-3 text-sm border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                            placeholder="Escriba aquí sus observaciones generales..."
                        />
                        <p className="text-[10px] text-gray-400 mt-1 max-w-prose">
                            Este texto aparecerá al final del informe oficial.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">VISTA PREVIA DE APORTACIONES</h3>
                        {loading ? (
                            <p className="text-center text-gray-500 text-sm">Cargando reportes...</p>
                        ) : (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                {reports.length === 0 && <p className="text-sm text-gray-400 italic">No hay reportes disponibles.</p>}
                                {reports.map((rep, idx) => (
                                    <div key={idx} className="p-3 rounded-lg border border-gray-100 dark:border-white/5 bg-white dark:bg-white/5">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{rep.userName}</span>
                                            <span className="text-[10px] bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full text-gray-500">{rep.userRole}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2">{rep.workDone}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/10 flex justify-end gap-3">
                    <button onClick={onClose} className="btn-ghost">Cancelar</button>
                    <button
                        onClick={handleGenerateGeneralPDF}
                        className="btn-primary"
                        disabled={loading}
                    >
                        <span className="material-symbols-outlined text-sm">print</span>
                        Generar Informe General
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
}

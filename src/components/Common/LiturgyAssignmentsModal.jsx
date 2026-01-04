import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AssignmentModal from './AssignmentModal';

export default function LiturgyAssignmentsModal({ isOpen, onClose, docContent }) {
    const [sections, setSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState(null);
    const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);

    // Parse HTML content to find headers and their following content
    useEffect(() => {
        if (!docContent) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(docContent, 'text/html');
        const foundSections = [];

        // Headers to look for (Standard Liturgical Headers)
        const targetHeaders = [
            "Primera Lectura",
            "Salmo",
            "Segunda Lectura",
            "Evangelio",
            "Oración Colecta",
            "Homilía"
        ];

        // Find all H1, H2, H3 tags
        const headers = doc.querySelectorAll('h1, h2, h3');

        headers.forEach(header => {
            const title = header.innerText.trim();
            // Check if title roughly matches a target (or is a target)
            const matched = targetHeaders.find(t => title.includes(t));

            if (matched || title.length > 0) {
                // Get content until next header
                let content = "";
                let sibling = header.nextElementSibling;
                while (sibling && !['H1', 'H2', 'H3'].includes(sibling.tagName)) {
                    content += sibling.innerText + "\n\n";
                    sibling = sibling.nextElementSibling;
                }

                if (content.trim().length > 10) { // Only keep if it has content
                    foundSections.push({
                        title: title,
                        content: content.trim()
                    });
                }
            }
        });

        setSections(foundSections);
    }, [docContent]);

    const handleSelect = (section) => {
        setSelectedSection(section);
        setIsAssignmentOpen(true);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
            {/* Nested Assignment Modal */}
            {isAssignmentOpen && selectedSection && (
                <AssignmentModal
                    isOpen={isAssignmentOpen}
                    onClose={() => setIsAssignmentOpen(false)}
                    taskName={selectedSection.title}
                    contextData={selectedSection.content}
                    onAssign={() => {
                        setIsAssignmentOpen(false);
                        // Optional: mark as assigned in local state?
                    }}
                />
            )}

            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-gray-100 dark:border-stone-800">
                <div className="p-6 border-b border-gray-100 dark:border-stone-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Asignar Lecturas</h2>
                        <p className="text-sm text-gray-500">Selecciona una parte para enviarla por WhatsApp.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {sections.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <span className="material-symbols-outlined text-4xl mb-2">find_in_page</span>
                            <p>No se detectaron secciones asignables automáticamente.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {sections.map((section, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(section)}
                                    className="text-left p-4 rounded-xl border border-gray-200 dark:border-stone-700 hover:border-primary dark:hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all group bg-gray-50 dark:bg-stone-800/50"
                                >
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors mb-2">
                                        {section.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 line-clamp-3 font-serif italic">
                                        "{section.content}"
                                    </p>
                                    <div className="mt-3 flex items-center justify-end text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        Asignar <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-stone-800 bg-gray-50 dark:bg-stone-800/30 flex justify-end rounded-b-2xl">
                    <button onClick={onClose} className="btn-primary">
                        Terminar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

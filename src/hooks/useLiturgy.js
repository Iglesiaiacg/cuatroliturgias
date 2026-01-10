import { useState, useEffect } from 'react';
import { getLiturgicalCycle, getSeason, getTips, buildPrompt, identifyFeast } from '../services/liturgy';
import { generateLiturgy } from '../services/gemini';
import { getPreferences, savePreferences, addToHistory } from '../services/storage';
import { db, auth } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { marked } from 'marked';
import { LITURGIA_FIJA } from '../data/liturgia_constants';

export const useLiturgy = () => {
    // Init state: Tradition from local storage, Date is always today by default
    const [tradition, setTradition] = useState(() => getPreferences().tradition || 'anglicana');
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Computed State
    const [calculatedFeast, setCalculatedFeast] = useState("");

    // UI State
    const [docContent, setDocContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingTip, setLoadingTip] = useState("");
    const [error, setError] = useState(null);
    const [cycleInfo, setCycleInfo] = useState("");
    const [season, setSeason] = useState("ordinario");

    // Effect: Update computed info when Date/Tradition changes
    useEffect(() => {
        const feastName = identifyFeast(selectedDate);
        const cycle = getLiturgicalCycle(selectedDate);
        const currentSeason = getSeason(selectedDate);

        setCalculatedFeast(feastName);
        setCycleInfo(cycle.text);
        setSeason(currentSeason);

        // Save prefs (only tradition, date is ephemeral usually, but could save if needed)
        savePreferences(tradition, null);

    }, [selectedDate, tradition]);

    const generate = async () => {
        setLoading(true);
        setError(null);
        setDocContent(null);

        // Start tips
        setLoadingTip(getTips());
        const tipInterval = setInterval(() => {
            setLoadingTip(getTips());
        }, 4000);

        try {
            // Get label for prompt directly from calculation
            const label = identifyFeast(selectedDate);
            const cycle = getLiturgicalCycle(selectedDate);

            // 1. BUILD DUAL PROMPTS (Surgical Split)
            const promptStructure = buildPrompt({
                selectedDate,
                tradition,
                celebrationLabel: label,
                mode: 'structure' // Asking for placeholders [[LECTURA_1]]...
            });

            const promptReadings = buildPrompt({
                selectedDate,
                tradition,
                celebrationLabel: label,
                mode: 'readings' // Asking for pure text
            });

            // 2. PARALLEL EXECUTION
            // Only split for 'romana' or generally for all? Let's apply to ALL to be consistent and safe.
            // Actually, if tradition is 'tridentina', the structure prompt handles everything differently.
            // But let's assume the new split logic is robust enough for all if configured.
            // For now, let's try the split strategy primarily, as it isolates failures.

            console.log("🚀 Starting Surgical Liturgy Generation...");
            const [structureRes, readingsRes] = await Promise.all([
                generateLiturgy(promptStructure),
                generateLiturgy(promptReadings)
            ]);

            console.log("✅ Generation Complete. Merging...");

            let finalMarkdown = structureRes;

            // 3. MERGE LOGIC (Inject Readings into Structure)
            // Helper to extract reading text
            const extractReading = (text, marker) => {
                const regex = new RegExp(`\\[\\[${marker}\\]\\]([\\s\\S]*?)(?=\\[\\[|$)`, 'i');
                const match = text.match(regex);
                return match ? match[1].trim() : null;
            };

            const markers = ['LECTURA_1', 'SALMO', 'LECTURA_2', 'EVANGELIO'];

            markers.forEach((marker) => {
                const content = extractReading(readingsRes, marker);
                if (content && content.length > 20) { // Basic sanity check
                    // Inject content
                    finalMarkdown = finalMarkdown.replace(`[[${marker}]]`, `\n${content}\n`);
                } else {
                    // Fallback if reading missing
                    // Don't replace with empty, maybe keep marker or put a note?
                    // Better to put a note.
                    // finalMarkdown = finalMarkdown.replace(`[[${marker}]]`, `*(Texto de ${marker} no disponible - Ver Leccionario)*`);
                    // Actually, if we leave [[MARKER]], the rubric styling might pick it up?
                    // Let's replace with a placeholder text to look clean.
                    finalMarkdown = finalMarkdown.replace(`[[${marker}]]`, `\n> *(Texto bíblico de ${marker} pendiente. Consulte su leccionario).*`);
                }
            });

            // 4. INSERT FIXED PRAYERS (Hybrid Injection)
            // This happens on the Combined Text
            Object.keys(LITURGIA_FIJA).forEach((key) => {
                finalMarkdown = finalMarkdown.split(key).join(LITURGIA_FIJA[key]);
            });

            // 5. CLEANUP & PARSE
            // Strip HTML/Codes
            finalMarkdown = finalMarkdown
                .replace(/```html/g, '')
                .replace(/```/g, '')
                .replace(/<!DOCTYPE html>/gi, '')
                .replace(/<html>/gi, '')
                .replace(/<\/html>/gi, '')
                .replace(/<head>[\s\S]*?<\/head>/gi, '')
                .replace(/<body>/gi, '')
                .replace(/<\/body>/gi, '');

            // Convert Markdown to HTML
            const htmlContent = marked.parse(finalMarkdown);

            // Clean specific parsing markers
            let cleanText = htmlContent
                .replace(/\$\\dagger\$/g, '†')
                .replace(/\[\[(.*?)\]\]/g, '<span class="rubric">$1</span>');

            setDocContent(cleanText);

            // Save to history
            addToHistory(cleanText, label, tradition);

            // SAVE TO FIREBASE
            if (auth.currentUser) {
                try {
                    await addDoc(collection(db, 'liturgies'), {
                        userId: auth.currentUser.uid,
                        title: label,
                        date: selectedDate,
                        content: cleanText, // Storing HTML for now as per design
                        tradition: tradition,
                        createdAt: serverTimestamp()
                    });
                } catch (e) {
                    console.warn("Cloud backup skipped:", e.code);
                }
            }

        } catch (err) {
            setError(err.message || "Error al generar la liturgia");
        } finally {
            clearInterval(tipInterval);
            setLoading(false);
        }
    };

    return {
        tradition,
        setTradition,
        selectedDate,
        setSelectedDate, // Exposed for DatePicker
        calculatedFeast, // Exposed for UI display
        cycleInfo,
        season,
        loading,
        loadingTip,
        error,
        docContent,
        setDocContent,
        generate
    };
};

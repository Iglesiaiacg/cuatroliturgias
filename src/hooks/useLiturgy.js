import { useState, useEffect } from 'react';
import { getLiturgicalCycle, getSeason, getTips, buildPrompt, identifyFeast } from '../services/liturgy';
import { generateLiturgy } from '../services/gemini';
import { getPreferences, savePreferences, addToHistory } from '../services/storage';
import { db, auth } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { marked } from 'marked';

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

    // Handle Generation
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

            const prompt = buildPrompt({
                selectedDate,
                tradition,
                celebrationLabel: label
            });

            const markdown = await generateLiturgy(prompt);

            // 1. Convert Markdown to HTML
            const htmlContent = marked.parse(markdown);

            // 2. Clean specific markers (Post-processing on HTML)
            let cleanText = htmlContent
                .replace(/\$\\dagger\$/g, '†')
                .replace(/\[\[(.*?)\]\]/g, '<span class="rubric">$1</span>');

            setDocContent(cleanText);

            // Save to history (Local + Cloud)
            addToHistory(cleanText, label, tradition);

            // SAVE TO FIREBASE IF LOGGED IN
            if (auth.currentUser) {
                try {
                    await addDoc(collection(db, 'liturgies'), {
                        userId: auth.currentUser.uid,
                        title: label,
                        date: selectedDate, // Save as Date object or Timestamp
                        content: cleanText,
                        tradition: tradition,
                        createdAt: serverTimestamp()
                    });
                } catch (e) {
                    console.error("Error saving to cloud history:", e);
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

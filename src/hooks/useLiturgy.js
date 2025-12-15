import { useState, useEffect } from 'react';
import { getLiturgicalCycle, getSeason, getTips, buildPrompt } from '../services/liturgy';
import { generateLiturgy } from '../services/gemini';
import { getPreferences, savePreferences, addToHistory } from '../services/storage';
import { LITURGY_PROPIOS, CONFIG } from '../services/config';

export const useLiturgy = () => {
    // Init state from local storage or defaults
    const [tradition, setTradition] = useState(() => getPreferences().tradition);
    const [celebrationKey, setCelebrationKey] = useState(() => getPreferences().celebrationKey);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [docContent, setDocContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingTip, setLoadingTip] = useState("");
    const [error, setError] = useState(null);
    const [cycleInfo, setCycleInfo] = useState("");
    const [season, setSeason] = useState("ordinario");

    // Effect: Update Date & Cycle when celebration changes
    useEffect(() => {
        let newDate = new Date();
        newDate.setHours(12, 0, 0, 0);

        if (celebrationKey === 'HOY_CALENDARIO') {
            // Keep today
        } else if (celebrationKey === 'PROXIMO_DOMINGO') {
            const daysUntilSunday = (7 - newDate.getDay()) % 7;
            newDate.setDate(newDate.getDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday));
        } else {
            // For fixed keys, we just use today as reference for cycle calculation
            // but the prompt uses the label.
        }

        setSelectedDate(newDate);
        setCycleInfo(getLiturgicalCycle(newDate).text);
        setSeason(getSeason(newDate));

        // Save prefs
        savePreferences(tradition, celebrationKey);

    }, [celebrationKey, tradition]);

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
            // Get label for prompt
            const options = LITURGY_PROPIOS[tradition] || [];
            let label = "";

            // Flatten options to find label
            for (const group of options) {
                if (group.value === celebrationKey) label = group.label;
                if (group.options) {
                    const found = group.options.find(o => o.value === celebrationKey);
                    if (found) label = found.label;
                }
            }
            if (!label) label = celebrationKey; // Fallback

            const prompt = buildPrompt({
                selectedDate,
                tradition,
                celebrationKey,
                celebrationLabel: label
            });

            const markdown = await generateLiturgy(prompt);

            // Clean specific markers
            let cleanText = markdown
                .replace(/\$\\dagger\$/g, '†')
                .replace(/\[\[(.*?)\]\]/g, '<span class="rubric">$1</span>');

            setDocContent(cleanText);

            // Save to history
            addToHistory(cleanText, label, tradition);

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
        celebrationKey,
        setCelebrationKey,
        selectedDate,
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

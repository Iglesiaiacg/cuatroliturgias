import { useState, useEffect } from 'react';
import { getLiturgicalCycle, getSeason, getTips, buildPrompt, identifyFeast } from '../services/liturgy';
import { generateLiturgy } from '../services/gemini';
import { fetchEvangelizoReadings, formatEvangelizoReadings } from '../services/evangelizo';
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

            // 🔍 DEBUG: Log tradition value
            console.log("================== GENERATION DEBUG ==================");
            console.log("📍 Current Tradition:", tradition);
            console.log("📅 Selected Date:", selectedDate);
            console.log("🎭 Feast Label:", label);
            console.log("=====================================================");

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

            console.log("🚀 Starting Liturgy Generation...");

            // For Catholic Rite, use STATIC TEMPLATE + Evangelizo for readings
            let readingsRes, structureRes;

            if (tradition === 'catolica') {
                console.log("   📖 Structure: Static Template (No AI)");
                console.log("   📜 Readings: Evangelizo API (Official Catholic Texts)");
                console.log("   🎵 Alleluia: Gemini (Contextual)");
                console.log("   🙏 Intercessions: Gemini (Contextual)");
                console.log("   ✠ Preface & Prayers: Gemini (Proper)");
                console.log("   🎨 Antiphons: Gemini (Gradual)");
                console.log("   ✅ CONFIRMED: Using static template + Evangelizo for catolica tradition");

                try {
                    // Import template and services
                    const { buildCatholicMassTemplate } = await import('../templates/catholicMass.js');
                    const { generatePrayersOfFaithful, generateAlleluiaVerse } = await import('../services/prayersOfFaithful.js');
                    const { getLiturgicalColor, generatePreface, generateProperPrayers, generateAntiphons } = await import('../services/liturgicalPropers.js');

                    // Get readings from Evangelizo
                    const evangelizoData = await fetchEvangelizoReadings(selectedDate);
                    readingsRes = formatEvangelizoReadings(evangelizoData);
                    console.log("✅ Readings fetched from Evangelizo");

                    // Determine liturgical color
                    const colorInfo = getLiturgicalColor(selectedDate, label, getSeason(selectedDate));
                    console.log(`✅ Liturgical Color: ${colorInfo.color} ${colorInfo.emoji}`);

                    // Generate contextual Alleluia verse
                    const alleluiaVerse = await generateAlleluiaVerse(evangelizoData.evangelio);
                    console.log("✅ Alleluia verse generated");

                    // Generate contextual Prayers of the Faithful
                    const intercessions = await generatePrayersOfFaithful(evangelizoData, label);
                    console.log("✅ Prayers of the Faithful generated");

                    // Generate Preface
                    const preface = await generatePreface(label, evangelizoData.evangelio, getSeason(selectedDate));
                    console.log("✅ Preface generated");

                    // Generate Proper Prayers
                    const properPrayers = await generateProperPrayers(label, evangelizoData);
                    console.log("✅ Proper Prayers generated");

                    // Generate Antiphons
                    const antiphons = await generateAntiphons(label, evangelizoData.evangelio);
                    console.log("✅ Antiphons generated");

                    // Use static template for structure
                    structureRes = buildCatholicMassTemplate({
                        feastLabel: label,
                        season: getSeason(selectedDate),
                        date: selectedDate,
                        liturgicalColor: colorInfo,
                        alleluiaVerse: alleluiaVerse,
                        intercessions: intercessions,
                        preface: preface,
                        properPrayers: properPrayers,
                        antiphons: antiphons
                    });
                    console.log("✅ Static structure template generated");

                } catch (error) {
                    console.warn("⚠️ Evangelizo/Template failed, falling back to Gemini:", error);
                    // Fallback to full Gemini if anything fails
                    structureRes = await generateLiturgy(promptStructure);
                    readingsRes = await generateLiturgy(promptReadings);
                }
            } else {
                console.log("   📖 Structure: Gemini 2.0 Flash (v1)");
                console.log("   📜 Readings: Gemini 2.0 Flash (v1)");
                console.log("   ℹ️  Tradition is NOT catolica, using Gemini. Current value:", tradition);

                // Other traditions use Gemini for everything
                structureRes = await generateLiturgy(promptStructure);
                readingsRes = await generateLiturgy(promptReadings);
            }

            console.log("✅ Generation Complete. Merging...");

            let finalMarkdown = structureRes;

            // 3. MERGE LOGIC (Inject Readings into Structure)
            // For catolica tradition, readingsRes has format: [[MARKER]]\n**Citation**\nContent
            // We need to extract ONLY the content (citation + text) without the marker

            const extractReadingContent = (text, marker) => {
                if (!text) return null;

                // Look for pattern: [[MARKER]]\nContent (until next marker or end)
                // Note: Between markers there can be multiple newlines, so use \s* before next [[
                const regex = new RegExp(`\\[\\[${marker}\\]\\]\\s*([\\s\\S]*?)(?=\\s*\\[\\[|$)`, 'i');
                const match = text.match(regex);

                if (match && match[1]) {
                    let content = match[1].trim();
                    // Remove any accidental section headers
                    content = content.replace(/^###\s+.+$/gm, '').trim();
                    // Fix common typos
                    content = content.replace(/Bautizmo/g, 'Bautismo');

                    console.log(`✅ Extracted ${marker}: ${content.substring(0, 50)}...`);
                    return content;
                }

                console.warn(`⚠️ Could not extract ${marker} from readings`);
                return null;
            };

            // Extract and inject evangelist FIRST (before replacing markers)
            if (tradition === 'catolica' && readingsRes) {
                const { extractEvangelist } = await import('../services/evangelizo.js');

                // Extract evangelist from gospel citation
                const evangelioMatch = readingsRes.match(/\[\[EVANGELIO\]\]\s*\*\*([^*]+)\*\*/);
                if (evangelioMatch) {
                    const gospelCitation = evangelioMatch[1];
                    const evangelist = extractEvangelist(gospelCitation);
                    console.log(`✅ Extracted evangelist: ${evangelist}`);
                    finalMarkdown = finalMarkdown.replace(/\[\[EVANGELISTA\]\]/g, evangelist);
                } else {
                    console.warn('⚠️ Could not extract evangelist, using default: Mateo');
                    finalMarkdown = finalMarkdown.replace(/\[\[EVANGELISTA\]\]/g, 'Mateo');
                }
            }

            // Now replace each reading marker with its content
            const markers = ['LECTURA_1', 'SALMO', 'LECTURA_2', 'ACCLAMATION', 'EVANGELIO'];

            console.log('==== STARTING READING REPLACEMENT ====');
            console.log('readingsRes length:', readingsRes ? readingsRes.length : 0);
            console.log('readingsRes preview:', readingsRes ? readingsRes.substring(0, 200) + '...' : 'NULL');

            markers.forEach((marker) => {
                console.log(`\n--- Processing ${marker} ---`);
                const content = extractReadingContent(readingsRes, marker);
                if (content) {
                    console.log(`  Found content, length: ${content.length}`);
                    console.log(`  Content preview: ${content.substring(0, 80)}...`);

                    // Replace ALL occurrences of the marker (use regex with g flag)
                    const markerRegex = new RegExp(`\\[\\[${marker}\\]\\]`, 'g');
                    const beforeLength = finalMarkdown.length;
                    finalMarkdown = finalMarkdown.replace(markerRegex, content);
                    const afterLength = finalMarkdown.length;

                    console.log(`  Replaced. Markdown length: ${beforeLength} → ${afterLength}`);
                } else {
                    console.warn(`  ⚠️ No content found for ${marker}`);

                    // Special handling for LECTURA_2 (Segunda Lectura)
                    // On weekdays, there is no Second Reading, so we remove the entire section
                    if (marker === 'LECTURA_2') {
                        console.log('  Removing entire Segunda Lectura section (weekday mass)');
                        // Remove the entire Segunda Lectura section including header and responses
                        // Pattern: ### Segunda Lectura ... [[LECTURA_2]] ... Palabra de Dios ... Te alabamos, Señor ... ---
                        const sectionRegex = /###\s+Segunda Lectura[\s\S]*?\[\[LECTURA_2\]\][\s\S]*?Te alabamos, Señor\.[\s\S]*?---/;
                        finalMarkdown = finalMarkdown.replace(sectionRegex, '');
                    } else {
                        // For other readings (LECTURA_1, SALMO, EVANGELIO), show placeholder
                        // These MUST always exist, so if missing it's an error
                        const markerRegex = new RegExp(`\\[\\[${marker}\\]\\]`, 'g');
                        finalMarkdown = finalMarkdown.replace(markerRegex, `\n> *(Lectura pendiente. Consulte su leccionario).*\n`);
                    }
                }
            });

            console.log('==== READING REPLACEMENT COMPLETE ====\n');

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

            // Convert Markdown to HTML (Strip Cloaking: ~, | and Dot-Masking)
            // Masking cleaner: removes dots between ALL characters (E.n. .a.q.u.e.l -> En aquel)
            const htmlContent = marked.parse(finalMarkdown
                .replace(/[~|]/g, '')
                .replace(/\.(?=\s)/g, '')  // Remove dots before spaces: ". " -> " "
                .replace(/([a-zA-ZñÑáéíóúÁÉÍÓÚ])\.(?=[a-zA-ZñÑáéíóúÁÉÍÓÚ\s])/g, '$1')  // Remove dots between letters
            );

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

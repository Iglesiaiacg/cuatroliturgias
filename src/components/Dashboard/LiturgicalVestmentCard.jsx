import { getLiturgicalColor, getLiturgicalRubrics, identifyFeast, getLiturgicalCycle } from '../../services/liturgy';

export default function LiturgicalVestmentCard({ date }) {
    const colorData = getLiturgicalColor(date);
    // Default to 'romana' or fetch from settings context if available. For now 'romana' is safe default.
    const rubrics = getLiturgicalRubrics(date, 'romana');

    // SENIOR LITURGIST ADDITIONS:
    const cycle = getLiturgicalCycle(date);
    const feastName = identifyFeast(date);

    return (
        <div className={`neumorphic-card p-6 border-l-4 ${colorData.classes?.split(' ')[0]?.replace('bg-', 'border-')} relative overflow-hidden`}>
            {/* Background Tint */}
            <div className={`absolute inset-0 opacity-10 ${colorData.classes?.split(' ')[0]}`}></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="uppercase text-xs font-bold text-gray-500 tracking-wider mb-1">
                            {cycle.text}
                        </h3>
                        <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full shadow-lg border-2 border-white dark:border-stone-800 ${colorData.code === 'purple' ? 'bg-purple-700' : colorData.code === 'red' ? 'bg-red-700' : colorData.code === 'green' ? 'bg-green-700' : 'bg-slate-100'}`}></span>
                            <div>
                                <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900 dark:text-white leading-tight capitalize">
                                    {feastName}
                                </h2>
                                <p className="text-xs font-bold opacity-60 uppercase">{colorData.name}</p>
                            </div>
                        </div>
                    </div>
                    {/* Visual Vestment Icon Placeholder */}
                    <div className={`p-2 rounded-xl bg-white/50 dark:bg-black/20 text-3xl ${colorData.code === 'purple' ? 'text-purple-700' : colorData.code === 'red' ? 'text-red-700' : colorData.code === 'green' ? 'text-green-700' : 'text-slate-700'}`}>
                        <span className="material-symbols-outlined">apparel</span>
                    </div>
                </div>

                {/* RUBRICS CHECKLIST */}
                <div className="grid grid-cols-3 gap-2 mt-4 bg-white/60 dark:bg-black/20 p-3 rounded-xl backdrop-blur-sm">
                    <div className={`flex flex-col items-center p-2 rounded-lg border ${rubrics.gloria ? 'border-green-200 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'border-gray-200 bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
                        <span className="text-[10px] uppercase font-bold">Gloria</span>
                        <span className="material-symbols-outlined text-lg">{rubrics.gloria ? 'check_circle' : 'cancel'}</span>
                    </div>
                    <div className={`flex flex-col items-center p-2 rounded-lg border ${rubrics.alleluia ? 'border-green-200 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'border-gray-200 bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
                        <span className="text-[10px] uppercase font-bold">Aleluya</span>
                        <span className="material-symbols-outlined text-lg">{rubrics.alleluia ? 'check_circle' : 'cancel'}</span>
                    </div>
                    <div className={`flex flex-col items-center p-2 rounded-lg border ${rubrics.credo ? 'border-green-200 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'border-gray-200 bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
                        <span className="text-[10px] uppercase font-bold">Credo</span>
                        <span className="material-symbols-outlined text-lg">{rubrics.credo ? 'check_circle' : 'cancel'}</span>
                    </div>
                </div>

                <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500">Prefacio Sugerido: <span className="font-bold text-gray-700 dark:text-gray-300">{rubrics.preface}</span></p>
                </div>
            </div>
        </div>
    );
}

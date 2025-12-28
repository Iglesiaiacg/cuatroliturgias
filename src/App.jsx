import { useState, useRef, useEffect } from 'react'
import { asBlob } from 'html-docx-js-typescript'
import { saveAs } from 'file-saver'
import { useLiturgy } from './hooks/useLiturgy'
import { useSettings } from './hooks/useSettings'
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './services/firebase';
import { AuthProvider, useAuth } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext';
import { DirectoryProvider } from './context/DirectoryContext';
import { MusicProvider } from './context/MusicContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import GeneratorToolbar from './components/Liturgy/GeneratorToolbar'
import Toolbar from './components/Layout/Toolbar'
import Preview from './components/Liturgy/Preview'
import Loading from './components/Liturgy/Loading'
import EmptyState from './components/Liturgy/EmptyState'
import HistoryModal from './components/Common/HistoryModal'
import AssignmentModal from './components/Common/AssignmentModal'

import Toast from './components/Common/Toast'

// New Shell Components
import HomeView from './components/Views/HomeView'
import CalendarView from './components/Views/CalendarView'
import OccasionalServicesView from './components/Views/OccasionalServicesView'
import OfferingsView from './components/Views/OfferingsView'
import DirectoryView from './components/Views/DirectoryView'
import SacristyView from './components/Views/SacristyView'
import TopBar from './components/Layout/TopBar'
import PulpitView from './components/Liturgy/PulpitView'
import BackgroundWrapper from './components/Layout/BackgroundWrapper'
import LoginView from './components/Auth/LoginView'
import ChatWidget from './components/Chat/ChatWidget';
import MusicView from './components/Views/MusicView';

import UserManagement from './components/Auth/UserManagement'
import ProfileModal from './components/Auth/ProfileModal'

function AppContent() {
  const { currentUser, userRole, logout, checkPermission } = useAuth()

  const {
    tradition, setTradition,
    selectedDate, setSelectedDate,
    calculatedFeast,
    season,
    loading, loadingTip, error,
    docContent, setDocContent,
    generate
  } = useLiturgy()

  // Use centralized settings hook
  const { settings, updateSetting } = useSettings();
  const rubricLevel = settings.rubricLevel;

  // UI State - Initialize from Hash
  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState(getTabFromHash());

  // Hash Navigation Sync
  useEffect(() => {
    const handleHashChange = () => {
      setActiveTabState(getTabFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Enhanced Navigation - Pushes to Browser History
  const navigateTo = (tab) => {
    window.location.hash = tab;
    // State updates automatically via the effect
  };

  const goBack = () => {
    const hash = window.location.hash.replace('#', '');
    if (!hash || hash === 'dashboard') return;
    window.history.back();
  };

  // Backward compatibility wrapper (for props looking for setActiveTab)
  const setActiveTab = navigateTo;
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isPulpitOpen, setIsPulpitOpen] = useState(false)
  const [toast, setToast] = useState({ message: '', type: '' })
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false)


  // Navigation State
  const [serviceTitle, setServiceTitle] = useState(null)

  const previewRef = useRef(null)

  // Handlers
  const handleToast = (msg, type = 'success') => setToast({ message: msg, type })

  const handleGenerate = async () => {
    setServiceTitle(null) // Clear service title when generating fresh liturgy
    try {
      await generate()
      handleToast("Liturgia generada correctamente")
      // Ensure we stay on generator view to see result
    } catch (e) {
      handleToast(e.message || "Error al generar", "error")
      if (e.message.includes('API Key')) {
        setTimeout(() => setIsProfileOpen(true), 1500)
      }
    }
  }

  // AUTO-LOAD PINNED LITURGY (Observer Mode)
  useEffect(() => {
    // If user exists but CANNOT generate (Observer/Server), sync with Pinned Liturgy
    if (currentUser && checkPermission && !checkPermission('generate_liturgy')) {
      const unsub = onSnapshot(doc(db, 'config', 'pinned_liturgy'), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.content) {
            setDocContent(data.content);

            if (data.date) {
              const d = data.date.seconds ? new Date(data.date.seconds * 1000) : new Date(data.date);
              setSelectedDate(d);
            }

            if (data.title) {
              setServiceTitle(data.title);
            }
          }
        }
      });
      return () => unsub();
    }
  }, [currentUser, checkPermission, setDocContent, setSelectedDate]);

  const handlePinLiturgy = async () => {
    if (!docContent) return;
    try {
      await setDoc(doc(db, 'config', 'pinned_liturgy'), {
        content: docContent,
        date: selectedDate,
        title: calculatedFeast || serviceTitle || "Liturgia",
        rubricLevel: rubricLevel,
        pinnedAt: new Date(),
        pinnedBy: currentUser?.email || 'unknown'
      });
      handleToast("Liturgia fijada en el Inicio para todos", "success");
    } catch (e) {
      console.error(e);
      handleToast("Error al fijar liturgia: " + e.message, "error");
    }
  }

  const handleRestoreHistory = (item) => {
    setDocContent(item.content)
    handleToast("Liturgia restaurada del historial")
    setIsHistoryOpen(false)
    setActiveTab('generator') // Switch to generator to view restored content
  }

  // Document Actions
  const handlePrint = () => window.print()

  const handleDownload = async (type) => {
    if (!docContent) return

    let contentToSave = docContent
    if (previewRef.current) {
      contentToSave = previewRef.current.innerHTML
    }

    // --- 1. PREPARE CONTENT ---
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = contentToSave

    // Cleanup
    const watermark = tempDiv.querySelector('.text-\\[300px\\]');
    if (watermark) {
      if (watermark.parentElement) watermark.parentElement.remove();
      else watermark.remove();
    }

    const icons = tempDiv.querySelectorAll('.material-symbols-outlined');
    icons.forEach(icon => icon.remove());

    const hints = tempDiv.querySelectorAll('.animate-pulse');
    hints.forEach(h => h.remove());

    if (type === 'bulletin') {
      tempDiv.querySelectorAll('p').forEach(p => {
        if (p.textContent.toLowerCase().includes('(en secreto)')) p.remove()
      })
    }

    // --- INJECT MISSING RESPONSES (User Request) ---
    // Ensure "Lector: Palabra de Dios" appears before Psalm and Alleluia if not present.
    // We operate on innerHTML to use Regex across tags.
    let html = tempDiv.innerHTML;

    const responseBlock = `
        <p style="margin-top: 10pt; margin-bottom: 15pt;">
            <b>Lector:</b> Palabra de Dios.<br/>
            <b>Pueblo:</b> Te alabamos, Señor.
        </p>
    `;

    // 1. Before Psalm (header)
    // Check if "Palabra de Dios" is already near the Psalm (within 300 chars before).
    // This is a heuristic.
    if (!html.match(/Palabra de Dios[\s\S]{0,300}?<h[1-6][^>]*>\s*Salmo/i)) {
      html = html.replace(/(<h[1-6][^>]*>\s*Salmo)/i, `${responseBlock}$1`);
    }

    // 2. Before Alleluia or Gradual (header)
    if (!html.match(/Palabra de Dios[\s\S]{0,300}?<h[1-6][^>]*>\s*(Aleluya|Gradual)/i)) {
      // Also check we aren't at the very start of the doc (unlikely for Aleluya)
      html = html.replace(/(<\/p>)\s*(<h[1-6][^>]*>\s*(Aleluya|Gradual))/i, `$1${responseBlock}$2`);
    }

    tempDiv.innerHTML = html;

    // --- 2. GOSPEL EXTRACTION ---
    let gospelVerse = "Palabra del Señor."
    const plainText = tempDiv.innerText;
    const gospelMatch = plainText.match(/EVANGELIO[\s\S]{0,500}?(En aquel tiempo|Jesús dijo|Dijo Jesús)[\s\S]{0,200}?(\.|\n)/i);
    if (gospelMatch) {
      gospelVerse = "«" + gospelMatch[0].replace(/EVANGELIO/i, '').trim() + "»";
    }

    // --- 3. FETCH IMAGE & CONVERT TO BASE64 ---
    let base64Img = '';
    try {
      // Local Image uploaded by User
      const response = await fetch("/jerusalem_cross.png");
      const blob = await response.blob();
      base64Img = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Image fetch failed", e);
    }

    // --- 4. TABLE-BASED LAYOUT FOR WORD ---
    // Word handles tables much better than div/flex for vertical alignment
    const coverPage = `
            <table width="100%" style="width: 100%; border: none; margin-top: 100pt; margin-bottom: 50pt;">
                <tr>
                    <td align="center" style="border: none; padding-bottom: 30pt;">
                         ${base64Img ? `<img src="${base64Img}" width="120" height="120" />` : '<b>[CRUZ]</b>'}
                    </td>
                </tr>
                <tr>
                    <td align="center" style="border: none;">
                        <h1 style="font-size: 24pt; font-weight: bold; text-transform: uppercase; margin: 0; color: #000;">
                            IGLESIA ANGLOCATÓLICA<br/>COMUNIDAD DE GRACIA
                        </h1>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="border: none; padding-top: 20pt; padding-bottom: 20pt;">
                        <h2 style="font-size: 18pt; font-weight: normal; color: #000; margin: 0;">
                            ${calculatedFeast || serviceTitle || "Santa Liturgia"}
                        </h2>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="border: none; padding-bottom: 50pt;">
                        <p style="font-size: 14pt; font-style: italic; margin: 0;">
                            ${selectedDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="border: none;">
                        <p style="font-size: 12pt; font-style: italic; color: #555; width: 80%;">
                            ${gospelVerse}
                        </p>
                    </td>
                </tr>
            </table>
            <br clear="all" style="page-break-before: always" />
        `;

    const finalHtml = `
          <!DOCTYPE html>
          <html>
              <head>
                  <meta charset='utf-8'>
                  <style>
                      @page {
                          size: letter;
                          margin: 2.54cm;
                      }
                      body { font-family: 'Times New Roman', serif; font-size: 12pt; }
                      h1, h2, h3, h4 { color: #000; }
                      .rubric { color: #dc2626; font-style: italic; }
                      table { border-collapse: collapse; }
                      td { padding: 5px; }
                  </style>
              </head>
              <body>
                  ${coverPage}
                  ${tempDiv.innerHTML}
              </body>
          </html>
        `

    asBlob(finalHtml).then(blob => {
      saveAs(blob, `Liturgia_${selectedDate.toISOString().split('T')[0]}.docx`)
      handleToast("Documento exportado")
    })
  }

  // AUTH GUARD: If no user, show Login
  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <BackgroundWrapper season={season}>
      <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-transparent text-gray-800 font-sans selection:bg-primary selection:text-white transition-colors duration-300">

        {/* Chat Widget */}
        <ChatWidget />

        {/* Pulpit Mode Overlay */}
        {isPulpitOpen && docContent && (
          <PulpitView
            content={docContent}
            title={calculatedFeast || serviceTitle}
            date={selectedDate}
            onClose={() => setIsPulpitOpen(false)}
          />
        )}

        {/* Toast */}
        {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />}

        {/* Modals */}
        <HistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          docContent={docContent}
          onLoadContent={setDocContent}
          onToast={setToast}
        />

        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          rubricLevel={rubricLevel}
          onRubricChange={(val) => updateSetting('rubricLevel', val)}
        />

        <AssignmentModal
          isOpen={isAssignmentOpen}
          onClose={() => setIsAssignmentOpen(false)}
          taskName="" // Empty for ad-hoc
          onAssign={() => setIsAssignmentOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden md:pb-0">

          {/* Universal TopBar */}
          <div className="print:hidden">
            <TopBar
              date={selectedDate}
              onProfile={() => setIsProfileOpen(true)}
              activeTab={activeTab}
              onNavigate={setActiveTab}
              onLogout={logout} // Pass logout logic
              userRole={userRole} // For UI adaptation
              checkPermission={checkPermission}
            />
          </div>

          {/* --- DASHBOARD VIEW --- */}
          {activeTab === 'dashboard' && (
            <div className="flex-1 flex flex-col w-full overflow-y-auto">
              <HomeView
                key="home-refresh-v3"
                date={selectedDate}
                docContent={docContent}
                season={season}
                calculatedFeast={calculatedFeast || serviceTitle}
                onNavigate={setActiveTab}
              />
            </div>
          )}

          {/* --- GENERATOR VIEW (Classic Workspace) --- */}
          {activeTab === 'generator' && (
            <div className="flex-1 flex flex-col w-full overflow-y-auto">
              {/* ROLE GUARD: Only Admins can Generate */}
              {(checkPermission && checkPermission('generate_liturgy')) && (
                <GeneratorToolbar
                  tradition={tradition} setTradition={setTradition}
                  selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                  calculatedFeast={calculatedFeast}
                  onGenerate={handleGenerate}
                  onHistory={() => setIsHistoryOpen(true)}
                  onPin={handlePinLiturgy}
                />
              )}

              {/* VIEW SWITCHER: Back to Module Button for Servers */}
              {/* VIEW SWITCHER: Back to Module Button for Servers */}
              {['treasurer', 'secretary', 'musician', 'sacristan'].includes(userRole) && (
                <div className="fixed bottom-6 right-4 z-40 md:top-24 md:bottom-auto">
                  <button
                    onClick={() => navigateTo(
                      userRole === 'treasurer' ? 'offerings'
                        : userRole === 'musician' ? 'music'
                          : userRole === 'sacristan' ? 'sacristy'
                            : userRole === 'secretary' ? 'directory' // or dashboard
                              : 'dashboard'
                    )}
                    className="flex items-center justify-center gap-2 bg-primary text-white shadow-lg shadow-primary/30 active:scale-95 transition-all
                    md:px-4 md:py-3 md:rounded-full md:w-auto
                    w-12 h-12 rounded-full"
                    title="Volver a mi Módulo"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span className="hidden md:inline font-bold text-sm">Volver a mi Módulo</span>
                  </button>
                </div>
              )}

              <main className="flex-1 py-8 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center w-full">
                {loading ? (
                  <Loading tip={loadingTip} />
                ) : error ? (
                  <div className="mt-20 p-8 bg-red-50 border-2 border-red-100 rounded-xl text-center max-w-md animate-slide-in">
                    <h3 className="text-red-700 font-bold text-lg mb-2">Error de Generación</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button onClick={() => window.location.reload()} className="underline text-red-800 font-bold">Recargar página</button>
                  </div>
                ) : docContent ? (
                  <div className="w-full flex flex-col items-center">
                    {/* Context Title for Manual Services */}
                    {serviceTitle && (
                      <div className="w-full max-w-4xl mx-auto mb-8 text-center animate-fade-in relative">
                        <button
                          onClick={() => setActiveTab('occasional')}
                          className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                          title="Volver a Servicios Ocasionales"
                        >
                          <span className="material-symbols-outlined text-2xl">arrow_back</span>
                        </button>
                        <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Servicio Ocasional</span>
                        <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white mt-4">{serviceTitle}</h2>
                      </div>
                    )}

                    {/* Restriction: Only Priest/Admin sees the Toolbar */}
                    {(checkPermission && checkPermission('generate_liturgy')) && (
                      <Toolbar
                        onPrint={handlePrint}
                        onDownloadFull={() => handleDownload('full')}
                        onDownloadBulletin={() => handleDownload('bulletin')}
                        onPulpitMode={() => setIsPulpitOpen(true)}
                        onMinistries={() => setIsAssignmentOpen(true)}
                        rubricLevel={rubricLevel}
                        onToggleRubric={() => updateSetting('rubricLevel', rubricLevel === 'solemn' ? 'simple' : 'solemn')}
                      />
                    )}
                    <Preview ref={previewRef} content={docContent} season={season} rubricLevel={rubricLevel} />
                  </div>
                ) : (
                  <EmptyState />
                )}
              </main>
            </div>
          )}

          {/* --- CALENDAR VIEW --- */}
          {activeTab === 'calendar' && (
            <div className="flex-1 flex flex-col w-full overflow-y-auto">
              <CalendarView
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onNavigate={setActiveTab}
              />
            </div>
          )}

          {/* --- OCCASIONAL SERVICES VIEW --- */}
          {activeTab === 'occasional' && (
            /* OccasionalServicesView handles its own layout, so we just render it. It will fill the flex-1 container. */
            <OccasionalServicesView
              onNavigate={setActiveTab}
              setDocContent={setDocContent}
              setServiceTitle={setServiceTitle}
            />
          )}

          {/* --- DIRECTORY VIEW --- */}
          {activeTab === 'directory' && (
            /* ROLE GUARD: Permission check */
            (checkPermission && checkPermission('view_directory')) ? (
              <div className="flex-1 flex flex-col w-full overflow-y-auto px-4 py-6 max-w-7xl mx-auto">
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-6">Directorio de Fieles</h1>
                <DirectoryView />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 flex-col">
                <span className="material-symbols-outlined text-6xl mb-4">lock</span>
                <p>Acceso restringido a este módulo.</p>
              </div>
            )
          )}

          {/* --- OFFERINGS VIEW --- */}
          {activeTab === 'offerings' && (
            /* ROLE GUARD: Permission check */
            (checkPermission && checkPermission('view_offerings')) ? (
              <div className="flex-1 flex flex-col w-full overflow-hidden min-h-0">
                <OfferingsView />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 flex-col">
                <span className="material-symbols-outlined text-6xl mb-4">lock</span>
                <p>Acceso restringido a este módulo.</p>
              </div>
            )
          )}

          {/* --- MUSIC VIEW --- */}
          {activeTab === 'music' && (
            (checkPermission && checkPermission('view_music')) ? (
              <div className="flex-1 flex flex-col w-full overflow-y-auto">
                <MusicView />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 flex-col">
                <span className="material-symbols-outlined text-6xl mb-4">lock</span>
                <p>Acceso restringido a este módulo.</p>
              </div>
            )
          )}

          {/* --- SACRISTY VIEW --- */}
          {activeTab === 'sacristy' && (
            <SacristyView date={selectedDate} />
          )}

          {/* --- USERS VIEW (Admin Only) --- */}
          {activeTab === 'users' && (
            (checkPermission && checkPermission('manage_users')) ? (
              <div className="flex-1 flex flex-col w-full overflow-y-auto p-4 md:p-8">
                <UserManagement />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 flex-col">
                <span className="material-symbols-outlined text-6xl mb-4">lock</span>
                <p>Acceso restringido a este módulo.</p>
              </div>
            )
          )}
        </div>

        {/* Footer removed as per request (icons moved to header) */}
      </div>
    </BackgroundWrapper >
  )
}


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DirectoryProvider>
          <MusicProvider>
            <ChatProvider>
              <AppContent />
            </ChatProvider>
          </MusicProvider>
        </DirectoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

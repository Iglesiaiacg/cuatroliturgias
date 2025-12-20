import { useState, useRef, useEffect } from 'react'
import { asBlob } from 'html-docx-js-typescript'
import { saveAs } from 'file-saver'
import { useLiturgy } from './hooks/useLiturgy'
import { AuthProvider, useAuth } from './context/AuthContext'

// Components
import GeneratorToolbar from './components/Liturgy/GeneratorToolbar'
import Toolbar from './components/Layout/Toolbar'
import Preview from './components/Liturgy/Preview'
import Loading from './components/Liturgy/Loading'
import EmptyState from './components/Liturgy/EmptyState'
import HistoryModal from './components/Common/HistoryModal'
import SettingsModal from './components/Common/SettingsModal'
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

import UserManagement from './components/Auth/UserManagement'
import ProfileModal from './components/Auth/ProfileModal'

function AppContent() {
  const { currentUser, userRole, logout } = useAuth()

  const {
    tradition, setTradition,
    selectedDate, setSelectedDate,
    calculatedFeast,
    season,
    loading, loadingTip, error,
    docContent, setDocContent,
    generate
  } = useLiturgy()

  // UI State
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard', 'generator', 'calendar', 'favorites'
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isPulpitOpen, setIsPulpitOpen] = useState(false)
  const [toast, setToast] = useState({ message: '', type: '' })

  // Settings State
  const [rubricLevel, setRubricLevel] = useState(() => localStorage.getItem('rubricLevel') || 'simple'); // 'simple' | 'solemn'

  useEffect(() => {
    localStorage.setItem('rubricLevel', rubricLevel);
  }, [rubricLevel]);

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
        setTimeout(() => setIsSettingsOpen(true), 1500)
      }
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

  const handleDownload = (type) => {
    if (!docContent) return

    let contentToSave = docContent
    if (previewRef.current) {
      contentToSave = previewRef.current.innerHTML
    }

    if (type === 'bulletin') {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = contentToSave
      tempDiv.querySelectorAll('p').forEach(p => {
        if (p.textContent.toLowerCase().includes('(en secreto)')) p.remove()
      })
      contentToSave = tempDiv.innerHTML
    }

    const css = `
          <style>
              body { font-family: 'Times New Roman', serif; font-size: 11pt; }
              h1 { text-align: center; font-size: 16pt; border-bottom: 1px solid #ccc; font-weight: bold; margin-bottom: 12pt; }
              h2 { color: #9f1239; font-size: 13pt; margin-top: 15pt; }
              .rubric { color: red; font-style: italic; font-size: 10pt; }
              strong { font-weight: bold; }
              table { border-collapse: collapse; width: 100%; margin-bottom: 10pt; }
              td, th { border: 1px solid #000; padding: 5pt; }
              @page { size: letter; margin: 2.54cm; }
          </style>
      `

    const htmlContent = `
          <html>
          <head>
              <meta charset='utf-8'>
              ${css}
          </head>
          <body>${contentToSave}</body>
          </html>
      `

    asBlob(htmlContent).then(blob => {
      saveAs(blob, `Liturgia_${selectedDate.toISOString().split('T')[0]}.docx`)
      handleToast("Documento descargado")
    })
  }

  // AUTH GUARD: If no user, show Login
  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <BackgroundWrapper season={season}>
      <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-transparent text-gray-800 font-sans selection:bg-primary selection:text-white transition-colors duration-300">

        {/* Pulpit Mode Overlay */}
        {isPulpitOpen && docContent && (
          <PulpitView
            content={docContent}
            title={calculatedFeast || serviceTitle}
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

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          tradition={tradition}
          setTradition={setTradition}
        />

        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">

          {/* Universal TopBar */}
          <div className="print:hidden">
            <TopBar
              date={selectedDate}
              onSettings={() => setIsSettingsOpen(true)}
              onProfile={() => setIsProfileOpen(true)}
              activeTab={activeTab}
              onNavigate={setActiveTab}
              onLogout={logout} // Pass logout logic
              userRole={userRole} // For UI adaptation
            />
          </div>

          {/* --- DASHBOARD VIEW --- */}
          {activeTab === 'dashboard' && (
            <div className="flex-1 flex flex-col w-full overflow-y-auto">
              <HomeView
                key="home-refresh-v3"
                date={selectedDate}
                onNavigate={setActiveTab}
              />
            </div>
          )}

          {/* --- GENERATOR VIEW (Classic Workspace) --- */}
          {activeTab === 'generator' && (
            <div className="flex-1 flex flex-col w-full overflow-y-auto">
              <GeneratorToolbar
                tradition={tradition} setTradition={setTradition}
                selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                calculatedFeast={calculatedFeast}
                onGenerate={handleGenerate}
                onHistory={() => setIsHistoryOpen(true)}
              />

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

                    <Toolbar
                      onPrint={handlePrint}
                      onDownloadFull={() => handleDownload('full')}
                      onDownloadBulletin={() => handleDownload('bulletin')}
                      onPulpitMode={() => setIsPulpitOpen(true)}
                    />
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
            /* ROLE GUARD: Only Admin/Secretary */
            (userRole === 'admin' || userRole === 'secretary') ? (
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
            /* ROLE GUARD: Only Admin/Secretary */
            (userRole === 'admin' || userRole === 'secretary') ? (
              <div className="flex-1 flex flex-col w-full overflow-y-auto">
                <OfferingsView />
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
            (userRole === 'admin') ? (
              <div className="flex-1 flex flex-col w-full overflow-y-auto p-8">
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

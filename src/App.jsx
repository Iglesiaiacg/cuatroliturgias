import { useState, useRef } from 'react'
import { asBlob } from 'html-docx-js-typescript'
import { saveAs } from 'file-saver'
import { useLiturgy } from './hooks/useLiturgy'

// Components
import Header from './components/Layout/Header'
import Toolbar from './components/Layout/Toolbar'
import Preview from './components/Liturgy/Preview'
import Loading from './components/Liturgy/Loading'
import EmptyState from './components/Liturgy/EmptyState'
import HistoryModal from './components/Common/HistoryModal'
import SettingsModal from './components/Common/SettingsModal'
import Toast from './components/Common/Toast'

function App() {
  const {
    tradition, setTradition,
    selectedDate, setSelectedDate,
    calculatedFeast,
    cycleInfo, season,
    loading, loadingTip, error,
    docContent, setDocContent,
    generate
  } = useLiturgy()

  // UI State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [toast, setToast] = useState({ message: '', type: '' })

  const previewRef = useRef(null)

  // Handlers
  const handleToast = (msg, type = 'success') => setToast({ message: msg, type })

  const handleGenerate = async () => {
    try {
      await generate()
      handleToast("Liturgia generada correctamente")
    } catch (e) {
      handleToast(e.message || "Error al generar", "error")
      // If auth error, open settings automatically
      if (e.message.includes('API Key')) {
        setTimeout(() => setIsSettingsOpen(true), 1500)
      }
    }
  }

  const handleRestoreHistory = (item) => {
    setDocContent(item.content)
    handleToast("Liturgia restaurada del historial")
    setIsHistoryOpen(false)
  }

  // Document Actions
  const handlePrint = () => window.print()

  const handleDownload = (type) => {
    if (!docContent) return

    let contentToSave = docContent
    if (previewRef.current) {
      contentToSave = previewRef.current.innerHTML
    }

    // Filter for bulletin
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 font-sans selection:bg-teal-100 selection:text-teal-900">

      {/* Toast */}
      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />}

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onRestore={handleRestoreHistory}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Top Navigation */}
      <Header
        tradition={tradition} setTradition={setTradition}
        selectedDate={selectedDate} setSelectedDate={setSelectedDate}
        calculatedFeast={calculatedFeast}
        onGenerate={handleGenerate}
        onHistory={() => setIsHistoryOpen(true)}
        onSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Workspace */}
      <main className="pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center min-h-screen">

        {/* Context Info (Optional floating info if needed, or integrated in header) */}

        {/* Content Switcher */}
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
            <Toolbar
              onPrint={handlePrint}
              onDownloadFull={() => handleDownload('full')}
              onDownloadBulletin={() => handleDownload('bulletin')}
            />
            <Preview ref={previewRef} content={docContent} season={season} />
          </div>
        ) : (
          <EmptyState />
        )}

      </main>
    </div>
  )
}

export default App

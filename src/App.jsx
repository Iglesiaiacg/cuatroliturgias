import { useState, useRef } from 'react'
import { asBlob } from 'html-docx-js-typescript'
import { saveAs } from 'file-saver'
import { useLiturgy } from './hooks/useLiturgy'

// Components
import Sidebar from './components/Layout/Sidebar'
import Toolbar from './components/Layout/Toolbar'
import Preview from './components/Liturgy/Preview'
import Loading from './components/Liturgy/Loading'
import EmptyState from './components/Liturgy/EmptyState'
import HistoryModal from './components/Common/HistoryModal'
import Toast from './components/Common/Toast'

function App() {
  const {
    tradition, setTradition,
    celebrationKey, setCelebrationKey,
    selectedDate, cycleInfo, season,
    loading, loadingTip, error,
    docContent, setDocContent,
    generate
  } = useLiturgy()

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [toast, setToast] = useState({ message: '', type: '' })

  const previewRef = useRef(null)

  // Handlers
  const handleToast = (msg, type = 'success') => setToast({ message: msg, type })

  const handleGenerate = async () => {
    try {
      await generate()
      handleToast("Liturgia generada correctamente")
      // Mobile: close sidebar logic managed by user manually usually, or auto close?
      // Legacy auto-closed sidebar on mobile.
      if (window.innerWidth < 768) setIsSidebarOpen(false)
    } catch (e) {
      handleToast(e.message || "Error al generar", "error")
    }
  }

  const handleRestoreHistory = (item) => {
    setDocContent(item.content)
    handleToast("Liturgia restaurada del historial")
    setIsHistoryOpen(false)
    if (window.innerWidth < 768) setIsSidebarOpen(false)
  }

  // Document Actions
  const handlePrint = () => window.print()

  const handleDownload = (type) => {
    if (!docContent) return

    let contentToSave = docContent
    if (previewRef.current) {
      // Get current HTML from editable div to verify any user edits
      // But Preview component handles contentEditable... 
      // We should ideally sync back changes or just read innerHTML from ref
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
    <div className="flex w-full h-screen bg-[#f0f2f5] overflow-hidden text-gray-800 font-sans">

      {/* Toast */}
      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />}

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onRestore={handleRestoreHistory}
      />

      {/* Mobile Toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-teal-700"
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar
        tradition={tradition} setTradition={setTradition}
        celebrationKey={celebrationKey} setCelebrationKey={setCelebrationKey}
        cycleInfo={cycleInfo} selectedDate={selectedDate}
        onGenerate={handleGenerate}
        className={isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      />

      {/* Main View */}
      <main className="flex-1 h-full overflow-y-auto relative w-full">
        <div className="w-full min-h-full flex flex-col items-center p-4 md:p-10 pb-32">

          {/* Top Bar for History (Mobile/Desktop) */}
          <div className="w-full max-w-4xl flex justify-end mb-4">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm text-xs font-bold text-gray-500 hover:text-teal-700 hover:shadow-md transition-all uppercase tracking-wider"
            >
              <span>↺</span> Historial
            </button>
          </div>

          {/* Content Switcher */}
          {loading ? (
            <Loading tip={loadingTip} />
          ) : error ? (
            <div className="neubrutalist-error mt-20 p-8 bg-red-50 border-2 border-red-100 rounded-xl text-center max-w-md">
              <h3 className="text-red-700 font-bold text-lg mb-2">Error de Generación</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="underline text-red-800 font-bold">Recargar página</button>
            </div>
          ) : docContent ? (
            <>
              <Toolbar
                onPrint={handlePrint}
                onDownloadFull={() => handleDownload('full')}
                onDownloadBulletin={() => handleDownload('bulletin')}
              />
              <Preview ref={previewRef} content={docContent} season={season} />
            </>
          ) : (
            <EmptyState />
          )}

        </div>
      </main>
    </div>
  )
}

export default App

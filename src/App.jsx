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
import { SetlistProvider } from './context/SetlistContext';
import { ThemeProvider } from './context/ThemeContext';

// ... (lines 14-617)

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DirectoryProvider>
          <MusicProvider>
            <SetlistProvider>
              <ChatProvider>
                <AppContent />
              </ChatProvider>
            </SetlistProvider>
          </MusicProvider>
        </DirectoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

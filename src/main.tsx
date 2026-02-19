import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { App, Providers } from '@/app'
import { openDatabase, seedDatabase } from '@/shared/lib/indexeddb'
// Styles
import '@/shared/styles/index.css'

// Initialize IndexedDB and render the app
async function initApp() {
  try {
    // IndexedDB 초기화
    await openDatabase()
    await seedDatabase()

    // Render the app
    const rootElement = document.getElementById('root')!
    if (!rootElement.innerHTML) {
      const root = ReactDOM.createRoot(rootElement)
      root.render(
        <StrictMode>
          <Providers>
            <App />
          </Providers>
        </StrictMode>
      )
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize IndexedDB:', error)
    alert('IndexedDB 초기화에 실패했습니다. 브라우저를 새로고침해주세요.')
  }
}

initApp()

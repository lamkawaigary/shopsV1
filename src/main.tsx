import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initAuth } from '@/stores/authStore'
import App from './App'
import './index.css'

console.log('🚀 App initializing...')

// Initialize auth listener
initAuth()
console.log('✅ Auth initialized')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1
    }
  }
})

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('❌ Root element not found!')
} else {
  console.log('✅ Root element found')
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  )
}

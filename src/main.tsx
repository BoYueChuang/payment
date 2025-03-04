import { createRoot } from 'react-dom/client'
import AppRouter from './Router'

createRoot(document.getElementById('root')!).render(
  <AppRouter />
)
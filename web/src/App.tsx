import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Shell } from './components/Shell'
import Board from './pages/Board'

const EntryPage = lazy(() => import('./pages/Entry'))
const AuthorPage = lazy(() => import('./pages/Author'))
const NotFound = lazy(() => import('./pages/NotFound'))

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollTop />
      <Shell>
        <Suspense fallback={<div className="col page" />}>
          <Routes>
            <Route path="/" element={<Board />} />
            <Route path="/entry/:id" element={<EntryPage />} />
            <Route path="/author/:address" element={<AuthorPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Shell>
    </BrowserRouter>
  )
}

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Admin } from './pages/Admin/Admin'
import { NotFound } from './pages/NotFound/NotFound'
import { Rifa } from './pages/Rifa/rifa'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/rifa" replace />}
        />

        <Route
          path="/rifa"
          element={<Rifa />}
        />

        <Route
          path="/admin"
          element={<Admin />}
        />

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
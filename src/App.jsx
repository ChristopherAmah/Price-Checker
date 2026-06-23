import { Route, Routes, Navigate } from 'react-router-dom'
import './App.css'
import Home from './pages/Home.jsx'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App

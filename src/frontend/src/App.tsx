import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Input from './pages/Input'
import Simulation from './pages/Simulation'
import Quiz from './pages/Quiz'
import Library from './pages/Library'
import History from './pages/History'
import Share from './pages/Share'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/input" element={<Input />} />
        <Route path="/simulation/:sessionId" element={<Simulation />} />
        <Route path="/quiz/:sessionId" element={<Quiz />} />
        <Route path="/library" element={<Library />} />
        <Route path="/history" element={<History />} />
        <Route path="/share/:token" element={<Share />} />
      </Routes>
    </BrowserRouter>
  )
}

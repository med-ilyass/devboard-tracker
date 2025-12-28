import { useEffect, useState } from 'react'
import './App.css'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Project from './pages/Projects.jsx'
import ProjectDetails from './pages/ProjectDetails.jsx'
import NotFound from './pages/NotFound.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import { Routes, Route, BrowserRouter } from "react-router-dom"

function App() {

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  function handleLogin(user, token) {
    setUser(user);
    setToken(token);
    localStorage.setItem("devboard_user", JSON.stringify(user));
    localStorage.setItem("devboard_token", token)
  }

  useEffect(() => {
    const savedUser = localStorage.getItem("devboard_user");
    const savedToken = localStorage.getItem("devboard_token");

    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  return (
    <Routes>

      <Route path='/' element={<Project />} />
      <Route path='/login' element={<Login onLogin={handleLogin} />} />
      <Route path='/register' element={<Register />} />
      <Route path='/forgot-password' element={<ForgotPassword />} />
      <Route path='/reset-password' element={<ResetPassword />} />
      <Route path='*' element={<NotFound />} />
      <Route path='/projects' element={<Project />} />
    </Routes>
  )
}
export default App

import { useEffect, useState } from 'react'
import './App.css'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Project from './pages/Projects.jsx'
import ProjectDetails from './pages/ProjectDetails.jsx'
import NotFound from './pages/NotFound.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom"
import RequiredAuth from './components/RequiredAuth.jsx'

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

      <Route path="/" element={<Home />} />
      <Route path='/login' element={<Login onLogin={handleLogin} />} />
      <Route path='/register' element={<Register />} />
      <Route path='/forgot-password' element={<ForgotPassword />} />
      <Route path='/reset-password' element={<ResetPassword />} />
      {/* Protected */}
      <Route element={<RequiredAuth />}>
        <Route path="/projects" element={<Project />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
      </Route>
      {/* Fall Back
          <Route path='*' element={<Navigate to="/" replace/>}/>
      */}
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}
export default App

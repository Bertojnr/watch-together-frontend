import { useState } from 'react'



import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import WatchRoom from "./pages/WatchRoom";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import RoomsList from './pages/RoomList';
import NotFound from "./pages/NotFound";
import Profile from './pages/Profile';
import { Toaster } from 'react-hot-toast';

function App() {
  

  return (
    <>
    <Toaster
      position='top-right'
      reverseOrder={false}
      toastOptions={{
        duration: 3000,

        success: {
          duration: 3000,
          theme: {
            primary: 'green',
            secondary: 'black',
          },
        },

        error: {
          duration: 4000,
          theme: {
            primary: 'green',
            secondary: 'black',
          },
        }
        
      }}
    />



      <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/browse" element={<RoomsList />} />
          <Route path="/profile" element={<Profile />} />
          


          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />





          
          <Route
            path="/watchroom/:id"
            element={
              <ProtectedRoute>
                <WatchRoom />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </>
  )
}

export default App

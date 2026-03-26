import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ReportModal from "./components/ReportModal";
import Feed from "./pages/Feed";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import "./index.css";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (user === undefined) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  const [showReport, setShowReport] = useState(false);
  return (
    <>
      <Navbar onReport={() => setShowReport(true)} />
      {showReport && user && <ReportModal onClose={() => setShowReport(false)} />}
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
        <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
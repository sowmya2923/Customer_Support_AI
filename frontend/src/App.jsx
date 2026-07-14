import React from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import AgentWorkspace from './pages/AgentWorkspace';
import KnowledgeBase from './pages/KnowledgeBase';
import Landing from './pages/Landing';
import ManagerDashboard from './pages/ManagerDashboard';
import { Loader2 } from 'lucide-react';

// Protected Route wrapper component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// App shell layout containing navbar & sidebar
function AppLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-slate-800 bg-slate-950/95 px-3 backdrop-blur lg:hidden">
          <NavLink to="/" end className={({ isActive }) => `rounded-lg px-4 py-2 text-xs font-bold ${isActive ? 'bg-brand-500/15 text-brand-300' : 'text-slate-400'}`}>Workspace</NavLink>
          <NavLink to="/kb" className={({ isActive }) => `rounded-lg px-4 py-2 text-xs font-bold ${isActive ? 'bg-brand-500/15 text-brand-300' : 'text-slate-400'}`}>Knowledge</NavLink>
          <NavLink to="/manager" className={({ isActive }) => `rounded-lg px-4 py-2 text-xs font-bold ${isActive ? 'bg-brand-500/15 text-brand-300' : 'text-slate-400'}`}>Insights</NavLink>
        </div>
        <main className="flex-1 overflow-hidden bg-slate-950 pb-16 lg:pb-0">
          <Routes>
            {/* Dynamic Dashboard routing based on User roles */}
            <Route path="/" element={<DashboardRouter />} />
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/kb" element={<KnowledgeBase />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Helper to render Customer Dashboard vs Agent workspace based on user role
function DashboardRouter() {
  const { user } = useAuth();
  
  if (user?.role === 'agent' || user?.role === 'admin') {
    return <AgentWorkspace />;
  }
  return <CustomerDashboard />;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* If logged in, "/" renders the AppLayout. If not logged in, renders Landing page */}
      <Route 
        path="/*" 
        element={
          user ? (
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          ) : (
            <Landing />
          )
        } 
      />

      {/* Public Pages */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
    </Routes>
  );
}








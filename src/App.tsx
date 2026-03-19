import { Navigate, Route, Routes } from "react-router-dom";
import Navigation from "./components/Navigation";
import { BackendProvider, useAuth } from "./backend";
import AboutView from "./views/AboutView";
import LoginView from "./views/LoginView";
import RegisterView from "./views/RegisterView";
import ProfileView from "./views/ProfileView";
import EngObjectsView from "./views/EngObjectsView";
import ContactsView from "./views/ContactsView";
import ExtratasksView from "./views/ExtratasksView";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BackendProvider>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <Routes>
          <Route path="/about" element={<AboutView />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
          <Route path="/profile" element={<RequireAuth><ProfileView /></RequireAuth>} />
          <Route path="/objects" element={<RequireAuth><EngObjectsView /></RequireAuth>} />
          <Route path="/contacts" element={<RequireAuth><ContactsView /></RequireAuth>} />
          <Route path="/tasks" element={<RequireAuth><ExtratasksView /></RequireAuth>} />
          <Route path="/" element={<Navigate to="/about" replace />} />
        </Routes>
      </div>
    </BackendProvider>
  );
}

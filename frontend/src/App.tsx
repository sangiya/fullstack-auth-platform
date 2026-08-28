import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppContent() {
  const { user } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");

  if (user) {
    return <Dashboard />;
  }

  return mode === "login" ? (
    <LoginForm onSwitchToRegister={() => setMode("register")} />
  ) : (
    <RegisterForm onSwitchToLogin={() => setMode("login")} />
  );
}

export function App() {
  return (
    <AuthProvider>
      <main>
        <h1>Auth Platform</h1>
        <AppContent />
      </main>
    </AuthProvider>
  );
}

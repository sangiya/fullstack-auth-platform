import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const { login, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await login(email, password).catch(() => undefined);
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Log in">
      <h2>Log in</h2>
      <input aria-label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input
        aria-label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Log in</button>
      <button type="button" onClick={onSwitchToRegister}>
        Need an account?
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}

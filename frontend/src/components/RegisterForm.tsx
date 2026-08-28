import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const { register, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await register(email, password).catch(() => undefined);
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Register">
      <h2>Create an account</h2>
      <input aria-label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input
        aria-label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Register</button>
      <button type="button" onClick={onSwitchToLogin}>
        Already have an account?
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}

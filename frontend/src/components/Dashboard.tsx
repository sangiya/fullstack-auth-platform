import { useAuth } from "../context/AuthContext";

export function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h2>Welcome, {user?.email}</h2>
      <p>User ID: {user?.id}</p>
      <button onClick={() => void logout()}>Log out</button>
    </div>
  );
}

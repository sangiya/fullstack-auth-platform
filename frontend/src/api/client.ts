export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface CurrentUser {
  id: string;
  email: string;
}

async function handle<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed with status ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function register(email: string, password: string): Promise<TokenPair> {
  return handle<TokenPair>(
    await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),
  );
}

export async function login(email: string, password: string): Promise<TokenPair> {
  return handle<TokenPair>(
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),
  );
}

export async function me(accessToken: string): Promise<CurrentUser> {
  return handle<CurrentUser>(
    await fetch("/api/me", { headers: { Authorization: `Bearer ${accessToken}` } }),
  );
}

export async function logout(accessToken: string): Promise<void> {
  return handle<void>(
    await fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } }),
  );
}

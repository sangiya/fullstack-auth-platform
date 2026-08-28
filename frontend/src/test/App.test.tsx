import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../App";
import * as api from "../api/client";

vi.mock("../api/client");

describe("App", () => {
  beforeEach(() => {
    vi.mocked(api.me).mockResolvedValue({ id: "user-1", email: "ada@example.com" });
  });

  it("registers a new user and shows the dashboard", async () => {
    vi.mocked(api.register).mockResolvedValue({ accessToken: "access", refreshToken: "refresh" });
    render(<App />);

    fireEvent.click(screen.getByText("Need an account?"));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "correct-horse-battery" } });
    fireEvent.click(screen.getByText("Register"));

    await waitFor(() => expect(screen.getByText("Welcome, ada@example.com")).toBeInTheDocument());
  });

  it("logs in an existing user and shows the dashboard", async () => {
    vi.mocked(api.login).mockResolvedValue({ accessToken: "access", refreshToken: "refresh" });
    render(<App />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "correct-horse-battery" } });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(screen.getByText("Welcome, ada@example.com")).toBeInTheDocument());
  });

  it("shows an error banner when login fails", async () => {
    vi.mocked(api.login).mockRejectedValue(new Error("Invalid email or password"));
    render(<App />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password"));
  });

  it("logs out and returns to the login form", async () => {
    vi.mocked(api.login).mockResolvedValue({ accessToken: "access", refreshToken: "refresh" });
    vi.mocked(api.logout).mockResolvedValue(undefined);
    render(<App />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "correct-horse-battery" } });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));
    await waitFor(() => expect(screen.getByText("Welcome, ada@example.com")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Log out"));
    await waitFor(() => expect(screen.getByLabelText("Email")).toBeInTheDocument());
  });
});

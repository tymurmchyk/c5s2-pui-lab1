import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/backend/auth";
import { DatabaseProvider } from "@/backend/db";
import Navigation from "../Navigation";
import { LoginAndNav } from "./nav-test-helper";

function renderNav() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <DatabaseProvider>
          <Navigation />
        </DatabaseProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

function renderAuthenticatedNav() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <DatabaseProvider>
          <LoginAndNav />
        </DatabaseProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("Navigation — unauthenticated", () => {
  it("shows login and register links", () => {
    renderNav();
    expect(screen.getByText("Увійти")).toBeInTheDocument();
    expect(screen.getByText("Реєстрація")).toBeInTheDocument();
  });

  it("shows message to log in", () => {
    renderNav();
    expect(
      screen.getByText("Увійдіть, щоб перейти до органайзера")
    ).toBeInTheDocument();
  });

  it("does not show authenticated links", () => {
    renderNav();
    expect(screen.queryByText("Об'єкти")).not.toBeInTheDocument();
    expect(screen.queryByText("Контакти")).not.toBeInTheDocument();
    expect(screen.queryByText("Профіль")).not.toBeInTheDocument();
    expect(screen.queryByText("Вийти")).not.toBeInTheDocument();
  });

  it("shows about link", () => {
    renderNav();
    expect(screen.getByText("Про додаток")).toBeInTheDocument();
  });
});

describe("Navigation — authenticated", () => {
  it("shows authenticated links after login", () => {
    renderAuthenticatedNav();
    expect(screen.getByText("Об'єкти")).toBeInTheDocument();
    expect(screen.getByText("Дод. завд.")).toBeInTheDocument();
    expect(screen.getByText("Контакти")).toBeInTheDocument();
    expect(screen.getByText("Профіль")).toBeInTheDocument();
    expect(screen.getByText("Вийти")).toBeInTheDocument();
  });

  it("does not show login/register when authenticated", () => {
    renderAuthenticatedNav();
    expect(screen.queryByText("Увійти")).not.toBeInTheDocument();
    expect(screen.queryByText("Реєстрація")).not.toBeInTheDocument();
  });
});

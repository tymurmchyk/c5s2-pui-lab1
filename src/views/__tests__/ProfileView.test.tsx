import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProfileView from "../ProfileView";

let mockGender = "unknown";

jest.mock("@/backend", () => ({
  useAuth: () => ({
    currentUser: {
      id: "u1",
      email: "demo@example.com",
      passwordHash: "demo",
      name: { first: "Демо", last: "Користувач" },
      gender: mockGender,
      birthDate: "1990-01-01",
    },
    isAuthenticated: true,
  }),
}));

function renderProfile() {
  return render(
    <MemoryRouter>
      <ProfileView />
    </MemoryRouter>
  );
}

describe("ProfileView", () => {
  beforeEach(() => {
    mockGender = "unknown";
  });

  it("renders user name", () => {
    renderProfile();
    expect(screen.getByText("Демо Користувач")).toBeInTheDocument();
  });

  it("renders email", () => {
    renderProfile();
    expect(screen.getByText("demo@example.com")).toBeInTheDocument();
  });

  it("renders birth date", () => {
    renderProfile();
    expect(screen.getByText("1990-01-01")).toBeInTheDocument();
  });

  it("renders 'Не вказано' for unknown gender", () => {
    renderProfile();
    expect(screen.getByText("Не вказано")).toBeInTheDocument();
  });

  it("renders 'Чоловіча' for male gender", () => {
    mockGender = "male";
    renderProfile();
    expect(screen.getByText("Чоловіча")).toBeInTheDocument();
  });

  it("renders 'Жіноча' for female gender", () => {
    mockGender = "female";
    renderProfile();
    expect(screen.getByText("Жіноча")).toBeInTheDocument();
  });
});

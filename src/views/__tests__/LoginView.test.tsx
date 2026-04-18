import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../__tests__/test-utils";
import LoginView from "../LoginView";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("LoginView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders email and password fields", () => {
    renderWithProviders(<LoginView />);
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Пароль")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderWithProviders(<LoginView />);
    expect(screen.getByText("Увійти")).toBeInTheDocument();
  });

  it("renders link to register page", () => {
    renderWithProviders(<LoginView />);
    expect(screen.getByText("Зареєструватися")).toBeInTheDocument();
  });

  it("navigates to /objects on successful login", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginView />);

    await user.type(screen.getByLabelText("E-mail"), "demo@example.com");
    await user.type(screen.getByLabelText("Пароль"), "demo");
    await user.click(screen.getByText("Увійти"));

    expect(mockNavigate).toHaveBeenCalledWith("/objects");
  });

  it("shows error on invalid credentials", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginView />);

    await user.type(screen.getByLabelText("E-mail"), "wrong@example.com");
    await user.type(screen.getByLabelText("Пароль"), "wrong");
    await user.click(screen.getByText("Увійти"));

    expect(
      screen.getByText("Невірний e-mail або пароль")
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

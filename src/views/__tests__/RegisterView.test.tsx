import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../__tests__/test-utils";
import RegisterView from "../RegisterView";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("RegisterView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields", () => {
    renderWithProviders(<RegisterView />);
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Пароль")).toBeInTheDocument();
    expect(screen.getByLabelText("Ім'я")).toBeInTheDocument();
    expect(screen.getByLabelText("Прізвище")).toBeInTheDocument();
    expect(screen.getByLabelText("Стать")).toBeInTheDocument();
    expect(screen.getByLabelText("Дата народження")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderWithProviders(<RegisterView />);
    expect(screen.getByText("Зареєструватися")).toBeInTheDocument();
  });

  it("renders link to login page", () => {
    renderWithProviders(<RegisterView />);
    expect(screen.getByText("Увійти")).toBeInTheDocument();
  });

  it("shows error when required fields are empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterView />);

    await user.click(screen.getByText("Зареєструватися"));

    expect(
      screen.getByText("Будь ласка, заповніть усі обов'язкові поля")
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows error for duplicate email", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterView />);

    await user.type(screen.getByLabelText("E-mail"), "demo@example.com");
    await user.type(screen.getByLabelText("Пароль"), "pass123");
    await user.type(screen.getByLabelText("Ім'я"), "Тест");
    await user.type(screen.getByLabelText("Прізвище"), "Тестенко");
    // birthDate is required
    await user.type(screen.getByLabelText("Дата народження"), "2000-01-01");
    await user.click(screen.getByText("Зареєструватися"));

    expect(
      screen.getByText("Цей e-mail вже використовується")
    ).toBeInTheDocument();
  });

  it("navigates to /objects on successful registration", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterView />);

    await user.type(
      screen.getByLabelText("E-mail"),
      "newuser@example.com"
    );
    await user.type(screen.getByLabelText("Пароль"), "pass123");
    await user.type(screen.getByLabelText("Ім'я"), "Нова");
    await user.type(screen.getByLabelText("Прізвище"), "Людина");
    await user.type(screen.getByLabelText("Дата народження"), "2000-01-01");
    await user.click(screen.getByText("Зареєструватися"));

    expect(mockNavigate).toHaveBeenCalledWith("/objects");
  });
});

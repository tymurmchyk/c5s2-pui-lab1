import { render, screen } from "@testing-library/react";
import AboutView from "../AboutView";

describe("AboutView", () => {
  it("renders the app title", () => {
    render(<AboutView />);
    expect(screen.getByText(/Localize&Conquer/)).toBeInTheDocument();
  });

  it("renders the feature list", () => {
    render(<AboutView />);
    expect(screen.getByText("Ведення обліку завдань")).toBeInTheDocument();
    expect(screen.getByText("Нотатки")).toBeInTheDocument();
    expect(
      screen.getByText("Історія змін, оновлень тощо")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Підкріплення подій історії посиланнями на листи, конференції тощо"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("Прив’язання клієнтів до завдань")
    ).toBeInTheDocument();
  });

  it("renders the description text", () => {
    render(<AboutView />);
    expect(
      screen.getByText(/Такий собі "зал" для швидкого доступу/)
    ).toBeInTheDocument();
  });
});

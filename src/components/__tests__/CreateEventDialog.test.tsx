import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateEventDialog from "../CreateEventDialog";

describe("CreateEventDialog", () => {
  const defaultProps = {
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders dialog title", () => {
    render(<CreateEventDialog {...defaultProps} />);
    expect(screen.getByText("Нова подія")).toBeInTheDocument();
  });

  it("renders timestamp input", () => {
    render(<CreateEventDialog {...defaultProps} />);
    expect(screen.getByText("Час")).toBeInTheDocument();
  });

  it("renders create button disabled when note is empty", () => {
    render(<CreateEventDialog {...defaultProps} />);
    expect(screen.getByText("Створити")).toBeDisabled();
  });

  it("enables create button when note is entered", async () => {
    const user = userEvent.setup();
    render(<CreateEventDialog {...defaultProps} />);

    await user.type(
      screen.getByPlaceholderText("Опис події *"),
      "Тестова подія"
    );
    expect(screen.getByText("Створити")).not.toBeDisabled();
  });

  it("calls onConfirm with data when create is clicked", async () => {
    const user = userEvent.setup();
    render(<CreateEventDialog {...defaultProps} />);

    await user.type(
      screen.getByPlaceholderText("Опис події *"),
      "Тестова подія"
    );
    await user.click(screen.getByText("Створити"));

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ note: "Тестова подія" })
    );
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<CreateEventDialog {...defaultProps} />);

    await user.click(screen.getByText("Скасувати"));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });
});

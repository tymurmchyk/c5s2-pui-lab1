import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmDialog from "../ConfirmDialog";

describe("ConfirmDialog", () => {
  const defaultProps = {
    message: "Ви впевнені?",
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the message", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText("Ви впевнені?")).toBeInTheDocument();
  });

  it("calls onConfirm when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);
    await user.click(screen.getByText("Видалити"));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...defaultProps} />);
    await user.click(screen.getByText("Скасувати"));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });
});

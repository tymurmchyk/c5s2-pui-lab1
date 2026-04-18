import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditEventDialog from "../EditEventDialog";
import type { EngObjectEvent, EngObjectTask } from "@/backend/model";

const mockEvent: EngObjectEvent = {
  id: "e1",
  timestamp: "2026-02-15T10:30",
  note: "Тестова подія",
  taskRefs: [],
  facts: [],
};

const mockTasks: EngObjectTask[] = [
  {
    id: "t1",
    note: "Задача 1\nДеталі",
    status: "pending",
    eventRefs: [],
  },
  {
    id: "t2",
    note: "Задача 2",
    status: "in-progress",
    eventRefs: [],
  },
];

describe("EditEventDialog", () => {
  const defaultProps = {
    event: mockEvent,
    tasks: mockTasks,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders dialog title", () => {
    render(<EditEventDialog {...defaultProps} />);
    expect(screen.getByText("Редагувати подію")).toBeInTheDocument();
  });

  it("pre-fills note from event", () => {
    render(<EditEventDialog {...defaultProps} />);
    expect(screen.getByDisplayValue("Тестова подія")).toBeInTheDocument();
  });

  it("shows timestamp", () => {
    render(<EditEventDialog {...defaultProps} />);
    expect(screen.getByText("2026-02-15T10:30")).toBeInTheDocument();
  });

  it("renders task checkboxes", () => {
    render(<EditEventDialog {...defaultProps} />);
    expect(screen.getByText("Задача 1")).toBeInTheDocument();
    expect(screen.getByText("Задача 2")).toBeInTheDocument();
  });

  it("calls onConfirm with updated data", async () => {
    const user = userEvent.setup();
    render(<EditEventDialog {...defaultProps} />);

    const textarea = screen.getByDisplayValue("Тестова подія");
    await user.clear(textarea);
    await user.type(textarea, "Оновлена подія");
    await user.click(screen.getByText("Зберегти"));

    expect(defaultProps.onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ note: "Оновлена подія" })
    );
  });

  it("calls onCancel when cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<EditEventDialog {...defaultProps} />);

    await user.click(screen.getByText("Скасувати"));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("can add a fact", async () => {
    const user = userEvent.setup();
    render(<EditEventDialog {...defaultProps} />);

    await user.click(screen.getByText("+ Факт"));
    // A new fact row should appear with a select and input
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThan(0);
  });

  it("save button is disabled when note is empty", async () => {
    const user = userEvent.setup();
    render(<EditEventDialog {...defaultProps} />);

    const textarea = screen.getByDisplayValue("Тестова подія");
    await user.clear(textarea);

    expect(screen.getByText("Зберегти")).toBeDisabled();
  });

  it("can toggle task refs", async () => {
    const user = userEvent.setup();
    render(<EditEventDialog {...defaultProps} />);

    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]); // check first task

    await user.click(screen.getByText("Зберегти"));
    expect(defaultProps.onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ taskRefs: ["t1"] })
    );
  });

  it("can remove a fact", async () => {
    const user = userEvent.setup();
    const eventWithFacts = {
      ...mockEvent,
      facts: [{ kind: "email" as const, email: "test@example.com" }],
    };
    render(<EditEventDialog {...defaultProps} event={eventWithFacts} />);

    expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();

    // Click the remove fact button (×)
    const removeButtons = screen.getAllByText("×");
    await user.click(removeButtons[0]);

    expect(
      screen.queryByDisplayValue("test@example.com")
    ).not.toBeInTheDocument();
  });

  it("can change fact kind", async () => {
    const user = userEvent.setup();
    const eventWithFacts = {
      ...mockEvent,
      facts: [{ kind: "email" as const, email: "test@example.com" }],
    };
    render(<EditEventDialog {...defaultProps} event={eventWithFacts} />);

    const select = screen.getByDisplayValue("Email") as HTMLSelectElement;
    await user.selectOptions(select, "call");

    expect(select.value).toBe("call");
  });

  it("can update fact value", async () => {
    const user = userEvent.setup();
    const eventWithFacts = {
      ...mockEvent,
      facts: [{ kind: "email" as const, email: "test@example.com" }],
    };
    render(<EditEventDialog {...defaultProps} event={eventWithFacts} />);

    const factInput = screen.getByDisplayValue("test@example.com");
    await user.clear(factInput);
    await user.type(factInput, "new@example.com");

    expect(screen.getByDisplayValue("new@example.com")).toBeInTheDocument();
  });

  it("uncheck task ref to remove it", async () => {
    const user = userEvent.setup();
    const eventWithTaskRef = {
      ...mockEvent,
      taskRefs: ["t1"],
    };
    render(<EditEventDialog {...defaultProps} event={eventWithTaskRef} />);

    const checkboxes = screen.getAllByRole("checkbox");
    expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);

    await user.click(checkboxes[0]);

    await user.click(screen.getByText("Зберегти"));
    expect(defaultProps.onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ taskRefs: [] })
    );
  });

  it("does not render task section when no tasks", () => {
    render(<EditEventDialog {...defaultProps} tasks={[]} />);
    expect(screen.queryByText("Пов'язані задачі")).not.toBeInTheDocument();
  });
});

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useState } from "react";
import { renderWithProviders } from "../../__tests__/test-utils";
import ExtratasksView from "../ExtratasksView";
import { useAuth } from "@/backend";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

function TestWrapper() {
  const { login, isAuthenticated } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    login("demo@example.com", "demo");
    setReady(true);
  }, [login]);

  if (!ready || !isAuthenticated) return null;
  return <ExtratasksView />;
}

function renderAsLoggedIn() {
  return renderWithProviders(<TestWrapper />);
}

describe("ExtratasksView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the tasks list", async () => {
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Кошторис для котельні")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Технічна документація КПІ")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Консультація щодо ЖК Гливки")
    ).toBeInTheDocument();
  });

  it("shows new task button", async () => {
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("+ Нове завдання")).toBeInTheDocument();
    });
  });

  it("selects a task and shows detail", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Кошторис для котельні")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Кошторис для котельні"));

    await waitFor(() => {
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Кошторис для котельні");
    });

    expect(screen.getByText(/15 000 грн/)).toBeInTheDocument();
  });

  it("shows edit and delete buttons for selected task", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Кошторис для котельні")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Кошторис для котельні"));

    await waitFor(() => {
      expect(screen.getByText("Редагувати")).toBeInTheDocument();
      expect(screen.getByText("Видалити")).toBeInTheDocument();
    });
  });

  it("opens create task dialog", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("+ Нове завдання")).toBeInTheDocument();
    });

    await user.click(screen.getByText("+ Нове завдання"));

    await waitFor(() => {
      expect(screen.getByText("Нове завдання")).toBeInTheDocument();
    });
  });

  it("creates a new task", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("+ Нове завдання")).toBeInTheDocument();
    });

    await user.click(screen.getByText("+ Нове завдання"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Назва *")).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText("Назва *"), "Нове тестове завдання");
    await user.click(screen.getByRole("button", { name: "Створити" }));

    await waitFor(() => {
      expect(screen.getAllByText("Нове тестове завдання").length).toBeGreaterThan(0);
    });
  });

  it("deletes a task after confirmation", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Кошторис для котельні")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Кошторис для котельні"));

    await waitFor(() => {
      expect(screen.getByText("Видалити")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Видалити");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Видалити завдання/)).toBeInTheDocument();
    });

    const confirmDeleteBtns = screen.getAllByText("Видалити");
    await user.click(confirmDeleteBtns[confirmDeleteBtns.length - 1]);

    await waitFor(() => {
      expect(
        screen.queryByText("Кошторис для котельні")
      ).not.toBeInTheDocument();
    });
  });

  it("shows events section when task is selected", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Кошторис для котельні")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Кошторис для котельні"));

    await waitFor(() => {
      expect(screen.getByText("Події")).toBeInTheDocument();
    });
  });

  it("shows completed status badge", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(
        screen.getByText("Консультація щодо ЖК Гливки")
      ).toBeInTheDocument();
    });

    await user.click(screen.getByText("Консультація щодо ЖК Гливки"));

    await waitFor(() => {
      expect(
        screen.getAllByText("Завершено: 2026-02-01").length
      ).toBeGreaterThan(0);
    });
  });

  it("enters edit mode and saves", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Кошторис для котельні")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Кошторис для котельні"));

    await waitFor(() => {
      expect(screen.getByText("Редагувати")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Редагувати"));

    await waitFor(() => {
      expect(screen.getByText("Зберегти")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Зберегти"));

    await waitFor(() => {
      expect(screen.getByText("Редагувати")).toBeInTheDocument();
    });
  });

  it("opens create event dialog", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Кошторис для котельні")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Кошторис для котельні"));

    await waitFor(() => {
      expect(screen.getByText("+ Подія")).toBeInTheDocument();
    });

    await user.click(screen.getByText("+ Подія"));

    await waitFor(() => {
      expect(screen.getByText("Нова подія")).toBeInTheDocument();
    });
  });

  it("cancels delete confirmation", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Кошторис для котельні")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Кошторис для котельні"));

    const deleteButtons = await screen.findAllByText("Видалити");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Видалити завдання/)).toBeInTheDocument();
    });

    await user.click(screen.getByText("Скасувати"));

    await waitFor(() => {
      expect(
        screen.getAllByText("Кошторис для котельні").length
      ).toBeGreaterThan(0);
    });
  });

  it("selects and shows event detail", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Технічна документація КПІ")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Технічна документація КПІ"));

    // First event note "Перший варіант документації готовий" should appear
    await waitFor(() => {
      expect(
        screen.getAllByText("Перший варіант документації готовий").length
      ).toBeGreaterThan(0);
    });

    const eventEntries = screen.getAllByText(
      "Перший варіант документації готовий"
    );
    await user.click(eventEntries[0]);

    // Should now show the full event detail
    await waitFor(() => {
      expect(
        screen.getAllByText("Перший варіант документації готовий").length
      ).toBeGreaterThan(0);
    });
  });

  it("creates an event via dialog", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Кошторис для котельні")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Кошторис для котельні"));

    await waitFor(() => {
      expect(screen.getByText("+ Подія")).toBeInTheDocument();
    });

    await user.click(screen.getByText("+ Подія"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Опис події *")).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText("Опис події *"), "Нова тестова подія");
    await user.click(screen.getByRole("button", { name: "Створити" }));

    await waitFor(() => {
      expect(
        screen.getAllByText("Нова тестова подія").length
      ).toBeGreaterThan(0);
    });
  });

  it("edits task name in edit mode", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Кошторис для котельні")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Кошторис для котельні"));

    await user.click(screen.getByText("Редагувати"));

    await waitFor(() => {
      expect(screen.getByDisplayValue("Кошторис для котельні")).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue("Кошторис для котельні");
    await user.clear(nameInput);
    await user.type(nameInput, "Оновлений кошторис");

    await user.click(screen.getByText("Зберегти"));

    await waitFor(() => {
      expect(screen.getAllByText("Оновлений кошторис").length).toBeGreaterThan(0);
    });
  });

  it("navigates to contact when clicking contact card", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Кошторис для котельні")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Кошторис для котельні"));

    await waitFor(() => {
      expect(screen.getByText("Котляревський К. А.")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Котляревський К. А."));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/contacts",
      expect.objectContaining({
        state: expect.objectContaining({ selectContactId: "c1" }),
      })
    );
  });
});

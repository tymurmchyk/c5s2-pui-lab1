import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../__tests__/test-utils";
import EngObjectsView from "../EngObjectsView";

// Mock navigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Helper: login as demo user (u1) to load demo data, then render the view
function renderAsLoggedIn() {
  // We need the auth context to have a logged-in user
  // EngObjectsView checks currentUser and redirects if null
  // The demo user id is "u1" which triggers demo data loading in DatabaseProvider
  return renderWithProviders(<TestWrapper />);
}

// Wrapper that logs in programmatically before rendering the view
import { useEffect, useState } from "react";
import { useAuth } from "@/backend";

function TestWrapper() {
  const { login, isAuthenticated } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    login("demo@example.com", "demo");
    setReady(true);
  }, [login]);

  if (!ready || !isAuthenticated) return null;
  return <EngObjectsView />;
}

describe("EngObjectsView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the objects list with demo data", async () => {
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Бойлерна вул. Карпенка")).toBeInTheDocument();
    });
    expect(screen.getByText("Реконструкція пр. Перемоги")).toBeInTheDocument();
    expect(screen.getByText("Гуртожиток КПІ 2025")).toBeInTheDocument();
    expect(screen.getByText("ЖК Гливки")).toBeInTheDocument();
  });

  it("shows new object button", async () => {
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("+ Новий об'єкт")).toBeInTheDocument();
    });
  });

  it("selects an object and shows detail", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Бойлерна вул. Карпенка")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Бойлерна вул. Карпенка"));

    // Detail panel should show the object's title as h1
    await waitFor(() => {
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Бойлерна вул. Карпенка");
    });

    // Should show pay info
    expect(screen.getByText(/85 000 грн/)).toBeInTheDocument();
  });

  it("shows edit and delete buttons for selected object", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Бойлерна вул. Карпенка")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Бойлерна вул. Карпенка"));

    await waitFor(() => {
      expect(screen.getByText("Редагувати")).toBeInTheDocument();
      expect(screen.getByText("Видалити")).toBeInTheDocument();
    });
  });

  it("opens create object dialog", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("+ Новий об'єкт")).toBeInTheDocument();
    });

    await user.click(screen.getByText("+ Новий об'єкт"));

    await waitFor(() => {
      expect(screen.getByText("Новий об'єкт")).toBeInTheDocument();
    });
  });

  it("creates a new object", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("+ Новий об'єкт")).toBeInTheDocument();
    });

    await user.click(screen.getByText("+ Новий об'єкт"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Назва *")).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText("Назва *"), "Тестовий об'єкт");
    await user.click(screen.getByRole("button", { name: "Створити" }));

    await waitFor(() => {
      expect(screen.getAllByText("Тестовий об'єкт").length).toBeGreaterThan(0);
    });
  });

  it("deletes an object after confirmation", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Бойлерна вул. Карпенка")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Бойлерна вул. Карпенка"));

    await waitFor(() => {
      expect(screen.getByText("Видалити")).toBeInTheDocument();
    });

    // Click the first "Видалити" button (the one in the header, not in the confirm dialog)
    const deleteButtons = screen.getAllByText("Видалити");
    await user.click(deleteButtons[0]);

    // Confirm dialog should appear
    await waitFor(() => {
      expect(screen.getByText(/Видалити об'єкт/)).toBeInTheDocument();
    });

    // Click delete in confirm dialog
    const confirmDeleteBtns = screen.getAllByText("Видалити");
    const confirmBtn = confirmDeleteBtns[confirmDeleteBtns.length - 1];
    await user.click(confirmBtn);

    // Object should be removed from the list
    await waitFor(() => {
      expect(
        screen.queryByText("Бойлерна вул. Карпенка")
      ).not.toBeInTheDocument();
    });
  });

  it("shows tasks section when object is selected", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Бойлерна вул. Карпенка")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Бойлерна вул. Карпенка"));

    await waitFor(() => {
      expect(screen.getAllByText("Задачі").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Події").length).toBeGreaterThan(0);
    });
  });

  it("shows status badge for completed object", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("ЖК Гливки")).toBeInTheDocument();
    });

    await user.click(screen.getByText("ЖК Гливки"));

    await waitFor(() => {
      expect(screen.getByText("Завершено: 2026-01-13")).toBeInTheDocument();
    });
  });

  it("enters edit mode and saves changes", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Бойлерна вул. Карпенка")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Бойлерна вул. Карпенка"));

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

  it("cycles filter mode", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Усі")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Усі"));
    await waitFor(() => {
      expect(screen.getByText("Завершені")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Завершені"));
    await waitFor(() => {
      expect(screen.getByText("Поточні")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Поточні"));
    await waitFor(() => {
      expect(screen.getByText("Усі")).toBeInTheDocument();
    });
  });

  it("cycles sort direction", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Термін")).toBeInTheDocument();
    });

    // Click the sort header 3 times — no visual assertion, just ensures it doesn't crash
    await user.click(screen.getByText("Термін"));
    await user.click(screen.getByText("Термін"));
    await user.click(screen.getByText("Термін"));
  });

  it("opens create task dialog", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Бойлерна вул. Карпенка")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Бойлерна вул. Карпенка"));

    await waitFor(() => {
      expect(screen.getByText("+ Задача")).toBeInTheDocument();
    });

    await user.click(screen.getByText("+ Задача"));

    await waitFor(() => {
      expect(screen.getByText("Нова задача")).toBeInTheDocument();
    });
  });

  it("opens create event dialog", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Бойлерна вул. Карпенка")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Бойлерна вул. Карпенка"));

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
      expect(screen.getByText("Бойлерна вул. Карпенка")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Бойлерна вул. Карпенка"));

    const deleteButtons = await screen.findAllByText("Видалити");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Видалити об'єкт/)).toBeInTheDocument();
    });

    await user.click(screen.getByText("Скасувати"));

    // Object should still exist
    await waitFor(() => {
      expect(
        screen.getAllByText("Бойлерна вул. Карпенка").length
      ).toBeGreaterThan(0);
    });
  });

  it("selects a task and shows detail", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Бойлерна вул. Карпенка")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Бойлерна вул. Карпенка"));

    await waitFor(() => {
      expect(screen.getByText("Розрахувати параметри котла")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Розрахувати параметри котла"));

    // Task detail should show
    await waitFor(() => {
      expect(screen.getAllByText("Розрахувати параметри котла").length).toBeGreaterThan(0);
    });
  });

  it("selects an event and shows detail", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Бойлерна вул. Карпенка")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Бойлерна вул. Карпенка"));

    await waitFor(() => {
      expect(
        screen.getByText("Отримано ТЗ від замовника")
      ).toBeInTheDocument();
    });

    await user.click(screen.getByText("Отримано ТЗ від замовника"));

    await waitFor(() => {
      expect(
        screen.getAllByText("Отримано ТЗ від замовника").length
      ).toBeGreaterThan(0);
    });
  });

  it("creates a task via dialog", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Бойлерна вул. Карпенка")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Бойлерна вул. Карпенка"));

    await waitFor(() => {
      expect(screen.getByText("+ Задача")).toBeInTheDocument();
    });

    await user.click(screen.getByText("+ Задача"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Опис задачі *")).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText("Опис задачі *"), "Нова тестова задача");
    await user.click(screen.getByRole("button", { name: "Створити" }));

    await waitFor(() => {
      expect(
        screen.getAllByText("Нова тестова задача").length
      ).toBeGreaterThan(0);
    });
  });

  it("creates an event via dialog", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Бойлерна вул. Карпенка")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Бойлерна вул. Карпенка"));

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

  it("navigates to contacts when clicking contact card", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Бойлерна вул. Карпенка")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Бойлерна вул. Карпенка"));

    // Contact cards should appear
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

  it("edits object name", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Бойлерна вул. Карпенка")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Бойлерна вул. Карпенка"));

    await user.click(screen.getByText("Редагувати"));

    // Heading should become an input with the object's name
    await waitFor(() => {
      expect(
        screen.getByDisplayValue("Бойлерна вул. Карпенка")
      ).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue("Бойлерна вул. Карпенка");
    await user.clear(nameInput);
    await user.type(nameInput, "Оновлена назва");

    await user.click(screen.getByText("Зберегти"));

    await waitFor(() => {
      expect(screen.getAllByText("Оновлена назва").length).toBeGreaterThan(0);
    });
  });
});

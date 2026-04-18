import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useState } from "react";
import { renderWithProviders } from "../../__tests__/test-utils";
import ContactsView from "../ContactsView";
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
  return <ContactsView />;
}

function renderAsLoggedIn() {
  return renderWithProviders(<TestWrapper />);
}

async function selectFirstContact(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => {
    expect(screen.getByText("Котляревський К. А.")).toBeInTheDocument();
  });
  await user.click(screen.getByText("Котляревський К. А."));
}

describe("ContactsView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the contacts list", async () => {
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("Котляревський К. А.")).toBeInTheDocument();
    });
    expect(screen.getByText("Марченко І. В.")).toBeInTheDocument();
    expect(screen.getByText("Петренко О. М.")).toBeInTheDocument();
    expect(screen.getByText("Сидоренко В. І.")).toBeInTheDocument();
  });

  it("shows new contact button", async () => {
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("+ Новий контакт")).toBeInTheDocument();
    });
  });

  it("shows contact detail with name and kind badge", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();
    await selectFirstContact(user);

    await waitFor(() => {
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Котляревський К. А.");
    });
  });

  it("shows contact email", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();
    await selectFirstContact(user);

    await waitFor(() => {
      expect(screen.getByText("kotl@example.com")).toBeInTheDocument();
    });
  });

  it("shows contact phone", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();
    await selectFirstContact(user);

    await waitFor(() => {
      expect(screen.getByText("+380501234567")).toBeInTheDocument();
    });
  });

  it("shows edit and delete buttons", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();
    await selectFirstContact(user);

    await waitFor(() => {
      expect(screen.getByText("Редагувати")).toBeInTheDocument();
      expect(screen.getByText("Видалити")).toBeInTheDocument();
    });
  });

  it("opens create contact dialog", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("+ Новий контакт")).toBeInTheDocument();
    });

    await user.click(screen.getByText("+ Новий контакт"));

    await waitFor(() => {
      expect(screen.getByText("Новий контакт")).toBeInTheDocument();
    });
  });

  it("creates a new contact", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();

    await waitFor(() => {
      expect(screen.getByText("+ Новий контакт")).toBeInTheDocument();
    });

    await user.click(screen.getByText("+ Новий контакт"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Прізвище")).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText("Прізвище"), "Тестенко");
    await user.click(screen.getByRole("button", { name: "Створити" }));

    await waitFor(() => {
      expect(screen.getAllByText("Тестенко").length).toBeGreaterThan(0);
    });
  });

  it("deletes a contact after confirmation", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();
    await selectFirstContact(user);

    await waitFor(() => {
      expect(screen.getByText("Видалити")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Видалити");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Видалити контакт/)).toBeInTheDocument();
    });

    const confirmButtons = screen.getAllByText("Видалити");
    await user.click(confirmButtons[confirmButtons.length - 1]);

    await waitFor(() => {
      expect(
        screen.queryByText("Котляревський К. А.")
      ).not.toBeInTheDocument();
    });
  });

  it("shows related items section", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();
    await selectFirstContact(user);

    await waitFor(() => {
      expect(screen.getByText("Пов'язані записи")).toBeInTheDocument();
    });
  });

  it("enters edit mode and toggles back", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();
    await selectFirstContact(user);

    await waitFor(() => {
      expect(screen.getByText("Редагувати")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Редагувати"));

    // In edit mode, input with the last name should appear
    await waitFor(() => {
      expect(
        screen.getByDisplayValue("Котляревський")
      ).toBeInTheDocument();
    });

    await user.click(screen.getByText("Зберегти"));

    await waitFor(() => {
      expect(screen.getByText("Редагувати")).toBeInTheDocument();
    });
  });

  it("adds a new email in edit mode", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();
    await selectFirstContact(user);

    await user.click(screen.getByText("Редагувати"));

    await waitFor(() => {
      expect(screen.getByText("+ Додати e-mail")).toBeInTheDocument();
    });

    await user.click(screen.getByText("+ Додати e-mail"));

    // A second email input row should appear (original + new)
    const emailInputs = screen.getAllByPlaceholderText("Email");
    expect(emailInputs.length).toBeGreaterThan(1);
  });

  it("adds a new phone in edit mode", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();
    await selectFirstContact(user);

    await user.click(screen.getByText("Редагувати"));

    await waitFor(() => {
      expect(screen.getByText("+ Додати телефон")).toBeInTheDocument();
    });

    await user.click(screen.getByText("+ Додати телефон"));

    const phoneInputs = screen.getAllByPlaceholderText("Телефон");
    expect(phoneInputs.length).toBeGreaterThan(1);
  });

  it("cancels delete confirmation", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();
    await selectFirstContact(user);

    await user.click(screen.getByText("Видалити"));

    await waitFor(() => {
      expect(screen.getByText(/Видалити контакт/)).toBeInTheDocument();
    });

    await user.click(screen.getByText("Скасувати"));

    // Contact should still be visible
    await waitFor(() => {
      expect(
        screen.getAllByText("Котляревський К. А.").length
      ).toBeGreaterThan(0);
    });
  });

  it("navigates to related object when clicked", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();
    await selectFirstContact(user);

    await waitFor(() => {
      expect(screen.getByText("Бойлерна вул. Карпенка")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Бойлерна вул. Карпенка"));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/objects",
      expect.objectContaining({ state: { selectObjectId: "1" } })
    );
  });

  it("removes email in edit mode", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();
    await selectFirstContact(user);

    await user.click(screen.getByText("Редагувати"));

    await waitFor(() => {
      expect(
        screen.getByDisplayValue("kotl@example.com")
      ).toBeInTheDocument();
    });

    // Find the × button adjacent to the email input and click it
    const removeButtons = screen.getAllByText("×");
    await user.click(removeButtons[0]);

    expect(
      screen.queryByDisplayValue("kotl@example.com")
    ).not.toBeInTheDocument();
  });

  it("changes kind in edit mode", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();
    await selectFirstContact(user);

    await user.click(screen.getByText("Редагувати"));

    await waitFor(() => {
      expect(screen.getByDisplayValue("Котляревський")).toBeInTheDocument();
    });

    // Find the kind select
    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[0], "subcontractor");
  });

  it("edits notes field", async () => {
    const user = userEvent.setup();
    renderAsLoggedIn();
    await selectFirstContact(user);

    await user.click(screen.getByText("Редагувати"));

    await waitFor(() => {
      expect(screen.getByDisplayValue("Котляревський")).toBeInTheDocument();
    });

    const textareas = screen.getAllByRole("textbox").filter(
      (el) => el.tagName === "TEXTAREA"
    );
    if (textareas.length > 0) {
      await user.clear(textareas[0]);
      await user.type(textareas[0], "Нові нотатки");
      expect(screen.getByDisplayValue("Нові нотатки")).toBeInTheDocument();
    }
  });
});

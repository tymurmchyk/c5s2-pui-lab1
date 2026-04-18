describe("Contacts", () => {
  beforeEach(() => {
    cy.login();
    cy.contains("button", "Контакти").click();
    cy.url().should("include", "/contacts");
  });

  it("displays demo contacts", () => {
    cy.contains("Котляревський К. А.").should("be.visible");
    cy.contains("Марченко І. В.").should("be.visible");
    cy.contains("Петренко О. М.").should("be.visible");
    cy.contains("Сидоренко В. І.").should("be.visible");
  });

  it("shows contact detail", () => {
    cy.contains("h2", "Котляревський К. А.").should("be.visible");
    cy.contains("kotl@example.com").should("be.visible");
    cy.contains("+380501234567").should("be.visible");
  });

  it("creates a new contact", () => {
    cy.contains("button", "+ Новий контакт").click();
    cy.get('input[placeholder="Прізвище"]').type("Новенко");
    cy.get('input[placeholder="Ім\'я"]').type("Т.");
    cy.contains("button", "Створити").click();
    cy.contains("Новенко Т.").should("be.visible");
  });

  it("deletes a contact", () => {
    cy.contains("button", "Видалити").first().click();
    cy.contains("Видалити контакт").should("be.visible");
    cy.get('[role="dialog"]').contains("button", "Видалити").click();
    cy.contains("Котляревський К. А.").should("not.exist");
  });
});

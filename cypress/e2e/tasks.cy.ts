describe("Extra Tasks", () => {
  beforeEach(() => {
    cy.login();
    cy.contains("button", "Дод. завд.").click();
    cy.url().should("include", "/tasks");
  });

  it("displays demo tasks", () => {
    cy.contains("Кошторис для котельні").should("be.visible");
    cy.contains("Технічна документація КПІ").should("be.visible");
    cy.contains("Консультація щодо ЖК Гливки").should("be.visible");
  });

  it("selects a task and shows detail", () => {
    cy.contains("Кошторис для котельні").click();
    cy.get("h1").should("contain", "Кошторис для котельні");
    cy.contains("15 000 грн").should("be.visible");
  });

  it("creates a new task", () => {
    cy.contains("button", "+ Нове завдання").click();
    cy.get('input[placeholder="Назва *"]').type("Нове тестове завдання");
    cy.contains("button", "Створити").click();
    cy.contains("Нове тестове завдання").should("be.visible");
  });

  it("deletes a task", () => {
    cy.contains("Кошторис для котельні").click();
    cy.contains("button", "Видалити").first().click();
    cy.contains("Видалити завдання").should("be.visible");
    cy.get('[role="dialog"]').contains("button", "Видалити").click();
    cy.contains("Кошторис для котельні").should("not.exist");
  });
});

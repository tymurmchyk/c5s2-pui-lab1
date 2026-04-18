describe("Engineering Objects", () => {
  beforeEach(() => {
    cy.login();
  });

  it("displays demo objects in the list", () => {
    cy.contains("Бойлерна вул. Карпенка").should("be.visible");
    cy.contains("Реконструкція пр. Перемоги").should("be.visible");
    cy.contains("Гуртожиток КПІ 2025").should("be.visible");
    cy.contains("ЖК Гливки").should("be.visible");
  });

  it("selects an object and shows detail", () => {
    cy.contains("Бойлерна вул. Карпенка").click();
    cy.get("h1").should("contain", "Бойлерна вул. Карпенка");
    cy.contains("85 000 грн").should("be.visible");
  });

  it("creates a new object", () => {
    cy.contains("button", "+ Новий об'єкт").click();
    cy.get('input[placeholder="Назва *"]').type("Тестовий об'єкт");
    cy.contains("button", "Створити").click();
    cy.contains("Тестовий об'єкт").should("be.visible");
  });

  it("edits an object", () => {
    cy.contains("Бойлерна вул. Карпенка").click();
    cy.contains("button", "Редагувати").click();
    // The name becomes an input in edit mode
    cy.get('input[class*="text-2xl"]').clear().type("Бойлерна Оновлена");
    cy.contains("button", "Зберегти").click();
    cy.get("h1").should("contain", "Бойлерна Оновлена");
  });

  it("deletes an object", () => {
    cy.contains("Бойлерна вул. Карпенка").click();
    cy.contains("button", "Видалити").first().click();
    // Confirm dialog
    cy.contains("Видалити об'єкт").should("be.visible");
    cy.get('[role="dialog"]').contains("button", "Видалити").click();
    cy.contains("Бойлерна вул. Карпенка").should("not.exist");
  });
});

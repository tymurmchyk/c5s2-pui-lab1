describe("Navigation", () => {
  it("redirects / to /about", () => {
    cy.visit("/");
    cy.url().should("include", "/about");
  });

  it("redirects protected routes to /login when unauthenticated", () => {
    cy.visit("/objects");
    cy.url().should("include", "/login");

    cy.visit("/contacts");
    cy.url().should("include", "/login");

    cy.visit("/tasks");
    cy.url().should("include", "/login");

    cy.visit("/profile");
    cy.url().should("include", "/login");
  });

  it("shows unauthenticated nav state", () => {
    cy.visit("/about");
    cy.contains("Увійдіть, щоб перейти до органайзера").should("be.visible");
    cy.contains("button", "Увійти").should("be.visible");
    cy.contains("button", "Реєстрація").should("be.visible");
  });

  it("navigates between pages when authenticated", () => {
    cy.login();

    cy.contains("button", "Контакти").click();
    cy.url().should("include", "/contacts");

    cy.contains("button", "Дод. завд.").click();
    cy.url().should("include", "/tasks");

    cy.contains("button", "Об'єкти").click();
    cy.url().should("include", "/objects");

    cy.contains("button", "Профіль").click();
    cy.url().should("include", "/profile");

    cy.contains("button", "Про додаток").click();
    cy.url().should("include", "/about");
  });
});

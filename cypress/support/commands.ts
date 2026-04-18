declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add("login", (email = "demo@example.com", password = "demo") => {
  cy.visit("/login");
  cy.get("#login-email").type(email);
  cy.get("#login-password").type(password);
  cy.get("form").contains("button", "Увійти").click();
  cy.url().should("include", "/objects");
});

export {};

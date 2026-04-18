describe("Authentication", () => {
  it("logs in with demo credentials", () => {
    cy.visit("/login");
    cy.get("#login-email").type("demo@example.com");
    cy.get("#login-password").type("demo");
    cy.get("form").contains("button", "Увійти").click();
    cy.url().should("include", "/objects");
  });

  it("shows error for invalid credentials", () => {
    cy.visit("/login");
    cy.get("#login-email").type("wrong@example.com");
    cy.get("#login-password").type("wrong");
    cy.get("form").contains("button", "Увійти").click();
    cy.contains("Невірний e-mail або пароль").should("be.visible");
  });

  it("registers a new user", () => {
    cy.visit("/register");
    cy.get("#reg-email").type("new@example.com");
    cy.get("#reg-password").type("password123");
    cy.get("#reg-firstname").type("Тест");
    cy.get("#reg-lastname").type("Тестенко");
    cy.get("#reg-birthdate").type("2000-01-01");
    cy.contains("button", "Зареєструватися").click();
    cy.url().should("include", "/objects");
  });

  it("shows validation error on empty register form", () => {
    cy.visit("/register");
    cy.contains("button", "Зареєструватися").click();
    cy.contains("Будь ласка, заповніть усі обов'язкові поля").should(
      "be.visible"
    );
  });

  it("logs out and redirects away from protected routes", () => {
    cy.login();
    cy.contains("button", "Вийти").click();
    cy.url().should("not.include", "/objects");
    cy.contains("Увійти").should("be.visible");
  });
});

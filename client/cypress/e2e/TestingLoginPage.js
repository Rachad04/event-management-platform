// cypress/e2e/loginPage.cy.js
describe("Login Page", () => {
  it("logs in successfully with valid credentials", () => {
    cy.visit("http://localhost:3000/login"); // Update with your base URL

    // Enter credentials
    cy.get('input[name="email"]').type("test@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get("form").submit();

    // Verify navigation to the user dashboard
    cy.url().should("include", "/users/user/");
  });

  it("shows error for invalid login", () => {
    cy.visit("http://localhost:3000/login");

    // Enter invalid credentials
    cy.get('input[name="email"]').type("invalid@example.com");
    cy.get('input[name="password"]').type("wrongpassword");
    cy.get("form").submit();

    // Check for error message
    cy.contains("Server error. Please try again.");
  });
});

// cypress/e2e/managerPage.cy.js
describe("Manager Page", () => {
  it("creates a new event", () => {
    cy.visit("http://localhost:3000/manager");

    // Ensure the form is visible
    cy.contains("Manage Events");

    // Fill out event details
    cy.get('input[name="name"]').type("Test Event");
    cy.get('input[name="date"]').type("2025-01-01");
    cy.get('input[name="location"]').type("Test Location");

    // Submit the form
    cy.get("form").submit();

    // Check for success message
    cy.contains("Event created successfully!");
  });

  it("displays no access message for non-admins", () => {
    // Mock a non-admin user
    localStorage.setItem("token", "non-admin-token");
    cy.visit("http://localhost:3000/manager");

    // Verify no access message
    cy.contains("You are not authorized to create events.");
  });
});

// cypress/e2e/homePage.cy.js
describe("Home Page", () => {
  it("loads the homepage and navigates to sign-up and login", () => {
    cy.visit("http://localhost:3000"); // Update with your base URL

    // Check if the homepage loads correctly
    cy.contains("Welcome to Evently");
    cy.contains("Create an Event");

    // Navigate to sign-up
    cy.get('.redirect-button a[href="/sign-up"]').click();
    cy.url().should("include", "/sign-up");
    cy.go("back");

    // Navigate to login
    cy.get('.redirect-button a[href="/login"]').click();
    cy.url().should("include", "/login");
  });

  it("interacts with feature cards", () => {
    cy.visit("http://localhost:3000");

    // Interact with feature cards
    cy.contains("Create Events").parent().find(".card-button").click();
    cy.contains("Track RSVPs").parent().find(".card-button").click();
    cy.contains("Connect with Attendees").parent().find(".card-button").click();
  });
});

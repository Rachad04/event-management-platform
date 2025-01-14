// cypress/e2e/eventsPage.cy.js
describe("Events Page", () => {
  it("loads events and filters them", () => {
    cy.visit("http://localhost:3000/events"); // Change URL to match your app

    // Verify the hero section is displayed
    cy.get(".hero-section").contains("Welcome to Evently");

    // Check the search functionality
    cy.get(".search-input").type("music");
    cy.get(".event-card").should("exist");
  });

  it("navigates to an event's ticketing page", () => {
    cy.visit("http://localhost:3000/events");
    cy.get(".event-button").first().click();

    // Verify navigation to ticketing page
    cy.url().should("include", "/tickets/");
  });
});

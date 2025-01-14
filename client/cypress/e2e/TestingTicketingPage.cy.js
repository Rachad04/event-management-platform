// cypress/e2e/ticketingPage.cy.js
describe("Ticketing Page", () => {
  it("selects tickets and submits payment", () => {
    cy.visit("http://localhost:3000/tickets/7"); // Change URL to match a valid eventId

    // Select tickets
    cy.get("input#tickets").clear().type("2");
    cy.get(".total-fees").contains("$");

    // Fill payment details
    cy.get("input#cardNumber").type("4111111111111111");
    cy.get("input#cardHolder").type("John Doe");
    cy.get("input#expiryDate").type("12/25");
    cy.get("input#cvv").type("123");

    // Submit payment
    cy.get(".checkout-button").click();

 
  });
});

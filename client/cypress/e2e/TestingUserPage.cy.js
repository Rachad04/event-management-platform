// cypress/e2e/userPage.cy.js
describe("User Page", () => {
    it("displays user details", () => {
      cy.visit("http://localhost:3000/users/user/1"); // Use a valid user ID
  
      // Check for user details
      cy.contains("First Name");
      cy.contains("Last Name");
      cy.contains("Email");
    });
  
    it("allows editing user profile", () => {
      cy.visit("http://localhost:3000/users/user/1");
  
      // Click modify details
      cy.contains("Modify details").click();
  
      // Edit and save details
      cy.get('input[name="firstName"]').clear().type("Updated Name");
      cy.get("form").submit();
  
      // Verify success message
      cy.contains("Profile updated successfully!");
    });
  
    it("changes the user password", () => {
      cy.visit("http://localhost:3000/users/user/1");
  
      // Open password modal
      cy.contains("Change Password").click();
  
      // Fill in password details
      cy.get('input[name="currentPassword"]').type("currentpass");
      cy.get('input[name="newPassword"]').type("newpassword123");
      cy.get('input[name="confirmPassword"]').type("newpassword123");
  
      // Submit the form
      cy.get("form").submit();
  
      // Check for success message
      cy.contains("Password changed successfully!");
    });
  });
  
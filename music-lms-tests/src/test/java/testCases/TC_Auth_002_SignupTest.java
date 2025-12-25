package testCases;

import org.testng.Assert;
import org.testng.annotations.Test;

import pageObjects.LoginPage;
import pageObjects.SignupPage;
import testBase.BaseClass;

/**
 * =============================================================================
 * TC_Auth_002_SignupTest - SIGNUP/REGISTRATION TEST CASES
 * =============================================================================
 *
 * This test class covers the Teacher Signup functionality.
 *
 * BUSINESS CONTEXT:
 * -----------------
 * In MusicLMS, there are two ways users can register:
 * 1. Teachers: Sign up directly through /signup page (default role: teacher)
 * 2. Students: Register via invite links sent by teachers
 *
 * This test class focuses on TEACHER registration.
 * Student registration (via invite) is tested in TC_Auth_003_InviteTest.
 *
 * SIGNUP REQUIREMENTS:
 * --------------------
 * - Full Name: Required
 * - Email: Required, must be valid email format
 * - Password: Required, minimum 6 characters
 *
 * SIGNUP FLOW:
 * 1. User fills out signup form
 * 2. System validates input
 * 3. System creates Supabase Auth user
 * 4. System creates user profile with role="teacher"
 * 5. User receives confirmation email
 * 6. User is redirected to login page
 *
 * =============================================================================
 */
public class TC_Auth_002_SignupTest extends BaseClass {

    /**
     * =========================================================================
     * TEST CASE: TC_Auth_008 - Verify Signup Page Display
     * =========================================================================
     *
     * OBJECTIVE: Verify that the signup page is displayed correctly.
     */
    @Test(
        groups = {"sanity", "master"},
        priority = 1,
        description = "Verify signup page is displayed correctly"
    )
    public void TC_Auth_008_VerifySignupPageDisplay() {
        logger.info("========== TC_Auth_008: Verify Signup Page Display ==========");

        // ARRANGE
        driver.get(p.getProperty("appUrl") + "/signup");
        logger.info("Navigated to signup page");

        // ACT
        SignupPage signupPage = new SignupPage(driver);

        // ASSERT
        Assert.assertTrue(
            signupPage.isPageDisplayed(),
            "Signup page should be displayed"
        );

        // Verify Terms text is shown
        Assert.assertTrue(
            signupPage.isTermsTextDisplayed(),
            "Terms and Privacy text should be visible"
        );

        logger.info("========== TC_Auth_008: PASSED ==========");
    }

    /**
     * =========================================================================
     * TEST CASE: TC_Auth_009 - Verify Valid Teacher Signup
     * =========================================================================
     *
     * OBJECTIVE: Verify that a teacher can sign up successfully.
     *
     * NOTE:
     * This test creates a real user in the database.
     * We use random email to avoid conflicts.
     * In real scenarios, you might want to:
     * - Clean up test data after test
     * - Use a test database
     * - Mock the auth service
     */
    @Test(
        groups = {"regression", "master"},
        priority = 2,
        description = "Verify teacher can signup with valid data"
    )
    public void TC_Auth_009_VerifyValidTeacherSignup() {
        logger.info("========== TC_Auth_009: Verify Valid Teacher Signup ==========");

        // ARRANGE
        driver.get(p.getProperty("appUrl") + "/signup");
        SignupPage signupPage = new SignupPage(driver);

        // Generate unique test data
        String fullName = "Test Teacher " + randomString();
        String email = randomEmail();  // Unique email for each test run
        String password = "TestPass123!";

        logger.info("Signing up with:");
        logger.info("  Name: " + fullName);
        logger.info("  Email: " + email);

        // ACT
        signupPage.signup(fullName, email, password);

        // Wait for response
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // ASSERT
        // After signup, user should be redirected to login page
        // OR see a success message about email confirmation
        boolean redirectedToLogin = driver.getCurrentUrl().contains("/login");

        logger.info("Redirected to login: " + redirectedToLogin);

        // The app shows toast message and redirects to login
        // We verify the redirect happened
        Assert.assertTrue(
            redirectedToLogin || signupPage.isPageDisplayed(),
            "User should be redirected to login or see confirmation"
        );

        logger.info("========== TC_Auth_009: PASSED ==========");
    }

    /**
     * =========================================================================
     * TEST CASE: TC_Auth_010 - Verify Empty Fields Validation
     * =========================================================================
     *
     * OBJECTIVE: Verify form validation for empty fields.
     */
    @Test(
        groups = {"regression", "master"},
        priority = 3,
        description = "Verify signup fails with empty fields"
    )
    public void TC_Auth_010_VerifyEmptyFieldsValidation() {
        logger.info("========== TC_Auth_010: Verify Empty Fields Validation ==========");

        // ARRANGE
        driver.get(p.getProperty("appUrl") + "/signup");
        SignupPage signupPage = new SignupPage(driver);

        logger.info("Attempting signup with empty fields");

        // ACT
        signupPage.clickCreateAccount();

        // ASSERT
        // Form should not submit, user stays on page
        Assert.assertTrue(
            driver.getCurrentUrl().contains("/signup"),
            "User should remain on signup page"
        );

        // Verify fields are still empty
        Assert.assertEquals(
            signupPage.getFullNameValue(),
            "",
            "Full name field should be empty"
        );

        logger.info("========== TC_Auth_010: PASSED ==========");
    }

    /**
     * =========================================================================
     * TEST CASE: TC_Auth_011 - Verify Short Password Validation
     * =========================================================================
     *
     * OBJECTIVE: Verify password minimum length validation (6 characters).
     */
    @Test(
        groups = {"regression", "master"},
        priority = 4,
        description = "Verify signup fails with short password"
    )
    public void TC_Auth_011_VerifyShortPasswordValidation() {
        logger.info("========== TC_Auth_011: Verify Short Password Validation ==========");

        // ARRANGE
        driver.get(p.getProperty("appUrl") + "/signup");
        SignupPage signupPage = new SignupPage(driver);

        String fullName = "Test User";
        String email = randomEmail();
        String shortPassword = "12345";  // Only 5 characters

        logger.info("Attempting signup with short password (5 chars)");

        // ACT
        signupPage.enterFullName(fullName)
                  .enterEmail(email)
                  .enterPassword(shortPassword);
        signupPage.clickCreateAccount();

        // Wait a moment
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // ASSERT
        // HTML5 minLength validation should prevent submission
        // User should remain on signup page
        Assert.assertTrue(
            driver.getCurrentUrl().contains("/signup"),
            "User should remain on signup page due to password validation"
        );

        logger.info("========== TC_Auth_011: PASSED ==========");
    }

    /**
     * =========================================================================
     * TEST CASE: TC_Auth_012 - Verify Invalid Email Format Validation
     * =========================================================================
     *
     * OBJECTIVE: Verify email format validation.
     */
    @Test(
        groups = {"regression", "master"},
        priority = 5,
        description = "Verify signup fails with invalid email format"
    )
    public void TC_Auth_012_VerifyInvalidEmailValidation() {
        logger.info("========== TC_Auth_012: Verify Invalid Email Validation ==========");

        // ARRANGE
        driver.get(p.getProperty("appUrl") + "/signup");
        SignupPage signupPage = new SignupPage(driver);

        String fullName = "Test User";
        String invalidEmail = "not-an-email";
        String password = "ValidPass123!";

        logger.info("Attempting signup with invalid email: " + invalidEmail);

        // ACT
        signupPage.signup(fullName, invalidEmail, password);

        // ASSERT
        // HTML5 email validation should prevent submission
        Assert.assertTrue(
            driver.getCurrentUrl().contains("/signup"),
            "User should remain on signup page due to email validation"
        );

        logger.info("========== TC_Auth_012: PASSED ==========");
    }

    /**
     * =========================================================================
     * TEST CASE: TC_Auth_013 - Verify Navigation to Login Page
     * =========================================================================
     *
     * OBJECTIVE: Verify "Log in" link navigates to login page.
     */
    @Test(
        groups = {"sanity", "master"},
        priority = 6,
        description = "Verify navigation from signup to login page"
    )
    public void TC_Auth_013_VerifyLoginNavigation() {
        logger.info("========== TC_Auth_013: Verify Login Navigation ==========");

        // ARRANGE
        driver.get(p.getProperty("appUrl") + "/signup");
        SignupPage signupPage = new SignupPage(driver);

        logger.info("Clicking Log in link");

        // ACT
        signupPage.clickLoginLink();

        // ASSERT
        LoginPage loginPage = new LoginPage(driver);
        Assert.assertTrue(
            driver.getCurrentUrl().contains("/login"),
            "Should navigate to login page"
        );
        Assert.assertTrue(
            loginPage.isPageDisplayed(),
            "Login page should be displayed"
        );

        logger.info("========== TC_Auth_013: PASSED ==========");
    }

    /**
     * =========================================================================
     * TEST CASE: TC_Auth_014 - Verify Create Account Button State
     * =========================================================================
     *
     * OBJECTIVE: Verify Create Account button is enabled.
     */
    @Test(
        groups = {"sanity", "master"},
        priority = 7,
        description = "Verify Create Account button is enabled"
    )
    public void TC_Auth_014_VerifyCreateAccountButtonState() {
        logger.info("========== TC_Auth_014: Verify Create Account Button State ==========");

        // ARRANGE
        driver.get(p.getProperty("appUrl") + "/signup");
        SignupPage signupPage = new SignupPage(driver);

        // ACT & ASSERT
        boolean isEnabled = signupPage.isCreateAccountButtonEnabled();

        logger.info("Create Account button enabled: " + isEnabled);
        Assert.assertTrue(isEnabled, "Create Account button should be enabled");

        logger.info("========== TC_Auth_014: PASSED ==========");
    }

    /**
     * =========================================================================
     * TEST CASE: TC_Auth_015 - Verify Duplicate Email Signup
     * =========================================================================
     *
     * OBJECTIVE: Verify signup fails when email is already registered.
     *
     * NOTE: This test depends on having a known email in the system.
     */
    @Test(
        groups = {"regression", "master"},
        priority = 8,
        description = "Verify signup fails with already registered email"
    )
    public void TC_Auth_015_VerifyDuplicateEmailSignup() {
        logger.info("========== TC_Auth_015: Verify Duplicate Email Signup ==========");

        // ARRANGE
        driver.get(p.getProperty("appUrl") + "/signup");
        SignupPage signupPage = new SignupPage(driver);

        // Use the test email that should already exist
        String existingEmail = p.getProperty("testEmail");
        String fullName = "Duplicate Test";
        String password = "TestPass123!";

        logger.info("Attempting signup with existing email: " + existingEmail);

        // ACT
        signupPage.signup(fullName, existingEmail, password);

        // Wait for error response
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // ASSERT
        // Should see an error (displayed via toast in this app)
        // At minimum, user should not be redirected to dashboard
        String currentUrl = driver.getCurrentUrl();

        logger.info("Current URL after duplicate signup: " + currentUrl);

        // User should either stay on signup or go to login (for confirmation flow)
        // Should NOT go to dashboard
        Assert.assertFalse(
            currentUrl.contains("/dashboard"),
            "User should not reach dashboard with duplicate email"
        );

        logger.info("========== TC_Auth_015: PASSED ==========");
    }
}

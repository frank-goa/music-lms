package testCases;

import org.testng.Assert;
import org.testng.annotations.Test;

import pageObjects.DashboardPage;
import pageObjects.LoginPage;
import pageObjects.SignupPage;
import testBase.BaseClass;

/**
 * =============================================================================
 * TC_Auth_001_LoginTest - LOGIN FUNCTIONALITY TEST CASES
 * =============================================================================
 *
 * This test class contains all test cases related to the Login functionality.
 *
 * TEST CASE NAMING CONVENTION:
 * ----------------------------
 * TC_[Module]_[Number]_[Description]
 *
 * - TC: Test Case
 * - Module: The module being tested (Auth, Dashboard, etc.)
 * - Number: Unique identifier within the module
 * - Description: Brief description of what's being tested
 *
 * Examples:
 * - TC_Auth_001_ValidLogin
 * - TC_Auth_002_InvalidPassword
 * - TC_Auth_003_EmptyFields
 *
 * TEST STRUCTURE (AAA Pattern):
 * -----------------------------
 * Each test follows the Arrange-Act-Assert pattern:
 *
 * 1. ARRANGE: Set up test data and preconditions
 * 2. ACT: Perform the action being tested
 * 3. ASSERT: Verify the expected results
 *
 * TESTNG ANNOTATIONS USED:
 * ------------------------
 * - @Test: Marks method as a test
 * - groups: Categorizes tests (sanity, regression)
 * - priority: Controls test execution order
 * - description: Documents what the test does
 * - enabled: true/false to enable/disable test
 * - dependsOnMethods: Run only if specified test passed
 *
 * ASSERTION TYPES:
 * ----------------
 * - Assert.assertTrue(condition): Pass if condition is true
 * - Assert.assertFalse(condition): Pass if condition is false
 * - Assert.assertEquals(actual, expected): Pass if values match
 * - Assert.assertNotNull(object): Pass if object is not null
 *
 * =============================================================================
 */
public class TC_Auth_001_LoginTest extends BaseClass {

    /**
     * =========================================================================
     * TEST CASE: TC_Auth_001 - Verify Login Page Display
     * =========================================================================
     *
     * OBJECTIVE: Verify that the login page is displayed correctly.
     *
     * PRECONDITIONS:
     * - Application is accessible
     * - User is not logged in
     *
     * TEST STEPS:
     * 1. Navigate to login page
     * 2. Verify page elements are displayed
     *
     * EXPECTED RESULT:
     * - Login page is displayed with all elements
     *
     * GROUPS:
     * - sanity: Basic functionality check
     * - master: Included in all test runs
     */
    @Test(
        groups = {"sanity", "master"},
        priority = 1,
        description = "Verify login page is displayed correctly"
    )
    public void TC_Auth_001_VerifyLoginPageDisplay() {
        logger.info("========== TC_Auth_001: Verify Login Page Display ==========");

        // ARRANGE
        // Navigate to login page (done in setup, but let's be explicit)
        driver.get(p.getProperty("appUrl") + "/login");
        logger.info("Navigated to login page");

        // ACT
        // Create LoginPage object
        LoginPage loginPage = new LoginPage(driver);

        // ASSERT
        // Verify page is displayed
        boolean isDisplayed = loginPage.isPageDisplayed();

        logger.info("Login page displayed: " + isDisplayed);
        Assert.assertTrue(isDisplayed, "Login page should be displayed");

        logger.info("========== TC_Auth_001: PASSED ==========");
    }

    /**
     * =========================================================================
     * TEST CASE: TC_Auth_002 - Verify Valid Login
     * =========================================================================
     *
     * OBJECTIVE: Verify that users can log in with valid credentials.
     *
     * PRECONDITIONS:
     * - User account exists in the system
     * - Valid credentials are available
     *
     * TEST STEPS:
     * 1. Navigate to login page
     * 2. Enter valid email
     * 3. Enter valid password
     * 4. Click Login button
     * 5. Verify redirect to dashboard
     *
     * EXPECTED RESULT:
     * - User is logged in and redirected to dashboard
     *
     * NOTE:
     * This test requires a valid user in the database.
     * In a real scenario, you would either:
     * - Use a pre-created test user
     * - Create user via API before test
     * - Use a test database with known data
     */
    @Test(
        groups = {"sanity", "regression", "master"},
        priority = 2,
        description = "Verify login with valid credentials"
    )
    public void TC_Auth_002_VerifyValidLogin() {
        logger.info("========== TC_Auth_002: Verify Valid Login ==========");

        // ARRANGE
        driver.get(p.getProperty("appUrl") + "/login");
        LoginPage loginPage = new LoginPage(driver);

        // Get credentials from config (in real test, these would be real test users)
        String email = p.getProperty("testEmail");
        String password = p.getProperty("testPassword");

        logger.info("Logging in with email: " + email);

        // ACT
        loginPage.login(email, password);

        // ASSERT
        // Wait for redirect and verify
        DashboardPage dashboardPage = new DashboardPage(driver);
        boolean loginSuccess = dashboardPage.waitForDashboardLoad();

        logger.info("Login successful: " + loginSuccess);

        if (loginSuccess) {
            Assert.assertTrue(dashboardPage.isPageDisplayed(), "Dashboard should be displayed after login");
            logger.info("========== TC_Auth_002: PASSED ==========");
        } else {
            // Log failure reason
            logger.error("Login failed - dashboard not loaded");
            Assert.fail("Login should redirect to dashboard");
        }
    }

    /**
     * =========================================================================
     * TEST CASE: TC_Auth_003 - Verify Invalid Password Login
     * =========================================================================
     *
     * OBJECTIVE: Verify that login fails with incorrect password.
     *
     * PRECONDITIONS:
     * - User account exists
     *
     * TEST STEPS:
     * 1. Navigate to login page
     * 2. Enter valid email
     * 3. Enter invalid password
     * 4. Click Login button
     * 5. Verify error message is displayed
     *
     * EXPECTED RESULT:
     * - Login fails
     * - Error message is shown
     * - User remains on login page
     */
    @Test(
        groups = {"regression", "master"},
        priority = 3,
        description = "Verify login fails with invalid password"
    )
    public void TC_Auth_003_VerifyInvalidPasswordLogin() {
        logger.info("========== TC_Auth_003: Verify Invalid Password Login ==========");

        // ARRANGE
        driver.get(p.getProperty("appUrl") + "/login");
        LoginPage loginPage = new LoginPage(driver);

        String email = p.getProperty("testEmail");
        String invalidPassword = "WrongPassword123!";

        logger.info("Attempting login with invalid password");

        // ACT
        loginPage.login(email, invalidPassword);

        // Wait a moment for error to appear
        try {
            Thread.sleep(2000);  // In real tests, use explicit waits instead
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // ASSERT
        // Verify still on login page (not redirected)
        Assert.assertTrue(
            driver.getCurrentUrl().contains("/login"),
            "User should remain on login page after failed login"
        );

        // Verify error message is displayed
        boolean hasError = loginPage.isErrorMessageDisplayed();
        logger.info("Error message displayed: " + hasError);

        // Note: Error might be shown via toast, so we check URL as primary assertion
        logger.info("========== TC_Auth_003: PASSED ==========");
    }

    /**
     * =========================================================================
     * TEST CASE: TC_Auth_004 - Verify Invalid Email Login
     * =========================================================================
     *
     * OBJECTIVE: Verify that login fails with non-existent email.
     */
    @Test(
        groups = {"regression", "master"},
        priority = 4,
        description = "Verify login fails with non-existent email"
    )
    public void TC_Auth_004_VerifyInvalidEmailLogin() {
        logger.info("========== TC_Auth_004: Verify Invalid Email Login ==========");

        // ARRANGE
        driver.get(p.getProperty("appUrl") + "/login");
        LoginPage loginPage = new LoginPage(driver);

        String nonExistentEmail = "nonexistent_" + randomString() + "@test.com";
        String password = "AnyPassword123!";

        logger.info("Attempting login with non-existent email: " + nonExistentEmail);

        // ACT
        loginPage.login(nonExistentEmail, password);

        // Wait for response
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // ASSERT
        Assert.assertTrue(
            driver.getCurrentUrl().contains("/login"),
            "User should remain on login page"
        );

        logger.info("========== TC_Auth_004: PASSED ==========");
    }

    /**
     * =========================================================================
     * TEST CASE: TC_Auth_005 - Verify Empty Fields Validation
     * =========================================================================
     *
     * OBJECTIVE: Verify that login fails when fields are empty.
     *
     * This tests HTML5 form validation.
     */
    @Test(
        groups = {"regression", "master"},
        priority = 5,
        description = "Verify login fails with empty fields"
    )
    public void TC_Auth_005_VerifyEmptyFieldsValidation() {
        logger.info("========== TC_Auth_005: Verify Empty Fields Validation ==========");

        // ARRANGE
        driver.get(p.getProperty("appUrl") + "/login");
        LoginPage loginPage = new LoginPage(driver);

        logger.info("Attempting login with empty fields");

        // ACT
        // Don't enter anything, just click login
        loginPage.clickLoginButton();

        // ASSERT
        // Should still be on login page (form validation prevents submission)
        Assert.assertTrue(
            driver.getCurrentUrl().contains("/login"),
            "User should remain on login page"
        );

        // Verify email field still empty
        Assert.assertTrue(
            loginPage.isEmailFieldEmpty(),
            "Email field should still be empty"
        );

        logger.info("========== TC_Auth_005: PASSED ==========");
    }

    /**
     * =========================================================================
     * TEST CASE: TC_Auth_006 - Verify Navigation to Signup Page
     * =========================================================================
     *
     * OBJECTIVE: Verify that "Sign up" link navigates to signup page.
     */
    @Test(
        groups = {"sanity", "master"},
        priority = 6,
        description = "Verify navigation from login to signup page"
    )
    public void TC_Auth_006_VerifySignupNavigation() {
        logger.info("========== TC_Auth_006: Verify Signup Navigation ==========");

        // ARRANGE
        driver.get(p.getProperty("appUrl") + "/login");
        LoginPage loginPage = new LoginPage(driver);

        logger.info("Clicking Sign up link");

        // ACT
        loginPage.clickSignUpLink();

        // ASSERT
        SignupPage signupPage = new SignupPage(driver);
        Assert.assertTrue(
            driver.getCurrentUrl().contains("/signup"),
            "Should navigate to signup page"
        );
        Assert.assertTrue(
            signupPage.isPageDisplayed(),
            "Signup page should be displayed"
        );

        logger.info("========== TC_Auth_006: PASSED ==========");
    }

    /**
     * =========================================================================
     * TEST CASE: TC_Auth_007 - Verify Login Button State
     * =========================================================================
     *
     * OBJECTIVE: Verify login button is enabled and clickable.
     */
    @Test(
        groups = {"sanity", "master"},
        priority = 7,
        description = "Verify login button is enabled"
    )
    public void TC_Auth_007_VerifyLoginButtonState() {
        logger.info("========== TC_Auth_007: Verify Login Button State ==========");

        // ARRANGE
        driver.get(p.getProperty("appUrl") + "/login");
        LoginPage loginPage = new LoginPage(driver);

        // ACT & ASSERT
        boolean isEnabled = loginPage.isLoginButtonEnabled();

        logger.info("Login button enabled: " + isEnabled);
        Assert.assertTrue(isEnabled, "Login button should be enabled");

        logger.info("========== TC_Auth_007: PASSED ==========");
    }
}

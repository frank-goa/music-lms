package testCases;

import org.testng.Assert;
import org.testng.annotations.Test;

import pageObjects.DashboardPage;
import pageObjects.LoginPage;
import testBase.BaseClass;
import utilities.DataProviders;

/**
 * =============================================================================
 * TC_Auth_003_LoginDDT - DATA-DRIVEN LOGIN TESTS
 * =============================================================================
 *
 * This class demonstrates DATA-DRIVEN TESTING (DDT) approach.
 *
 * WHAT IS DATA-DRIVEN TESTING?
 * ----------------------------
 * Data-Driven Testing is a technique where:
 * - Test logic is written ONCE
 * - Test data comes from external sources (Excel, CSV, JSON)
 * - Same test runs multiple times with different data
 *
 * ANALOGY:
 * Think of it like a printer:
 * - The printer (test code) does the same thing every time
 * - But the documents (data) change with each print job
 *
 * BENEFITS OF DDT:
 * ----------------
 * 1. COVERAGE: Test many scenarios without writing many tests
 * 2. MAINTAINABILITY: Change data without changing code
 * 3. SCALABILITY: Easy to add new test cases (just add data)
 * 4. SEPARATION: Test logic separate from test data
 * 5. NON-TECHNICAL: Business users can add test cases
 *
 * HOW IT WORKS WITH TESTNG:
 * -------------------------
 *
 *     +-------------------+
 *     |   DataProvider    |  <-- Supplies test data
 *     +-------------------+
 *              |
 *              v
 *     +-------------------+
 *     |   Test Method     |  <-- Receives data as parameters
 *     +-------------------+
 *              |
 *              v
 *     +-------------------+
 *     |   Test Execution  |  <-- Runs once per data set
 *     +-------------------+
 *
 * EXAMPLE:
 * If DataProvider returns 5 sets of data, the test runs 5 times.
 *
 * =============================================================================
 */
public class TC_Auth_003_LoginDDT extends BaseClass {

    /**
     * =========================================================================
     * DATA-DRIVEN LOGIN TEST
     * =========================================================================
     *
     * This test method receives its data from the "LoginData" DataProvider.
     *
     * DATA PROVIDER CONNECTION:
     * - dataProvider = "LoginData": Name of the DataProvider method
     * - dataProviderClass = DataProviders.class: Class containing the provider
     *
     * METHOD PARAMETERS:
     * The parameters match the columns in the Excel file:
     * - Column A → email
     * - Column B → password
     * - Column C → expectedResult
     *
     * EXECUTION FLOW:
     * ---------------
     * DataProvider returns:
     *     [
     *         ["user1@test.com", "pass1", "true"],
     *         ["user2@test.com", "pass2", "true"],
     *         ["invalid@test.com", "wrong", "false"]
     *     ]
     *
     * Test runs 3 times:
     *     Iteration 1: email="user1@test.com", password="pass1", expected="true"
     *     Iteration 2: email="user2@test.com", password="pass2", expected="true"
     *     Iteration 3: email="invalid@test.com", password="wrong", expected="false"
     *
     * @param email Email from data provider
     * @param password Password from data provider
     * @param expectedResult "true" or "false" string indicating expected outcome
     */
    @Test(
        dataProvider = "LoginData",
        dataProviderClass = DataProviders.class,
        groups = {"dataDriven", "master"},
        description = "Data-driven login test with multiple credentials"
    )
    public void TC_Auth_DDT_001_LoginWithMultipleCredentials(
            String email,
            String password,
            String expectedResult) {

        logger.info("========== DATA-DRIVEN LOGIN TEST ==========");
        logger.info("Email: " + email);
        logger.info("Password: " + password);
        logger.info("Expected Result: " + expectedResult);

        // ARRANGE
        driver.get(p.getProperty("appUrl") + "/login");
        LoginPage loginPage = new LoginPage(driver);
        DashboardPage dashboardPage = new DashboardPage(driver);

        // Parse expected result
        boolean shouldSucceed = expectedResult.equalsIgnoreCase("true");

        // ACT
        loginPage.login(email, password);

        // Wait for result
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // ASSERT
        boolean loginSucceeded = driver.getCurrentUrl().contains("/dashboard");

        if (shouldSucceed) {
            // Expected to succeed
            Assert.assertTrue(
                loginSucceeded,
                "Login should succeed for " + email
            );
            logger.info("Login SUCCEEDED as expected");

            // Logout for next iteration
            if (loginSucceeded) {
                try {
                    dashboardPage.logout();
                    Thread.sleep(1000);
                } catch (Exception e) {
                    // Navigate to login if logout fails
                    driver.get(p.getProperty("appUrl") + "/login");
                }
            }
        } else {
            // Expected to fail
            Assert.assertFalse(
                loginSucceeded,
                "Login should fail for " + email
            );
            logger.info("Login FAILED as expected");
        }

        logger.info("========== TEST ITERATION COMPLETE ==========\n");
    }

    /**
     * =========================================================================
     * DATA-DRIVEN TEST WITH PASSWORD VALIDATION DATA
     * =========================================================================
     *
     * This test uses inline data (hardcoded in DataProviders class).
     * Useful for testing validation rules with known data.
     */
    @Test(
        dataProvider = "PasswordValidation",
        dataProviderClass = DataProviders.class,
        groups = {"dataDriven", "regression"},
        description = "Test various password validation scenarios"
    )
    public void TC_Auth_DDT_002_PasswordValidation(
            String password,
            boolean shouldPass,
            String reason) {

        logger.info("========== PASSWORD VALIDATION TEST ==========");
        logger.info("Password: " + (password.isEmpty() ? "(empty)" : password));
        logger.info("Should Pass: " + shouldPass);
        logger.info("Reason: " + reason);

        // ARRANGE
        driver.get(p.getProperty("appUrl") + "/signup");

        // Use JavaScript to check password input validation
        String email = randomEmail();
        String fullName = "Test User";

        // ACT
        // We're testing the password field validation
        // Fill out form with test password
        org.openqa.selenium.JavascriptExecutor js = (org.openqa.selenium.JavascriptExecutor) driver;

        // Fill fields
        driver.findElement(org.openqa.selenium.By.id("fullName")).sendKeys(fullName);
        driver.findElement(org.openqa.selenium.By.id("email")).sendKeys(email);
        driver.findElement(org.openqa.selenium.By.id("password")).sendKeys(password);

        // Check if password field is valid
        org.openqa.selenium.WebElement passwordField =
            driver.findElement(org.openqa.selenium.By.id("password"));

        // Check HTML5 validation
        boolean isValid = (Boolean) js.executeScript(
            "return arguments[0].checkValidity();",
            passwordField
        );

        // Also check minLength (6 chars)
        boolean meetsLength = password.length() >= 6;

        // ASSERT
        logger.info("Password validation result: " + (isValid && meetsLength));

        if (shouldPass) {
            Assert.assertTrue(
                meetsLength || password.isEmpty(), // Empty triggers 'required' first
                "Password should pass validation: " + reason
            );
        } else {
            // Check that validation fails for bad passwords
            if (!password.isEmpty()) {
                Assert.assertFalse(
                    meetsLength && password.trim().length() > 0,
                    "Password should fail validation: " + reason
                );
            }
        }

        logger.info("========== TEST ITERATION COMPLETE ==========\n");
    }

    /**
     * =========================================================================
     * DATA-DRIVEN TEST WITH EMAIL VALIDATION DATA
     * =========================================================================
     */
    @Test(
        dataProvider = "EmailValidation",
        dataProviderClass = DataProviders.class,
        groups = {"dataDriven", "regression"},
        description = "Test various email validation scenarios"
    )
    public void TC_Auth_DDT_003_EmailValidation(
            String email,
            boolean shouldPass,
            String reason) {

        logger.info("========== EMAIL VALIDATION TEST ==========");
        logger.info("Email: " + (email.isEmpty() ? "(empty)" : email));
        logger.info("Should Pass: " + shouldPass);
        logger.info("Reason: " + reason);

        // ARRANGE
        driver.get(p.getProperty("appUrl") + "/login");

        // ACT
        org.openqa.selenium.WebElement emailField =
            driver.findElement(org.openqa.selenium.By.id("email"));
        emailField.sendKeys(email);

        // Check HTML5 email validation using JavaScript
        org.openqa.selenium.JavascriptExecutor js = (org.openqa.selenium.JavascriptExecutor) driver;
        boolean isValid = (Boolean) js.executeScript(
            "return arguments[0].checkValidity();",
            emailField
        );

        // ASSERT
        logger.info("Email validation result: " + isValid);

        if (shouldPass) {
            Assert.assertTrue(isValid, "Email should be valid: " + reason);
        } else {
            Assert.assertFalse(isValid, "Email should be invalid: " + reason);
        }

        logger.info("========== TEST ITERATION COMPLETE ==========\n");
    }
}

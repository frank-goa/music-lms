package pageObjects;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

/**
 * =============================================================================
 * LOGIN PAGE - PAGE OBJECT FOR /login
 * =============================================================================
 *
 * This class represents the Login page of MusicLMS application.
 * It contains:
 * - Locators for all elements on the login page
 * - Methods to interact with those elements
 * - Methods to perform complete login actions
 *
 * PAGE STRUCTURE (Login Form):
 * ----------------------------
 * +--------------------------------------------------+
 * |                    MusicLMS                       |
 * |                  Welcome back                     |
 * |           Log in to your account                  |
 * |                                                   |
 * |        [ Continue with Google ]                   |
 * |                                                   |
 * |           ---- Or continue with email ----        |
 * |                                                   |
 * |   Email:    [________________________]            |
 * |   Password: [________________________]            |
 * |                                                   |
 * |              [ Log in ]                           |
 * |                                                   |
 * |       Send me a magic link instead                |
 * |                                                   |
 * |    Don't have an account? Sign up                 |
 * +--------------------------------------------------+
 *
 * =============================================================================
 */
public class LoginPage extends BasePage {

    // =========================================================================
    // WEB ELEMENTS - Using @FindBy Annotation
    // =========================================================================
    /**
     * @FindBy ANNOTATION:
     * -------------------
     * This is Selenium's way to declare element locators.
     * It works with PageFactory.initElements() in the constructor.
     *
     * LOCATOR STRATEGIES:
     * - @FindBy(id = "email")           -> Find by HTML id attribute
     * - @FindBy(name = "email")         -> Find by HTML name attribute
     * - @FindBy(css = ".class")         -> Find by CSS selector
     * - @FindBy(xpath = "//div")        -> Find by XPath expression
     * - @FindBy(linkText = "Click me")  -> Find by exact link text
     * - @FindBy(partialLinkText = "Cli")-> Find by partial link text
     *
     * CHOOSING THE RIGHT LOCATOR (Priority Order):
     * 1. ID - Most reliable, unique (if available)
     * 2. Name - Often unique within forms
     * 3. CSS - Fast and readable
     * 4. XPath - Most flexible but slower
     *
     * For MusicLMS, we use the 'id' and 'for' attributes from the HTML.
     */

    /**
     * Email Input Field
     *
     * HTML: <input id="email" type="email" ...>
     * Located by: id="email"
     */
    @FindBy(id = "email")
    private WebElement emailInput;

    /**
     * Password Input Field
     *
     * HTML: <input id="password" type="password" ...>
     */
    @FindBy(id = "password")
    private WebElement passwordInput;

    /**
     * Login Submit Button
     *
     * We use XPath here because there's no id.
     * //button[contains(text(),'Log in')] finds a button containing "Log in" text
     */
    @FindBy(xpath = "//button[contains(text(),'Log in')]")
    private WebElement loginButton;

    /**
     * Continue with Google Button
     *
     * XPath finds button with "Continue with Google" text
     */
    @FindBy(xpath = "//button[contains(text(),'Continue with Google')]")
    private WebElement googleLoginButton;

    /**
     * Magic Link Button
     *
     * For passwordless login via email link
     */
    @FindBy(xpath = "//button[contains(text(),'magic link')]")
    private WebElement magicLinkButton;

    /**
     * Sign Up Link
     *
     * Link to registration page for new users
     */
    @FindBy(xpath = "//a[contains(text(),'Sign up')]")
    private WebElement signUpLink;

    /**
     * Error Message Display
     *
     * Shows when login fails (e.g., wrong password)
     * Using CSS selector for class name
     */
    @FindBy(css = ".text-destructive")
    private WebElement errorMessage;

    /**
     * Page Title/Header
     *
     * "Welcome back" text on the login page
     */
    @FindBy(xpath = "//h2[contains(text(),'Welcome back')]")
    private WebElement pageTitle;

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================
    /**
     * Constructor - Initialize the page with WebDriver
     *
     * The 'super(driver)' call:
     * - Calls the parent class (BasePage) constructor
     * - Passes the driver to BasePage
     * - PageFactory.initElements() is called there
     *
     * @param driver WebDriver instance from the test
     */
    public LoginPage(WebDriver driver) {
        super(driver);
    }

    // =========================================================================
    // ACTION METHODS - Interact with page elements
    // =========================================================================
    /**
     * METHOD DESIGN PRINCIPLES:
     * -------------------------
     * 1. Each method should do ONE thing well (Single Responsibility)
     * 2. Method names should describe the action (enterEmail, clickLogin)
     * 3. Use protected helper methods from BasePage for common operations
     * 4. Return this (LoginPage) for method chaining when appropriate
     */

    /**
     * Enter email address in the email field
     *
     * safeType() from BasePage:
     * - Waits for element to be visible
     * - Clears any existing text
     * - Types the new text
     *
     * @param email The email address to enter
     * @return this LoginPage for method chaining
     */
    public LoginPage enterEmail(String email) {
        safeType(emailInput, email);
        return this;  // Method chaining: page.enterEmail("x").enterPassword("y")
    }

    /**
     * Enter password in the password field
     *
     * @param password The password to enter
     * @return this LoginPage for method chaining
     */
    public LoginPage enterPassword(String password) {
        safeType(passwordInput, password);
        return this;
    }

    /**
     * Click the Login button
     *
     * safeClick() from BasePage:
     * - Waits for element to be clickable
     * - Then performs the click
     */
    public void clickLoginButton() {
        safeClick(loginButton);
    }

    /**
     * Click Continue with Google button
     *
     * Note: This will redirect to Google's OAuth page.
     * Full testing of OAuth requires mock or real Google account.
     */
    public void clickGoogleLogin() {
        safeClick(googleLoginButton);
    }

    /**
     * Click the Magic Link button
     *
     * Sends a login link to the entered email address.
     * Email must be entered first!
     */
    public void clickMagicLink() {
        safeClick(magicLinkButton);
    }

    /**
     * Click Sign Up link to navigate to registration page
     */
    public void clickSignUpLink() {
        safeClick(signUpLink);
    }

    // =========================================================================
    // COMPOUND ACTION METHODS - Perform complete workflows
    // =========================================================================
    /**
     * COMPOUND METHODS:
     * -----------------
     * These methods combine multiple actions into a single call.
     * They represent complete user workflows.
     *
     * Benefits:
     * - Tests become more readable
     * - Reduces code duplication
     * - Easier to maintain
     */

    /**
     * Perform complete login with email and password
     *
     * This is a COMPOUND METHOD that chains multiple actions.
     * Tests can simply call: loginPage.login(email, password);
     *
     * @param email User's email address
     * @param password User's password
     */
    public void login(String email, String password) {
        enterEmail(email);
        enterPassword(password);
        clickLoginButton();
    }

    /**
     * Login and wait for dashboard
     *
     * Returns true if login was successful (redirected to dashboard)
     *
     * @param email User's email
     * @param password User's password
     * @return true if login successful
     */
    public boolean loginAndVerify(String email, String password) {
        login(email, password);
        return waitForUrlContains("/dashboard");
    }

    // =========================================================================
    // VERIFICATION METHODS - Check page state
    // =========================================================================
    /**
     * VERIFICATION METHODS:
     * ---------------------
     * These methods check the current state of the page.
     * They return boolean values for use in assertions.
     *
     * Example in test:
     *     Assert.assertTrue(loginPage.isErrorMessageDisplayed());
     */

    /**
     * Check if the login page is displayed
     *
     * Verifies by checking if the "Welcome back" title is visible.
     *
     * @return true if on login page
     */
    public boolean isPageDisplayed() {
        return isElementDisplayed(pageTitle);
    }

    /**
     * Check if error message is displayed
     *
     * Error appears after failed login attempt.
     *
     * @return true if error message is visible
     */
    public boolean isErrorMessageDisplayed() {
        try {
            waitForVisibility(errorMessage);
            return errorMessage.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get the error message text
     *
     * @return The error message text, or empty string if not found
     */
    public String getErrorMessageText() {
        try {
            waitForVisibility(errorMessage);
            return errorMessage.getText();
        } catch (Exception e) {
            return "";
        }
    }

    /**
     * Check if email field is empty
     *
     * getAttribute("value") gets the current text in the input field.
     *
     * @return true if email field is empty
     */
    public boolean isEmailFieldEmpty() {
        return emailInput.getAttribute("value").isEmpty();
    }

    /**
     * Check if login button is enabled
     *
     * @return true if button can be clicked
     */
    public boolean isLoginButtonEnabled() {
        return loginButton.isEnabled();
    }
}

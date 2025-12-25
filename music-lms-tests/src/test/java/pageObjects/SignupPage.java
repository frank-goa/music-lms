package pageObjects;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

/**
 * =============================================================================
 * SIGNUP PAGE - PAGE OBJECT FOR /signup
 * =============================================================================
 *
 * This class represents the Sign Up (Registration) page for TEACHERS.
 * Note: Students register via invite links (see InvitePage).
 *
 * PAGE STRUCTURE (Signup Form):
 * ----------------------------
 * +--------------------------------------------------+
 * |                    MusicLMS                       |
 * |              Create your account                  |
 * |        Start managing your music studio           |
 * |                                                   |
 * |        [ Continue with Google ]                   |
 * |                                                   |
 * |           ---- Or continue with email ----        |
 * |                                                   |
 * |   Full Name: [________________________]           |
 * |   Email:     [________________________]           |
 * |   Password:  [________________________]           |
 * |              (min 6 characters)                   |
 * |                                                   |
 * |              [ Create Account ]                   |
 * |                                                   |
 * |   By signing up, you agree to our Terms...       |
 * |                                                   |
 * |    Already have an account? Log in               |
 * +--------------------------------------------------+
 *
 * BUSINESS LOGIC:
 * ---------------
 * - Teachers sign up directly through this page
 * - Default role is "teacher"
 * - Email confirmation is required after signup
 * - Password must be at least 6 characters
 *
 * =============================================================================
 */
public class SignupPage extends BasePage {

    // =========================================================================
    // WEB ELEMENTS
    // =========================================================================

    /**
     * Full Name Input Field
     *
     * HTML: <input id="fullName" type="text" ...>
     */
    @FindBy(id = "fullName")
    private WebElement fullNameInput;

    /**
     * Email Input Field
     */
    @FindBy(id = "email")
    private WebElement emailInput;

    /**
     * Password Input Field
     *
     * Note: minLength={6} is enforced in HTML
     */
    @FindBy(id = "password")
    private WebElement passwordInput;

    /**
     * Create Account Button
     */
    @FindBy(xpath = "//button[contains(text(),'Create Account')]")
    private WebElement createAccountButton;

    /**
     * Continue with Google Button
     */
    @FindBy(xpath = "//button[contains(text(),'Continue with Google')]")
    private WebElement googleSignupButton;

    /**
     * Log In Link (for existing users)
     */
    @FindBy(xpath = "//a[contains(text(),'Log in')]")
    private WebElement loginLink;

    /**
     * Page Title
     */
    @FindBy(xpath = "//h2[contains(text(),'Create your account')]")
    private WebElement pageTitle;

    /**
     * Terms and Privacy Text
     */
    @FindBy(xpath = "//p[contains(text(),'Terms of Service')]")
    private WebElement termsText;

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    /**
     * Initialize SignupPage with WebDriver
     *
     * @param driver WebDriver instance
     */
    public SignupPage(WebDriver driver) {
        super(driver);
    }

    // =========================================================================
    // ACTION METHODS
    // =========================================================================

    /**
     * Enter full name
     *
     * @param fullName The user's full name
     * @return this page for method chaining
     */
    public SignupPage enterFullName(String fullName) {
        safeType(fullNameInput, fullName);
        return this;
    }

    /**
     * Enter email address
     *
     * @param email The user's email
     * @return this page for method chaining
     */
    public SignupPage enterEmail(String email) {
        safeType(emailInput, email);
        return this;
    }

    /**
     * Enter password
     *
     * @param password The user's password (min 6 chars)
     * @return this page for method chaining
     */
    public SignupPage enterPassword(String password) {
        safeType(passwordInput, password);
        return this;
    }

    /**
     * Click Create Account button
     */
    public void clickCreateAccount() {
        safeClick(createAccountButton);
    }

    /**
     * Click Continue with Google button
     */
    public void clickGoogleSignup() {
        safeClick(googleSignupButton);
    }

    /**
     * Click Login link
     */
    public void clickLoginLink() {
        safeClick(loginLink);
    }

    // =========================================================================
    // COMPOUND ACTION METHODS
    // =========================================================================

    /**
     * Complete registration with all required fields
     *
     * METHOD CHAINING EXAMPLE:
     * ------------------------
     * This method internally uses method chaining:
     * enterFullName(name).enterEmail(email).enterPassword(password)
     *
     * Each method returns 'this', allowing the next call.
     *
     * @param fullName User's full name
     * @param email User's email address
     * @param password User's password
     */
    public void signup(String fullName, String email, String password) {
        enterFullName(fullName)
            .enterEmail(email)
            .enterPassword(password);
        clickCreateAccount();
    }

    /**
     * Signup with a randomly generated email
     *
     * Useful for creating unique test users without conflicts.
     *
     * @param fullName User's full name
     * @param password User's password
     * @return The generated email address (for later use)
     */
    public String signupWithRandomEmail(String fullName, String password) {
        // We'll need to generate random email in the test using BaseClass helper
        // This is just a placeholder to show the pattern
        String randomEmail = "teacher_" + System.currentTimeMillis() + "@test.com";
        signup(fullName, randomEmail, password);
        return randomEmail;
    }

    // =========================================================================
    // VERIFICATION METHODS
    // =========================================================================

    /**
     * Check if signup page is displayed
     *
     * @return true if on signup page
     */
    public boolean isPageDisplayed() {
        return isElementDisplayed(pageTitle);
    }

    /**
     * Check if Create Account button is enabled
     *
     * Button might be disabled while form is being submitted.
     *
     * @return true if button is enabled
     */
    public boolean isCreateAccountButtonEnabled() {
        return createAccountButton.isEnabled();
    }

    /**
     * Check if Terms text is displayed
     *
     * @return true if terms text is visible
     */
    public boolean isTermsTextDisplayed() {
        return isElementDisplayed(termsText);
    }

    /**
     * Get the current value in the email field
     *
     * @return Current email field value
     */
    public String getEmailValue() {
        return emailInput.getAttribute("value");
    }

    /**
     * Get the current value in the full name field
     *
     * @return Current full name field value
     */
    public String getFullNameValue() {
        return fullNameInput.getAttribute("value");
    }

    /**
     * Check if required field validation is triggered
     *
     * HTML5 'required' attribute prevents submission of empty fields.
     * We check if the validation message is shown.
     *
     * @return true if validation error is shown
     */
    public boolean hasValidationError() {
        try {
            // Check HTML5 validation state
            return (Boolean) ((org.openqa.selenium.JavascriptExecutor) driver)
                .executeScript("return !arguments[0].checkValidity();", emailInput);
        } catch (Exception e) {
            return false;
        }
    }
}

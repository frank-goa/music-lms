package pageObjects;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;

/**
 * =============================================================================
 * INVITE PAGE - PAGE OBJECT FOR /invite/[token]
 * =============================================================================
 *
 * This class represents the Student Invite page where students accept
 * invitations from teachers and create their accounts.
 *
 * PAGE FLOW:
 * ----------
 * 1. Teacher generates an invite link from their dashboard
 * 2. Teacher shares the link with the student
 * 3. Student clicks the link and lands on this page
 * 4. Student fills out their information
 * 5. Student creates account and is linked to the teacher
 *
 * PAGE STATES:
 * ------------
 * 1. Loading State:
 *    - Shows spinner while validating token
 *
 * 2. Already Logged In State:
 *    - Shows "Already Logged In" message
 *    - Offers "Log Out & Accept Invite" or "Go to Dashboard"
 *
 * 3. Invalid/Expired Token State:
 *    - Shows "Invalid Invite" message
 *    - Link to homepage
 *
 * 4. Valid Token State (Main Form):
 *    +--------------------------------------------------+
 *    |                    MusicLMS                       |
 *    |                Join as a Student                  |
 *    |    [Teacher Name] has invited you to join        |
 *    |                                                   |
 *    |   Full Name:        [________________________]   |
 *    |   Email:            [________________________]   |
 *    |   Password:         [________________________]   |
 *    |   Primary Instrument: [  Select instrument  v]   |
 *    |   Skill Level:        [  Select level      v]   |
 *    |                                                   |
 *    |            [ Create Student Account ]             |
 *    |                                                   |
 *    |    Already have an account? Log in               |
 *    +--------------------------------------------------+
 *
 * =============================================================================
 */
public class InvitePage extends BasePage {

    // =========================================================================
    // WEB ELEMENTS - Valid Invite Form
    // =========================================================================

    @FindBy(id = "fullName")
    private WebElement fullNameInput;

    @FindBy(id = "email")
    private WebElement emailInput;

    @FindBy(id = "password")
    private WebElement passwordInput;

    /**
     * Instrument Dropdown
     *
     * This is a custom Select component, not a native HTML select.
     * We need to click the trigger first, then select the option.
     */
    @FindBy(xpath = "//button[contains(@class, 'SelectTrigger')]//span[contains(text(),'instrument')]/..")
    private WebElement instrumentDropdown;

    /**
     * Skill Level Dropdown
     */
    @FindBy(xpath = "//button[contains(@class, 'SelectTrigger')]//span[contains(text(),'level')]/..")
    private WebElement skillLevelDropdown;

    @FindBy(xpath = "//button[contains(text(),'Create Student Account')]")
    private WebElement createStudentAccountButton;

    @FindBy(xpath = "//a[contains(text(),'Log in')]")
    private WebElement loginLink;

    // =========================================================================
    // WEB ELEMENTS - Invalid/Expired Token State
    // =========================================================================

    @FindBy(xpath = "//h2[contains(text(),'Invalid Invite')]")
    private WebElement invalidInviteTitle;

    @FindBy(xpath = "//p[contains(text(),'invalid or has expired')]")
    private WebElement invalidInviteMessage;

    @FindBy(xpath = "//a[contains(text(),'Go to Homepage')]")
    private WebElement homepageLink;

    // =========================================================================
    // WEB ELEMENTS - Already Logged In State
    // =========================================================================

    @FindBy(xpath = "//h2[contains(text(),'Already Logged In')]")
    private WebElement alreadyLoggedInTitle;

    @FindBy(xpath = "//button[contains(text(),'Log Out & Accept Invite')]")
    private WebElement logoutAndAcceptButton;

    @FindBy(xpath = "//a[contains(text(),'Go to Dashboard')]")
    private WebElement goToDashboardLink;

    // =========================================================================
    // WEB ELEMENTS - Valid Token State
    // =========================================================================

    @FindBy(xpath = "//h2[contains(text(),'Join as a Student')]")
    private WebElement joinAsStudentTitle;

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    public InvitePage(WebDriver driver) {
        super(driver);
    }

    // =========================================================================
    // ACTION METHODS - Form Filling
    // =========================================================================

    /**
     * Enter student's full name
     *
     * @param fullName The student's name
     * @return this page for chaining
     */
    public InvitePage enterFullName(String fullName) {
        safeType(fullNameInput, fullName);
        return this;
    }

    /**
     * Enter student's email
     *
     * Note: If teacher specified an email in the invite, this field is disabled.
     *
     * @param email The student's email
     * @return this page for chaining
     */
    public InvitePage enterEmail(String email) {
        if (emailInput.isEnabled()) {
            safeType(emailInput, email);
        }
        return this;
    }

    /**
     * Enter password
     *
     * @param password The password (min 6 chars)
     * @return this page for chaining
     */
    public InvitePage enterPassword(String password) {
        safeType(passwordInput, password);
        return this;
    }

    /**
     * Select primary instrument from dropdown
     *
     * HANDLING CUSTOM DROPDOWNS:
     * --------------------------
     * The MusicLMS app uses Radix UI Select component, not native HTML <select>.
     * For custom dropdowns, we need to:
     * 1. Click the trigger to open the dropdown
     * 2. Wait for options to appear
     * 3. Click the desired option
     *
     * @param instrument The instrument to select (e.g., "Piano", "Guitar")
     * @return this page for chaining
     */
    public InvitePage selectInstrument(String instrument) {
        // Click to open dropdown
        safeClick(instrumentDropdown);

        // Wait for options and click the matching one
        // XPath finds the option with matching text
        WebElement option = driver.findElement(
            org.openqa.selenium.By.xpath("//div[@role='option'][contains(text(),'" + instrument + "')]")
        );
        wait.until(ExpectedConditions.elementToBeClickable(option)).click();

        return this;
    }

    /**
     * Select skill level from dropdown
     *
     * @param level The skill level ("Beginner", "Intermediate", "Advanced")
     * @return this page for chaining
     */
    public InvitePage selectSkillLevel(String level) {
        safeClick(skillLevelDropdown);

        WebElement option = driver.findElement(
            org.openqa.selenium.By.xpath("//div[@role='option'][contains(text(),'" + level + "')]")
        );
        wait.until(ExpectedConditions.elementToBeClickable(option)).click();

        return this;
    }

    /**
     * Click Create Student Account button
     */
    public void clickCreateStudentAccount() {
        safeClick(createStudentAccountButton);
    }

    /**
     * Click Log Out & Accept Invite button (when already logged in)
     */
    public void clickLogoutAndAccept() {
        safeClick(logoutAndAcceptButton);
    }

    /**
     * Click Go to Dashboard link (when already logged in)
     */
    public void clickGoToDashboard() {
        safeClick(goToDashboardLink);
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
     * Complete student registration via invite
     *
     * @param fullName Student's full name
     * @param email Student's email
     * @param password Password (min 6 chars)
     * @param instrument Primary instrument
     * @param skillLevel Skill level
     */
    public void registerAsStudent(String fullName, String email, String password,
                                  String instrument, String skillLevel) {
        enterFullName(fullName)
            .enterEmail(email)
            .enterPassword(password)
            .selectInstrument(instrument)
            .selectSkillLevel(skillLevel);
        clickCreateStudentAccount();
    }

    // =========================================================================
    // VERIFICATION METHODS
    // =========================================================================

    /**
     * Check if the valid invite form is displayed
     *
     * @return true if "Join as a Student" form is visible
     */
    public boolean isValidInviteFormDisplayed() {
        return isElementDisplayed(joinAsStudentTitle);
    }

    /**
     * Check if invalid/expired invite message is displayed
     *
     * @return true if invite is invalid/expired
     */
    public boolean isInvalidInviteDisplayed() {
        return isElementDisplayed(invalidInviteTitle);
    }

    /**
     * Check if "Already Logged In" state is displayed
     *
     * @return true if user is already logged in
     */
    public boolean isAlreadyLoggedInDisplayed() {
        return isElementDisplayed(alreadyLoggedInTitle);
    }

    /**
     * Check if email field is disabled (pre-filled by invite)
     *
     * @return true if email field is disabled
     */
    public boolean isEmailFieldDisabled() {
        return !emailInput.isEnabled();
    }

    /**
     * Get the pre-filled email value
     *
     * @return The email value (may be from invite)
     */
    public String getEmailValue() {
        return emailInput.getAttribute("value");
    }

    /**
     * Check if Create Student Account button is enabled
     *
     * @return true if button is clickable
     */
    public boolean isCreateAccountButtonEnabled() {
        return createStudentAccountButton.isEnabled();
    }

    /**
     * Wait for page to load (loading state to complete)
     *
     * The page shows a spinner while validating the token.
     * We wait for either the form or error message to appear.
     *
     * @return true if page loaded successfully
     */
    public boolean waitForPageToLoad() {
        try {
            // Wait for either valid form or invalid message
            wait.until(driver ->
                isValidInviteFormDisplayed() ||
                isInvalidInviteDisplayed() ||
                isAlreadyLoggedInDisplayed()
            );
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}

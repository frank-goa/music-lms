package pageObjects;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

/**
 * =============================================================================
 * DASHBOARD PAGE - PAGE OBJECT FOR /dashboard
 * =============================================================================
 *
 * This class represents the Dashboard page that users see after logging in.
 * It's used primarily to VERIFY successful authentication.
 *
 * The dashboard differs based on user role:
 * - Teacher Dashboard: Student management, assignments, schedule
 * - Student Dashboard: Practice logs, assignments, progress
 *
 * For authentication testing, we mainly need to verify:
 * 1. User successfully reached the dashboard (URL check)
 * 2. User's name/info is displayed correctly
 * 3. Logout functionality works
 *
 * =============================================================================
 */
public class DashboardPage extends BasePage {

    // =========================================================================
    // WEB ELEMENTS - Common Elements
    // =========================================================================

    /**
     * MusicLMS Logo/Brand in the header
     */
    @FindBy(xpath = "//span[contains(text(),'MusicLMS')]")
    private WebElement brandLogo;

    /**
     * User profile/avatar area (usually contains username or avatar)
     */
    @FindBy(css = "[data-testid='user-nav']")
    private WebElement userNav;

    /**
     * Logout button (might be in a dropdown menu)
     */
    @FindBy(xpath = "//button[contains(text(),'Log out')]")
    private WebElement logoutButton;

    /**
     * Dashboard heading/title
     */
    @FindBy(xpath = "//h1[contains(text(),'Dashboard')]")
    private WebElement dashboardTitle;

    // =========================================================================
    // WEB ELEMENTS - Navigation Sidebar
    // =========================================================================

    @FindBy(xpath = "//a[contains(@href, '/dashboard') and contains(text(), 'Dashboard')]")
    private WebElement dashboardNavLink;

    @FindBy(xpath = "//a[contains(@href, '/students')]")
    private WebElement studentsNavLink;

    @FindBy(xpath = "//a[contains(@href, '/assignments')]")
    private WebElement assignmentsNavLink;

    @FindBy(xpath = "//a[contains(@href, '/schedule')]")
    private WebElement scheduleNavLink;

    @FindBy(xpath = "//a[contains(@href, '/messages')]")
    private WebElement messagesNavLink;

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    public DashboardPage(WebDriver driver) {
        super(driver);
    }

    // =========================================================================
    // NAVIGATION METHODS
    // =========================================================================

    /**
     * Click on Students link in navigation
     */
    public void navigateToStudents() {
        safeClick(studentsNavLink);
    }

    /**
     * Click on Assignments link in navigation
     */
    public void navigateToAssignments() {
        safeClick(assignmentsNavLink);
    }

    /**
     * Click on Schedule link in navigation
     */
    public void navigateToSchedule() {
        safeClick(scheduleNavLink);
    }

    /**
     * Click on Messages link in navigation
     */
    public void navigateToMessages() {
        safeClick(messagesNavLink);
    }

    // =========================================================================
    // ACTION METHODS
    // =========================================================================

    /**
     * Open user navigation dropdown
     */
    public void openUserNav() {
        safeClick(userNav);
    }

    /**
     * Perform logout
     *
     * Clicks on user nav to open dropdown, then clicks logout.
     */
    public void logout() {
        openUserNav();
        safeClick(logoutButton);
    }

    /**
     * Logout and verify redirect to login page
     *
     * @return true if successfully logged out and redirected
     */
    public boolean logoutAndVerify() {
        logout();
        return waitForUrlContains("/login");
    }

    // =========================================================================
    // VERIFICATION METHODS
    // =========================================================================

    /**
     * Check if dashboard page is displayed
     *
     * Uses URL check as primary verification.
     *
     * @return true if on dashboard
     */
    public boolean isPageDisplayed() {
        return getCurrentUrl().contains("/dashboard");
    }

    /**
     * Check if the brand logo is visible
     *
     * @return true if logo is displayed
     */
    public boolean isBrandLogoDisplayed() {
        return isElementDisplayed(brandLogo);
    }

    /**
     * Check if user navigation area is visible
     *
     * This confirms a user is logged in.
     *
     * @return true if user nav is displayed
     */
    public boolean isUserNavDisplayed() {
        try {
            return waitForVisibility(userNav).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Wait for dashboard to fully load
     *
     * Waits for key elements to appear.
     *
     * @return true if dashboard loaded successfully
     */
    public boolean waitForDashboardLoad() {
        try {
            waitForUrlContains("/dashboard");
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get the current page title
     *
     * @return Browser tab title
     */
    public String getTitle() {
        return driver.getTitle();
    }
}

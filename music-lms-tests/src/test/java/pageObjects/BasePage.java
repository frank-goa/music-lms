package pageObjects;

import java.time.Duration;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * =============================================================================
 * BASE PAGE - PARENT CLASS FOR ALL PAGE OBJECTS
 * =============================================================================
 *
 * WHAT IS PAGE OBJECT MODEL (POM)?
 * ---------------------------------
 * Page Object Model is a DESIGN PATTERN where each web page in your application
 * is represented by a separate Java class. This class contains:
 * - Web elements on that page (locators)
 * - Methods to interact with those elements (actions)
 *
 * REAL-WORLD ANALOGY:
 * -------------------
 * Think of it like a TV remote control:
 * - The remote (Page Object) represents the TV (Web Page)
 * - Buttons on remote (Web Elements) represent features on TV
 * - Pressing a button (Method) performs an action on TV
 *
 * You don't need to know HOW the TV works internally;
 * you just use the remote's buttons!
 *
 * WHY USE POM?
 * ------------
 * 1. MAINTAINABILITY: If a locator changes, update ONE file
 * 2. REUSABILITY: Same page methods used in multiple tests
 * 3. READABILITY: Tests read like English: loginPage.enterEmail("test@email.com")
 * 4. ABSTRACTION: Hide complex Selenium code behind simple methods
 *
 * INHERITANCE STRUCTURE:
 * ----------------------
 *
 *     BasePage (Abstract concept of any page)
 *         |
 *         +---- LoginPage extends BasePage
 *         +---- SignupPage extends BasePage
 *         +---- DashboardPage extends BasePage
 *
 * =============================================================================
 */
public class BasePage {

    /**
     * WebDriver instance - shared by all page objects
     *
     * 'protected' means:
     * - Accessible in this class: YES
     * - Accessible in child classes: YES
     * - Accessible from outside: NO
     *
     * This allows child classes (LoginPage, etc.) to use the driver
     * while hiding it from external code.
     */
    protected WebDriver driver;

    /**
     * WebDriverWait for explicit waits
     *
     * IMPLICIT vs EXPLICIT WAITS:
     * ---------------------------
     * Implicit Wait: Global timeout for finding ANY element
     *     driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
     *
     * Explicit Wait: Wait for SPECIFIC conditions on SPECIFIC elements
     *     wait.until(ExpectedConditions.visibilityOf(element));
     *
     * Explicit waits are more precise and should be preferred!
     */
    protected WebDriverWait wait;

    /**
     * =========================================================================
     * CONSTRUCTOR
     * =========================================================================
     *
     * WHAT IS A CONSTRUCTOR?
     * ----------------------
     * A constructor is a special method that runs when you create an object.
     * It has the SAME NAME as the class and NO return type.
     *
     * When you write: LoginPage loginPage = new LoginPage(driver);
     * 1. Java allocates memory for the new object
     * 2. The constructor runs to initialize the object
     * 3. The reference is stored in 'loginPage' variable
     *
     * PAGE FACTORY:
     * -------------
     * PageFactory.initElements() is Selenium's way to initialize @FindBy elements.
     *
     * Without PageFactory:
     *     driver.findElement(By.id("email")) - called EVERY time
     *
     * With PageFactory:
     *     Elements are found once and cached (optional)
     *     You can use @FindBy annotation for cleaner code
     *
     * @param driver The WebDriver instance to use for this page
     */
    public BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));

        // Initialize elements annotated with @FindBy
        // 'this' refers to the current object (could be LoginPage, SignupPage, etc.)
        PageFactory.initElements(driver, this);
    }

    // =========================================================================
    // COMMON HELPER METHODS - Available to all page objects
    // =========================================================================

    /**
     * Wait until an element is visible on the page
     *
     * WHAT IS VISIBILITY?
     * -------------------
     * An element is "visible" if:
     * - It exists in the DOM
     * - It has height and width > 0
     * - It's not hidden (display:none or visibility:hidden)
     *
     * This is useful because elements might exist in HTML but not be visible yet
     * (e.g., loading animations, dynamic content)
     *
     * @param element The WebElement to wait for
     * @return The same element once visible (for method chaining)
     */
    protected WebElement waitForVisibility(WebElement element) {
        return wait.until(ExpectedConditions.visibilityOf(element));
    }

    /**
     * Wait until an element is clickable
     *
     * WHAT IS CLICKABLE?
     * ------------------
     * An element is "clickable" if:
     * - It's visible
     * - It's enabled (not disabled)
     *
     * This prevents clicking on disabled buttons or hidden elements.
     *
     * @param element The WebElement to wait for
     * @return The same element once clickable
     */
    protected WebElement waitForClickable(WebElement element) {
        return wait.until(ExpectedConditions.elementToBeClickable(element));
    }

    /**
     * Safe click method - waits for element to be clickable, then clicks
     *
     * WHY A HELPER METHOD?
     * --------------------
     * Direct element.click() might fail if:
     * - Element not yet loaded
     * - Element covered by another element
     * - Element disabled
     *
     * This method waits for clickability first.
     *
     * @param element The element to click
     */
    protected void safeClick(WebElement element) {
        waitForClickable(element).click();
    }

    /**
     * Safe type method - clears field and enters text
     *
     * WHY CLEAR FIRST?
     * ----------------
     * Input fields might have default values or previous input.
     * Clearing ensures our new text is the only content.
     *
     * @param element The input element
     * @param text The text to enter
     */
    protected void safeType(WebElement element, String text) {
        WebElement visibleElement = waitForVisibility(element);
        visibleElement.clear();
        visibleElement.sendKeys(text);
    }

    /**
     * Get the current page title
     *
     * @return The browser tab title
     */
    public String getPageTitle() {
        return driver.getTitle();
    }

    /**
     * Get the current URL
     *
     * @return The current browser URL
     */
    public String getCurrentUrl() {
        return driver.getCurrentUrl();
    }

    /**
     * Check if an element is displayed
     *
     * TRY-CATCH PATTERN:
     * ------------------
     * If the element doesn't exist, isDisplayed() throws an exception.
     * We catch it and return false instead of crashing.
     *
     * @param element The element to check
     * @return true if visible, false otherwise
     */
    protected boolean isElementDisplayed(WebElement element) {
        try {
            return element.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Wait for URL to contain a specific text
     *
     * Useful for verifying navigation was successful.
     *
     * @param urlPart The text to expect in the URL
     * @return true if URL contains the text within timeout
     */
    protected boolean waitForUrlContains(String urlPart) {
        try {
            return wait.until(ExpectedConditions.urlContains(urlPart));
        } catch (Exception e) {
            return false;
        }
    }
}

package testBase;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.Date;
import java.util.Properties;

import org.apache.commons.lang3.RandomStringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Parameters;

import io.github.bonigarcia.wdm.WebDriverManager;

/**
 * =============================================================================
 * BASE CLASS - THE FOUNDATION OF OUR TEST FRAMEWORK
 * =============================================================================
 *
 * WHAT IS THIS CLASS?
 * -------------------
 * BaseClass is the parent class that ALL test classes extend (inherit from).
 * It contains common functionality that every test needs:
 * - Browser setup and teardown
 * - Configuration loading
 * - Logging
 * - Screenshot capture
 * - Random data generation
 *
 * WHY DO WE NEED IT?
 * ------------------
 * 1. CODE REUSE: Write browser setup once, use in all tests
 * 2. CONSISTENCY: All tests use the same configuration
 * 3. MAINTENANCE: Change browser settings in one place
 * 4. SEPARATION: Test logic stays in test classes, setup stays here
 *
 * INHERITANCE CONCEPT:
 * --------------------
 * In Java, a class can "extend" another class to inherit its properties and methods.
 *
 *     BaseClass (Parent)
 *         |
 *         +---- TC001_LoginTest extends BaseClass
 *         +---- TC002_SignupTest extends BaseClass
 *
 * This means TC001_LoginTest has access to:
 * - driver (WebDriver instance)
 * - logger (for logging)
 * - p (properties)
 * - All methods (setup, tearDown, captureScreen, etc.)
 *
 * =============================================================================
 */
public class BaseClass {

    /**
     * =========================================================================
     * CLASS VARIABLES (INSTANCE FIELDS)
     * =========================================================================
     *
     * These are the "shared data" that all test classes can access when they
     * extend BaseClass.
     *
     * ACCESS MODIFIERS:
     * - public: Accessible from anywhere (we use for driver so tests can use it)
     * - protected: Accessible from this class and subclasses
     * - private: Only accessible within this class
     */

    /**
     * WebDriver - The main interface to control the browser
     *
     * WebDriver is an INTERFACE (not a class). It defines methods like:
     * - get(url): Navigate to a URL
     * - findElement(): Find elements on the page
     * - quit(): Close the browser
     *
     * ChromeDriver, FirefoxDriver, EdgeDriver all IMPLEMENT this interface.
     * This allows us to write code that works with any browser!
     *
     * POLYMORPHISM IN ACTION:
     *     WebDriver driver = new ChromeDriver();  // Works!
     *     WebDriver driver = new FirefoxDriver(); // Also works!
     */
    public WebDriver driver;

    /**
     * Logger - For logging messages during test execution
     *
     * LogManager.getLogger() creates a logger associated with this class.
     * The class name appears in log messages, helping identify where logs come from.
     *
     * Log levels (from least to most severe):
     * - logger.trace("message");  // Very detailed debugging
     * - logger.debug("message");  // Debug information
     * - logger.info("message");   // General information
     * - logger.warn("message");   // Warning messages
     * - logger.error("message");  // Error messages
     * - logger.fatal("message");  // Critical errors
     */
    public Logger logger;

    /**
     * Properties - Configuration storage
     *
     * Properties is a Java class that reads key-value pairs from .properties files.
     * Example: config.properties contains "appUrl=http://localhost:3000"
     * We access it with: p.getProperty("appUrl")
     */
    public Properties p;

    /**
     * =========================================================================
     * SETUP METHOD (@BeforeClass)
     * =========================================================================
     *
     * @BeforeClass ANNOTATION:
     * ------------------------
     * This annotation tells TestNG: "Run this method ONCE before any test
     * method in this class executes."
     *
     * Lifecycle:
     *     1. @BeforeClass runs (setup browser)
     *     2. @Test methods run (actual tests)
     *     3. @AfterClass runs (cleanup)
     *
     * @Parameters ANNOTATION:
     * -----------------------
     * Allows passing values from testng.xml to this method.
     * In testng.xml:
     *     <parameter name="browser" value="chrome"/>
     * Here we receive it as the 'br' parameter.
     *
     * This enables running the SAME tests on DIFFERENT browsers without
     * changing any code!
     *
     * @param br Browser name passed from testng.xml (chrome, firefox, edge)
     * @throws IOException If config file cannot be read
     */
    @BeforeClass(groups = {"sanity", "regression", "master"})
    @Parameters({"browser"})
    public void setup(String br) throws IOException {

        // STEP 1: Initialize the logger
        // -----------------------------
        // This creates a logger that will prefix all messages with the class name
        logger = LogManager.getLogger(this.getClass());
        logger.info("========== Test Setup Started ==========");

        // STEP 2: Load configuration from properties file
        // ------------------------------------------------
        // FileInputStream reads the file as a stream of bytes
        // Properties.load() parses the key=value pairs
        FileInputStream file = new FileInputStream("./src/test/resources/config.properties");
        p = new Properties();
        p.load(file);
        logger.info("Configuration loaded from config.properties");

        // STEP 3: Select and initialize the appropriate browser
        // ------------------------------------------------------
        // This is a great example of CONDITIONAL LOGIC in Java
        // Based on the 'br' parameter, we create different browser drivers
        logger.info("Initializing browser: " + br);

        switch (br.toLowerCase()) {
            case "chrome":
                // WebDriverManager automatically downloads the correct chromedriver
                WebDriverManager.chromedriver().setup();

                // ChromeOptions allows customizing Chrome's behavior
                ChromeOptions chromeOptions = new ChromeOptions();

                // Check if we should run headless (no visible browser window)
                // Headless is faster and useful for CI/CD pipelines
                if (p.getProperty("headless", "false").equals("true")) {
                    chromeOptions.addArguments("--headless=new");
                    logger.info("Running Chrome in headless mode");
                }

                // Create the ChromeDriver with our options
                driver = new ChromeDriver(chromeOptions);
                break;

            case "firefox":
                WebDriverManager.firefoxdriver().setup();
                FirefoxOptions firefoxOptions = new FirefoxOptions();
                if (p.getProperty("headless", "false").equals("true")) {
                    firefoxOptions.addArguments("--headless");
                }
                driver = new FirefoxDriver(firefoxOptions);
                break;

            case "edge":
                WebDriverManager.edgedriver().setup();
                EdgeOptions edgeOptions = new EdgeOptions();
                if (p.getProperty("headless", "false").equals("true")) {
                    edgeOptions.addArguments("--headless");
                }
                driver = new EdgeDriver(edgeOptions);
                break;

            default:
                // If an unsupported browser is specified, log an error
                logger.error("Unsupported browser: " + br);
                throw new IllegalArgumentException("Browser not supported: " + br);
        }

        // STEP 4: Configure browser settings
        // -----------------------------------

        // Delete all cookies to ensure clean state
        driver.manage().deleteAllCookies();
        logger.debug("Cookies cleared");

        // Maximize the browser window
        driver.manage().window().maximize();
        logger.debug("Browser window maximized");

        // Set IMPLICIT WAIT
        // -----------------
        // This tells WebDriver to wait up to 10 seconds when trying to find elements
        // before throwing NoSuchElementException.
        //
        // WITHOUT implicit wait:
        //     If element not immediately present -> Exception!
        //
        // WITH implicit wait:
        //     WebDriver keeps trying for 10 seconds before giving up
        //
        // Duration.ofSeconds() is a modern Java way to specify time
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        logger.debug("Implicit wait set to 10 seconds");

        // STEP 5: Navigate to the application URL
        // ----------------------------------------
        String appUrl = p.getProperty("appUrl");
        driver.get(appUrl);
        logger.info("Navigated to: " + appUrl);
        logger.info("========== Test Setup Completed ==========");
    }

    /**
     * =========================================================================
     * TEARDOWN METHOD (@AfterClass)
     * =========================================================================
     *
     * @AfterClass ANNOTATION:
     * -----------------------
     * This method runs ONCE after all test methods in the class have finished.
     *
     * It's crucial for CLEANUP:
     * - Closes the browser
     * - Releases memory
     * - Ensures clean state for next test class
     *
     * driver.quit() vs driver.close():
     * - quit(): Closes ALL browser windows and ends the WebDriver session
     * - close(): Closes only the CURRENT window (session remains active)
     *
     * Always use quit() in @AfterClass to fully clean up!
     */
    @AfterClass(groups = {"sanity", "regression", "master"})
    public void tearDown() {
        logger.info("========== Test Teardown Started ==========");

        if (driver != null) {
            driver.quit();
            logger.info("Browser closed successfully");
        }

        logger.info("========== Test Teardown Completed ==========");
    }

    /**
     * =========================================================================
     * SCREENSHOT CAPTURE METHOD
     * =========================================================================
     *
     * This method captures a screenshot of the current browser state.
     * Screenshots are essential for debugging failed tests!
     *
     * HOW IT WORKS:
     * 1. Cast WebDriver to TakesScreenshot interface
     * 2. Use getScreenshotAs() to capture the screen as a file
     * 3. Save the file with a unique name (timestamp + test name)
     *
     * INTERFACE CASTING:
     * ------------------
     * WebDriver interface doesn't have screenshot capability.
     * TakesScreenshot interface provides getScreenshotAs() method.
     * ChromeDriver (and others) implement BOTH interfaces!
     *
     * So we can cast: (TakesScreenshot) driver
     *
     * @param testName Name of the test (used in filename)
     * @return Path to the saved screenshot file
     */
    public String captureScreen(String testName) {
        // Create timestamp for unique filename
        // SimpleDateFormat formats Date objects into readable strings
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());

        // Build the file path
        String fileName = testName + "_" + timeStamp + ".png";
        String filePath = "./screenshots/" + fileName;

        try {
            // CASTING: Convert driver to TakesScreenshot type
            // This is safe because Chrome/Firefox/Edge drivers implement TakesScreenshot
            TakesScreenshot ts = (TakesScreenshot) driver;

            // Capture screenshot as a File object
            // OutputType.FILE tells Selenium to save as a file (not bytes or base64)
            File source = ts.getScreenshotAs(OutputType.FILE);

            // Define destination and copy the file
            File destination = new File(filePath);

            // Copy source to destination using Java NIO (New I/O)
            java.nio.file.Files.copy(
                source.toPath(),
                destination.toPath(),
                java.nio.file.StandardCopyOption.REPLACE_EXISTING
            );

            logger.info("Screenshot saved: " + filePath);
        } catch (IOException e) {
            logger.error("Failed to save screenshot: " + e.getMessage());
        }

        return filePath;
    }

    /**
     * =========================================================================
     * RANDOM STRING GENERATOR
     * =========================================================================
     *
     * Generates random alphabetic strings for test data.
     *
     * WHY RANDOM DATA?
     * ----------------
     * 1. Avoid data conflicts (e.g., unique email addresses)
     * 2. Test with varied inputs
     * 3. Simulate real-world data variety
     *
     * RandomStringUtils is from Apache Commons Lang library.
     *
     * @return A random 5-character alphabetic string
     */
    public String randomString() {
        // randomAlphabetic(5) generates strings like "abXyZ", "qWeRt"
        return RandomStringUtils.randomAlphabetic(5);
    }

    /**
     * Generates random numeric string
     *
     * @return A random 5-digit numeric string
     */
    public String randomNumber() {
        // randomNumeric(5) generates strings like "12345", "98765"
        return RandomStringUtils.randomNumeric(5);
    }

    /**
     * Generates random alphanumeric string in format: ABC123
     *
     * @return A formatted random string
     */
    public String randomAlphaNumeric() {
        String alpha = RandomStringUtils.randomAlphabetic(3).toUpperCase();
        String numeric = RandomStringUtils.randomNumeric(3);
        return alpha + numeric;
    }

    /**
     * Generates a unique test email address
     *
     * @return Email like "test_ABC12@musiclms.test"
     */
    public String randomEmail() {
        return "test_" + randomAlphaNumeric() + "@musiclms.test";
    }
}

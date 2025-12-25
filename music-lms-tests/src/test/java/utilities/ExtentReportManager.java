package utilities;

import java.awt.Desktop;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;

import testBase.BaseClass;

/**
 * =============================================================================
 * EXTENT REPORT MANAGER
 * =============================================================================
 *
 * This class creates beautiful HTML test reports using Extent Reports library.
 * It implements ITestListener to hook into TestNG's test lifecycle.
 *
 * WHAT ARE TEST LISTENERS?
 * ------------------------
 * Listeners are classes that "listen" to test events and respond to them.
 * They're like observers that watch test execution and take actions.
 *
 * TEST LIFECYCLE EVENTS:
 *
 *     ┌─────────────────────────────────────────────────────┐
 *     │                TEST EXECUTION FLOW                   │
 *     │                                                      │
 *     │   onStart()            ← Suite starts               │
 *     │       │                                              │
 *     │   onTestStart()        ← Each test starts           │
 *     │       │                                              │
 *     │   Test executes...                                   │
 *     │       │                                              │
 *     │   ┌───┴───┐                                          │
 *     │   │       │                                          │
 *     │ onTestSuccess()  OR  onTestFailure()  OR  onSkipped │
 *     │   │       │                │                        │
 *     │   └───┬───┘                │                        │
 *     │       │                    │                        │
 *     │   onFinish()          ← Suite ends, report created  │
 *     └─────────────────────────────────────────────────────┘
 *
 * WHY EXTENT REPORTS?
 * -------------------
 * 1. Beautiful, interactive HTML reports
 * 2. Charts and statistics
 * 3. Screenshots on failure
 * 4. Step-by-step logging
 * 5. Category/tag filtering
 *
 * =============================================================================
 */
public class ExtentReportManager implements ITestListener {

    /**
     * ExtentReports - The main class that creates the report
     *
     * Think of it as the "report document" that we add tests to.
     */
    private ExtentReports extent;

    /**
     * ExtentTest - Represents a single test in the report
     *
     * Each test method gets its own ExtentTest instance.
     * We use ThreadLocal for parallel execution safety.
     *
     * WHAT IS ThreadLocal?
     * --------------------
     * When running tests in parallel (multiple tests at once),
     * each thread needs its own copy of the ExtentTest.
     * ThreadLocal ensures each thread has a separate instance.
     *
     * Without ThreadLocal: Test A and Test B might share the same ExtentTest
     * With ThreadLocal: Each test gets its own private ExtentTest
     */
    private ThreadLocal<ExtentTest> extentTest = new ThreadLocal<>();

    /**
     * Report file path
     */
    private String reportPath;

    /**
     * Called when test suite starts
     *
     * This is where we INITIALIZE the report:
     * 1. Create unique filename with timestamp
     * 2. Configure report appearance (theme, title)
     * 3. Add system/environment information
     *
     * @param context TestNG context containing suite information
     */
    @Override
    public void onStart(ITestContext context) {
        // Create timestamp for unique report name
        // Format: Report_2024-01-15_14-30-45.html
        String timestamp = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss").format(new Date());
        reportPath = "./reports/MusicLMS_Report_" + timestamp + ".html";

        // ExtentSparkReporter is the HTML report generator
        ExtentSparkReporter sparkReporter = new ExtentSparkReporter(reportPath);

        // Configure report appearance
        sparkReporter.config().setDocumentTitle("MusicLMS Test Report");
        sparkReporter.config().setReportName("Authentication Test Results");
        sparkReporter.config().setTheme(Theme.DARK);  // DARK or STANDARD

        // Create ExtentReports and attach the reporter
        extent = new ExtentReports();
        extent.attachReporter(sparkReporter);

        // Add system information to the report
        // This appears in the "System Info" section
        extent.setSystemInfo("Application", "MusicLMS");
        extent.setSystemInfo("Module", "Authentication");
        extent.setSystemInfo("Environment", "Test");
        extent.setSystemInfo("Browser", context.getCurrentXmlTest().getParameter("browser"));
        extent.setSystemInfo("OS", System.getProperty("os.name"));
        extent.setSystemInfo("Java Version", System.getProperty("java.version"));
        extent.setSystemInfo("User", System.getProperty("user.name"));

        System.out.println("========================================");
        System.out.println("EXTENT REPORT INITIALIZED");
        System.out.println("Report will be saved to: " + reportPath);
        System.out.println("========================================");
    }

    /**
     * Called when each test method starts
     *
     * We create a new ExtentTest for this test method.
     *
     * @param result TestNG result object (contains test method info)
     */
    @Override
    public void onTestStart(ITestResult result) {
        // Create test entry in report with test method name
        String testName = result.getMethod().getMethodName();
        String description = result.getMethod().getDescription();

        ExtentTest test = extent.createTest(testName, description);

        // Store in ThreadLocal for thread safety
        extentTest.set(test);

        // Log the start
        extentTest.get().log(Status.INFO, "Test started: " + testName);
    }

    /**
     * Called when a test passes
     *
     * We mark the test as PASSED in the report.
     *
     * @param result TestNG result object
     */
    @Override
    public void onTestSuccess(ITestResult result) {
        extentTest.get().log(Status.PASS, "Test PASSED: " + result.getMethod().getMethodName());
    }

    /**
     * Called when a test fails
     *
     * This is important! When a test fails, we:
     * 1. Log the failure status
     * 2. Capture the exception/error message
     * 3. Take a screenshot (for debugging)
     * 4. Attach screenshot to the report
     *
     * @param result TestNG result object with failure info
     */
    @Override
    public void onTestFailure(ITestResult result) {
        // Log failure status
        extentTest.get().log(Status.FAIL, "Test FAILED: " + result.getMethod().getMethodName());

        // Log the exception/error
        // getThrowable() returns the exception that caused the failure
        Throwable throwable = result.getThrowable();
        if (throwable != null) {
            extentTest.get().fail(throwable);
        }

        // Capture screenshot
        // We need to get the WebDriver from the test class
        try {
            // Get the test class instance
            Object testInstance = result.getInstance();

            // Check if it's a BaseClass (has captureScreen method)
            if (testInstance instanceof BaseClass) {
                BaseClass baseClass = (BaseClass) testInstance;
                String screenshotPath = baseClass.captureScreen(result.getMethod().getMethodName());

                // Attach screenshot to report
                // Convert path to File and attach
                extentTest.get().addScreenCaptureFromPath(screenshotPath);
                extentTest.get().log(Status.INFO, "Screenshot captured: " + screenshotPath);
            }
        } catch (Exception e) {
            extentTest.get().log(Status.WARNING, "Could not capture screenshot: " + e.getMessage());
        }
    }

    /**
     * Called when a test is skipped
     *
     * Tests are skipped when:
     * - A dependency test failed
     * - Test is explicitly skipped with throw new SkipException()
     * - Configuration method failed
     *
     * @param result TestNG result object
     */
    @Override
    public void onTestSkipped(ITestResult result) {
        extentTest.get().log(Status.SKIP, "Test SKIPPED: " + result.getMethod().getMethodName());

        // Log reason if available
        Throwable throwable = result.getThrowable();
        if (throwable != null) {
            extentTest.get().skip(throwable);
        }
    }

    /**
     * Called when test suite finishes
     *
     * This is where we FINALIZE the report:
     * 1. Flush all logged data to the report file
     * 2. Optionally open the report in browser
     *
     * @param context TestNG context
     */
    @Override
    public void onFinish(ITestContext context) {
        // Flush writes all logs to the report file
        // IMPORTANT: Without flush(), report won't be complete!
        extent.flush();

        System.out.println("========================================");
        System.out.println("EXTENT REPORT GENERATED");
        System.out.println("Report saved to: " + reportPath);
        System.out.println("========================================");

        // Automatically open report in default browser
        // Comment this out if you don't want auto-open
        try {
            File reportFile = new File(reportPath);
            if (Desktop.isDesktopSupported()) {
                Desktop.getDesktop().browse(reportFile.toURI());
            }
        } catch (IOException e) {
            System.out.println("Could not open report automatically: " + e.getMessage());
        }
    }

    // =========================================================================
    // HELPER METHODS FOR LOGGING IN TESTS
    // =========================================================================

    /**
     * Log an info message to the current test
     *
     * Usage in test: reportManager.logInfo("Clicked login button");
     *
     * @param message The message to log
     */
    public void logInfo(String message) {
        if (extentTest.get() != null) {
            extentTest.get().log(Status.INFO, message);
        }
    }

    /**
     * Log a warning message
     *
     * @param message The warning message
     */
    public void logWarning(String message) {
        if (extentTest.get() != null) {
            extentTest.get().log(Status.WARNING, message);
        }
    }

    /**
     * Log a pass message
     *
     * @param message The pass message
     */
    public void logPass(String message) {
        if (extentTest.get() != null) {
            extentTest.get().log(Status.PASS, message);
        }
    }

    /**
     * Log a fail message
     *
     * @param message The fail message
     */
    public void logFail(String message) {
        if (extentTest.get() != null) {
            extentTest.get().log(Status.FAIL, message);
        }
    }
}

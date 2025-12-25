# MusicLMS Test Automation Framework

## Java-Based Selenium + TestNG Framework

This is a comprehensive test automation framework for MusicLMS application, built using core Java concepts. This guide is designed for learners who are familiar with Java fundamentals.

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Java Concepts Used](#2-java-concepts-used)
3. [Framework Architecture](#3-framework-architecture)
4. [Project Structure](#4-project-structure)
5. [Understanding Each Component](#5-understanding-each-component)
6. [Running Tests](#6-running-tests)
7. [Adding New Tests](#7-adding-new-tests)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Quick Start

### Prerequisites
- Java 17 or higher
- Maven 3.8+
- Chrome/Firefox/Edge browser
- MusicLMS application running at http://localhost:3000

### Installation Steps

```bash
# 1. Navigate to the test project
cd music-lms-tests

# 2. Install dependencies
mvn clean install -DskipTests

# 3. Run tests
mvn test
```

### Quick Test Run

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=TC_Auth_001_LoginTest

# Run specific test method
mvn test -Dtest=TC_Auth_001_LoginTest#TC_Auth_001_VerifyLoginPageDisplay
```

---

## 2. Java Concepts Used

This framework uses the following core Java concepts:

### 2.1 Object-Oriented Programming (OOP)

#### Classes and Objects
```java
// CLASS: A blueprint for objects
public class LoginPage {
    // OBJECT: Instance of a class
    // Created with: LoginPage loginPage = new LoginPage(driver);
}
```

#### Inheritance (extends)
```java
// LoginPage INHERITS from BasePage
public class LoginPage extends BasePage {
    // Inherits: driver, wait, helper methods
    // Can use: this.driver, this.safeClick(), etc.
}

// TC_Auth_001_LoginTest INHERITS from BaseClass
public class TC_Auth_001_LoginTest extends BaseClass {
    // Inherits: driver, logger, p (properties)
    // Can use: this.driver, logger.info(), p.getProperty()
}
```

**Why Inheritance?**
- Write common code once (in parent)
- All children automatically get it
- Change in parent affects all children

```
                BasePage
                   |
    +------+-------+-------+
    |      |               |
LoginPage  SignupPage   DashboardPage
```

#### Encapsulation (Access Modifiers)
```java
public class LoginPage {
    // PRIVATE: Only accessible within this class
    private WebElement emailInput;

    // PROTECTED: Accessible in this class and subclasses
    protected WebDriver driver;

    // PUBLIC: Accessible from anywhere
    public void login(String email, String password) { }
}
```

#### Polymorphism
```java
// WebDriver is an INTERFACE
// Different browsers IMPLEMENT it
WebDriver driver = new ChromeDriver();  // Works!
WebDriver driver = new FirefoxDriver(); // Also works!

// Same variable type, different actual implementations
// Our code works with ANY browser that implements WebDriver
```

### 2.2 Interfaces

```java
// WebDriver is an INTERFACE (contract)
public interface WebDriver {
    void get(String url);           // Must implement
    WebElement findElement(By by);  // Must implement
    void quit();                    // Must implement
}

// ChromeDriver IMPLEMENTS the contract
public class ChromeDriver implements WebDriver {
    public void get(String url) { /* Chrome-specific code */ }
    public WebElement findElement(By by) { /* Chrome-specific code */ }
    public void quit() { /* Chrome-specific code */ }
}
```

**Why Interfaces?**
- Define WHAT a class must do (not HOW)
- Allows interchangeable implementations
- Our tests work with any browser implementing WebDriver

### 2.3 Constructors

```java
public class LoginPage extends BasePage {

    // CONSTRUCTOR: Special method called when object is created
    // Same name as class, no return type
    public LoginPage(WebDriver driver) {
        super(driver);  // Call parent constructor
        // Additional initialization...
    }
}

// Usage:
LoginPage page = new LoginPage(driver);  // Constructor runs here
```

### 2.4 Exception Handling

```java
try {
    // Code that might fail
    element.click();
} catch (NoSuchElementException e) {
    // Handle the specific error
    logger.error("Element not found: " + e.getMessage());
} finally {
    // Always runs, even if exception occurs
    // Good for cleanup
}
```

### 2.5 Static vs Instance

```java
public class BaseClass {
    // INSTANCE: Different for each object
    public WebDriver driver;  // Each test has its own driver

    // STATIC: Shared across ALL objects
    public static Logger logger = LogManager.getLogger();  // Same logger for all
}
```

### 2.6 Annotations

Annotations provide metadata about code:

```java
// TESTNG ANNOTATIONS

@Test           // Marks method as a test
@BeforeClass    // Runs once before all tests in class
@AfterClass     // Runs once after all tests in class
@BeforeMethod   // Runs before EACH test method
@AfterMethod    // Runs after EACH test method
@DataProvider   // Provides test data
@Parameters     // Receives values from XML

// SELENIUM ANNOTATIONS

@FindBy(id = "email")           // Locates element by ID
@FindBy(xpath = "//button")     // Locates element by XPath
@FindBy(css = ".btn-primary")   // Locates element by CSS
```

---

## 3. Framework Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FRAMEWORK ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────┐                                                   │
│   │   TEST CASES    │  ←── Tests that verify functionality              │
│   │ (testCases/)    │                                                   │
│   └────────┬────────┘                                                   │
│            │ extends                                                     │
│            ▼                                                             │
│   ┌─────────────────┐                                                   │
│   │   BASE CLASS    │  ←── Setup, teardown, utilities                   │
│   │ (testBase/)     │      (driver, logger, properties)                 │
│   └────────┬────────┘                                                   │
│            │ uses                                                        │
│            ▼                                                             │
│   ┌─────────────────┐                                                   │
│   │  PAGE OBJECTS   │  ←── Page interactions                            │
│   │ (pageObjects/)  │      (LoginPage, SignupPage, etc.)                │
│   └────────┬────────┘                                                   │
│            │ extends                                                     │
│            ▼                                                             │
│   ┌─────────────────┐                                                   │
│   │   BASE PAGE     │  ←── Common page utilities                        │
│   │ (pageObjects/)  │      (waits, clicks, types)                       │
│   └────────┬────────┘                                                   │
│            │ uses                                                        │
│            ▼                                                             │
│   ┌─────────────────┐     ┌─────────────────┐                           │
│   │   UTILITIES     │     │  CONFIGURATION  │                           │
│   │ (utilities/)    │     │  (resources/)   │                           │
│   └─────────────────┘     └─────────────────┘                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Project Structure

```
music-lms-tests/
│
├── pom.xml                           # Maven configuration (dependencies)
│
├── src/test/java/                    # Java source code
│   ├── pageObjects/                  # Page Object classes
│   │   ├── BasePage.java             # Parent class for all pages
│   │   ├── LoginPage.java            # Login page interactions
│   │   ├── SignupPage.java           # Signup page interactions
│   │   ├── InvitePage.java           # Student invite page
│   │   └── DashboardPage.java        # Dashboard after login
│   │
│   ├── testBase/                     # Test foundation
│   │   └── BaseClass.java            # Setup, teardown, utilities
│   │
│   ├── testCases/                    # Actual test classes
│   │   ├── TC_Auth_001_LoginTest.java      # Login tests
│   │   ├── TC_Auth_002_SignupTest.java     # Signup tests
│   │   └── TC_Auth_003_LoginDDT.java       # Data-driven tests
│   │
│   └── utilities/                    # Helper classes
│       ├── ExcelUtility.java         # Read/write Excel files
│       ├── DataProviders.java        # Test data providers
│       └── ExtentReportManager.java  # HTML report generation
│
├── src/test/resources/               # Configuration files
│   ├── config.properties             # App settings (URL, credentials)
│   ├── testng.xml                    # TestNG configuration
│   └── log4j2.xml                    # Logging configuration
│
├── testData/                         # External test data
│   ├── LoginTestData.xlsx            # Login test data
│   └── SignupTestData.xlsx           # Signup test data
│
├── logs/                             # Test execution logs
├── reports/                          # HTML test reports
└── screenshots/                      # Failure screenshots
```

---

## 5. Understanding Each Component

### 5.1 BaseClass (testBase/BaseClass.java)

The foundation that ALL test classes extend.

```java
public class BaseClass {
    public WebDriver driver;     // Browser controller
    public Logger logger;        // For logging messages
    public Properties p;         // Configuration values

    @BeforeClass
    public void setup(String browser) {
        // 1. Load config.properties
        // 2. Initialize browser
        // 3. Navigate to app URL
    }

    @AfterClass
    public void tearDown() {
        // Close browser
        driver.quit();
    }

    public String captureScreen(String name) {
        // Take screenshot and save
    }

    public String randomString() {
        // Generate random text
    }
}
```

### 5.2 BasePage (pageObjects/BasePage.java)

The foundation that ALL page objects extend.

```java
public class BasePage {
    protected WebDriver driver;
    protected WebDriverWait wait;

    public BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        PageFactory.initElements(driver, this);
    }

    // Common methods for all pages
    protected void safeClick(WebElement element);
    protected void safeType(WebElement element, String text);
    protected WebElement waitForVisibility(WebElement element);
}
```

### 5.3 Page Objects (e.g., LoginPage)

Each page in the app has its own class.

```java
public class LoginPage extends BasePage {

    // 1. LOCATORS: Define where elements are
    @FindBy(id = "email")
    private WebElement emailInput;

    @FindBy(id = "password")
    private WebElement passwordInput;

    // 2. CONSTRUCTOR: Initialize the page
    public LoginPage(WebDriver driver) {
        super(driver);
    }

    // 3. ACTIONS: What you can do on this page
    public void enterEmail(String email) {
        safeType(emailInput, email);
    }

    public void login(String email, String password) {
        enterEmail(email);
        enterPassword(password);
        clickLoginButton();
    }

    // 4. VERIFICATIONS: Check page state
    public boolean isPageDisplayed() {
        return isElementDisplayed(pageTitle);
    }
}
```

### 5.4 Test Cases

Actual tests that verify functionality.

```java
public class TC_Auth_001_LoginTest extends BaseClass {

    @Test(groups = {"sanity", "master"})
    public void TC_Auth_001_VerifyLoginPageDisplay() {
        // ARRANGE: Set up
        driver.get(p.getProperty("appUrl") + "/login");
        LoginPage loginPage = new LoginPage(driver);

        // ACT: Perform action
        boolean isDisplayed = loginPage.isPageDisplayed();

        // ASSERT: Verify result
        Assert.assertTrue(isDisplayed, "Login page should be displayed");
    }
}
```

---

## 6. Running Tests

### Maven Commands

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=TC_Auth_001_LoginTest

# Run tests by group
mvn test -Dgroups=sanity

# Run with specific browser
mvn test -Dbrowser=firefox

# Skip tests during build
mvn install -DskipTests
```

### IntelliJ IDEA

1. Right-click on test class → Run
2. Right-click on test method → Run
3. Right-click on testng.xml → Run

### Eclipse

1. Right-click on test class → Run As → TestNG Test
2. Right-click on testng.xml → Run As → TestNG Suite

---

## 7. Adding New Tests

### Step 1: Create Page Object (if new page)

```java
// src/test/java/pageObjects/NewPage.java
public class NewPage extends BasePage {

    @FindBy(id = "someElement")
    private WebElement someElement;

    public NewPage(WebDriver driver) {
        super(driver);
    }

    public void doSomething() {
        safeClick(someElement);
    }
}
```

### Step 2: Create Test Class

```java
// src/test/java/testCases/TC_New_001_FeatureTest.java
public class TC_New_001_FeatureTest extends BaseClass {

    @Test(groups = {"regression"})
    public void TC_New_001_VerifyFeature() {
        // Arrange
        driver.get(p.getProperty("appUrl") + "/new-page");
        NewPage page = new NewPage(driver);

        // Act
        page.doSomething();

        // Assert
        Assert.assertTrue(page.isSuccess());
    }
}
```

### Step 3: Add to testng.xml

```xml
<test name="New Feature Tests">
    <classes>
        <class name="testCases.TC_New_001_FeatureTest"/>
    </classes>
</test>
```

---

## 8. Troubleshooting

### Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| `NoSuchElementException` | Element not found | Check locator, add explicit wait |
| `StaleElementReference` | DOM changed | Re-find the element |
| `TimeoutException` | Element didn't appear in time | Increase wait time |
| `WebDriverException` | Browser crashed | Check browser version |
| Tests fail on CI | Headless mode needed | Set `headless=true` in config |

### Debugging Tips

1. **Add logs**: `logger.info("Current URL: " + driver.getCurrentUrl());`
2. **Take screenshots**: `captureScreen("debug");`
3. **Run in headed mode**: See the browser (`headless=false`)
4. **Use breakpoints**: Debug in IDE
5. **Check HTML**: Inspect element in browser DevTools

---

## Quick Reference Card

### Annotations
```java
@Test                 // This is a test
@BeforeClass          // Run before all tests
@AfterClass           // Run after all tests
@Parameters({"x"})    // Get value from XML
@DataProvider         // Provide test data
```

### Assertions
```java
Assert.assertTrue(condition);              // Must be true
Assert.assertFalse(condition);             // Must be false
Assert.assertEquals(actual, expected);     // Must be equal
Assert.assertNotNull(object);              // Must not be null
```

### Locators
```java
@FindBy(id = "email")           // By ID
@FindBy(name = "email")         // By name
@FindBy(xpath = "//button")     // By XPath
@FindBy(css = ".btn")           // By CSS
```

### Common Actions
```java
element.click();                // Click
element.sendKeys("text");       // Type
element.clear();                // Clear field
element.getText();              // Get text
element.getAttribute("value");  // Get attribute
driver.get("url");              // Navigate
driver.getCurrentUrl();         // Get URL
```

---

**Happy Testing!**

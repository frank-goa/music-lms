# Framework Comparison

## Your GitHub Framework vs MusicLMS Framework

This document shows how the MusicLMS test framework maps to your existing Test_Automation_Framework on GitHub.

---

## Side-by-Side Comparison

| Your Framework | MusicLMS Framework | Purpose |
|----------------|-------------------|---------|
| `src/test/java/pageObjects/` | `src/test/java/pageObjects/` | Page Object classes |
| `BasePage.java` | `BasePage.java` | Parent page class |
| `LoginPage.java` | `LoginPage.java` | Login page interactions |
| `HomePage.java` | `DashboardPage.java` | Main page after login |
| `AccountRegistrationPage.java` | `SignupPage.java` | Registration page |
| - | `InvitePage.java` | **New**: Student invite flow |
| | | |
| `src/test/java/testBase/` | `src/test/java/testBase/` | Test foundation |
| `BaseClass.java` | `BaseClass.java` | Setup, teardown, utilities |
| | | |
| `src/test/java/testCases/` | `src/test/java/testCases/` | Test classes |
| `TC001_AccountRegistrationTest.java` | `TC_Auth_002_SignupTest.java` | Registration tests |
| `TC002_LoginTest.java` | `TC_Auth_001_LoginTest.java` | Login tests |
| `TC003_LoginDDT.java` | `TC_Auth_003_LoginDDT.java` | Data-driven login tests |
| | | |
| `src/test/java/utilities/` | `src/test/java/utilities/` | Helper classes |
| `DataProviders.java` | `DataProviders.java` | Test data providers |
| `ExcelUtility.java` | `ExcelUtility.java` | Excel file handling |
| `ExtentReportManager.java` | `ExtentReportManager.java` | HTML report generation |
| | | |
| `src/test/resources/` | `src/test/resources/` | Configuration |
| `config.properties` | `config.properties` | App settings |
| `log4j2.xml` | `log4j2.xml` | Logging config |
| `testng.xml` | `testng.xml` | TestNG suite config |

---

## Code Comparison

### BasePage.java

**Your Framework:**
```java
public class BasePage {
    WebDriver driver;

    public BasePage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }
}
```

**MusicLMS Framework (same concept, more helpers):**
```java
public class BasePage {
    protected WebDriver driver;
    protected WebDriverWait wait;  // Added for explicit waits

    public BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        PageFactory.initElements(driver, this);
    }

    // Additional helper methods
    protected void safeClick(WebElement element) { ... }
    protected void safeType(WebElement element, String text) { ... }
}
```

### LoginPage.java

**Your Framework:**
```java
public class LoginPage extends BasePage {
    @FindBy(xpath = "//input[@id='input-email']")
    WebElement txtEmail;

    @FindBy(xpath = "//input[@id='input-password']")
    WebElement txtPassword;

    public void setTxtEmail(String email) {
        txtEmail.clear();
        txtEmail.sendKeys(email);
    }
}
```

**MusicLMS Framework:**
```java
public class LoginPage extends BasePage {
    @FindBy(id = "email")  // MusicLMS uses id="email"
    private WebElement emailInput;

    @FindBy(id = "password")
    private WebElement passwordInput;

    public LoginPage enterEmail(String email) {
        safeType(emailInput, email);  // Using BasePage helper
        return this;  // For method chaining
    }
}
```

### BaseClass.java

**Your Framework:**
```java
@BeforeClass
@Parameters({"os", "br"})  // Supports remote execution
public void setup(String os, String br) {
    // Remote WebDriver support
    // Local WebDriver support
}
```

**MusicLMS Framework:**
```java
@BeforeClass
@Parameters({"browser"})  // Simplified for local execution
public void setup(String br) {
    // Local WebDriver only (no Selenium Grid)
    // Can be extended for remote later
}
```

---

## Key Differences

| Aspect | Your Framework | MusicLMS Framework |
|--------|----------------|-------------------|
| **Selenium Grid** | Supported | Not implemented (can add) |
| **Browsers** | Chrome, Firefox, Edge | Chrome, Firefox, Edge |
| **Wait Strategy** | Implicit only | Implicit + Explicit |
| **Method Chaining** | Not used | Implemented |
| **Headless Mode** | Not visible | Configurable |
| **Test Naming** | TC001, TC002 | TC_Auth_001, TC_Auth_002 |

---

## What I Added

1. **Better Wait Handling**: Added `WebDriverWait` for explicit waits
2. **Safe Methods**: `safeClick()`, `safeType()` prevent flaky tests
3. **Method Chaining**: `page.enterEmail(e).enterPassword(p)`
4. **Detailed Comments**: Every line explained for learning
5. **Headless Config**: Run without visible browser

---

## What You Can Extend

1. **Add Selenium Grid**: For parallel/remote execution
2. **Add More Pages**: Dashboard, Students, Assignments, etc.
3. **Add API Tests**: Use RestAssured library
4. **Add CI/CD**: GitHub Actions, Jenkins integration
5. **Add Database Validation**: Query Supabase directly

---

## Running Tests

Same commands work for both frameworks:

```bash
# Run all tests
mvn test

# Run by class
mvn test -Dtest=TC_Auth_001_LoginTest

# Run by group
mvn test -Dgroups=sanity
```

---

## Learning Path

1. **Start with**: `BaseClass.java` - Understand setup/teardown
2. **Then read**: `BasePage.java` - Understand page object pattern
3. **Then read**: `LoginPage.java` - Understand specific page implementation
4. **Then read**: `TC_Auth_001_LoginTest.java` - Understand test writing
5. **Finally**: `TC_Auth_003_LoginDDT.java` - Understand data-driven testing

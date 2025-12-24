package com.musiclms.steps;

import com.musiclms.pages.AssignmentsPage;
import com.musiclms.pages.DashboardPage;
import com.musiclms.pages.LoginPage;
import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class StepDefinitions {

    private WebDriver driver;
    private LoginPage loginPage;
    private DashboardPage dashboardPage;
    private AssignmentsPage assignmentsPage;

    @Before
    public void setup() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        driver = new ChromeDriver(options);
        
        loginPage = new LoginPage(driver);
        dashboardPage = new DashboardPage(driver);
        assignmentsPage = new AssignmentsPage(driver);
    }

    @After
    public void teardown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Given("I navigate to the Music LMS application")
    public void navigateToApp() {
        driver.get("http://localhost:3000/login");
    }

    @Given("I login as a {string} with email {string} and password {string}")
    public void login(String role, String email, String password) {
        loginPage.login(email, password);
    }

    @When("I navigate to the {string} page")
    public void navigateToPage(String pageName) {
        dashboardPage.navigateTo(pageName);
    }

    @When("I create a new assignment titled {string} for student {string} with resource {string}")
    public void createAssignment(String title, String student, String resource) {
        assignmentsPage.createAssignment(title, student, resource);
    }

    @Then("I should see {string} in the assignment list")
    public void verifyAssignment(String title) {
        assertTrue(assignmentsPage.isAssignmentVisible(title));
    }

    // Additional step definitions would be implemented here for other scenarios...
    
    @When("I upload a resource with title {string}")
    public void uploadResource(String title) {
        // Implementation placeholder
    }

    @When("I log a practice session for {int} minutes with notes {string}")
    public void logPractice(int minutes, String notes) {
         // Implementation placeholder
    }

    @Then("I should see the practice session in the history")
    public void verifyPractice() {
         // Implementation placeholder
    }
    
    @When("I open the assignment {string}")
    public void openAssignment(String title) {
        // Implementation
    }

    @When("I submit a recording")
    public void submitRecording() {
        // Implementation
    }

    @Then("the assignment status should be {string}")
    public void verifyStatus(String status) {
        // Implementation
    }

    @When("I schedule a lesson for {string} tomorrow at {string}")
    public void scheduleLesson(String student, String time) {
        // Implementation
    }

    @Then("I should see the lesson on the calendar")
    public void verifyCalendar() {
        // Implementation
    }
}

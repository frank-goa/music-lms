# Test Plan: Music LMS End-to-End Automation

## 1. Objective
To ensure the functional stability and reliability of the Music LMS application by automating critical user workflows using Java, Selenium WebDriver, and Cucumber.

## 2. Scope
The automation will cover the following modules for both **Teacher** and **Student** roles:
- Authentication (Login)
- Dashboard & Navigation
- Resource Library (Teacher)
- Assignments (Creation & Submission)
- Practice Logs
- Scheduling

## 3. Technology Stack
- **Language:** Java 11+
- **Web Driver:** Selenium WebDriver
- **BDD Framework:** Cucumber (Gherkin)
- **Design Pattern:** Page Object Model (POM)
- **Build Tool:** Maven
- **Assertions:** JUnit / TestNG

## 4. Test Environment
- **URL:** http://localhost:3000
- **Browser:** Chrome (Headless/GUI)

---

# Test Cases

## Feature: Authentication
**TC01: Valid Teacher Login**
- **Precondition:** User exists with role 'teacher'.
- **Steps:** Navigate to login, enter credentials, click login.
- **Expected:** Redirected to Teacher Dashboard.

**TC02: Valid Student Login**
- **Precondition:** User exists with role 'student'.
- **Steps:** Navigate to login, enter credentials, click login.
- **Expected:** Redirected to Student Dashboard.

## Feature: Resource Library (Teacher)
**TC03: Upload New Resource**
- **Role:** Teacher
- **Steps:** Go to Library, Click Upload, Fill Title, Select File, Save.
- **Expected:** Resource appears in the list.

## Feature: Assignment Management
**TC04: Create Assignment with Resource**
- **Role:** Teacher
- **Steps:** Go to Assignments, Click New, Fill Details, Select Student, Select Resource, Create.
- **Expected:** Assignment appears in list with correct details.

## Feature: Student Activities
**TC05: Log Practice Session**
- **Role:** Student
- **Steps:** Go to Practice Log, Click Log Practice, Enter Duration/Notes, Save.
- **Expected:** New session appears in history, Total time updates.

**TC06: Submit Assignment**
- **Role:** Student
- **Steps:** Go to Assignments, Open Assignment, Upload/Record, Submit.
- **Expected:** Status changes to "Submitted".

## Feature: Scheduling
**TC07: Schedule Lesson**
- **Role:** Teacher
- **Steps:** Go to Schedule, Click Schedule Lesson, Select Student/Time, Save.
- **Expected:** Lesson appears on the Weekly Calendar.

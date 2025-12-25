package utilities;

import java.io.IOException;

import org.testng.annotations.DataProvider;

/**
 * =============================================================================
 * DATA PROVIDERS CLASS
 * =============================================================================
 *
 * This class provides test data to test methods using TestNG's @DataProvider.
 *
 * WHAT IS DATA-DRIVEN TESTING?
 * ----------------------------
 * Data-driven testing is a technique where:
 * 1. Same test logic is executed multiple times
 * 2. Each execution uses different data
 * 3. Data is stored externally (Excel, CSV, JSON)
 *
 * ANALOGY:
 * Think of a photocopier:
 * - The test code is like the copy machine (same process)
 * - Test data is like the original documents (different inputs)
 * - Each copy is a test iteration (same process, different content)
 *
 * BENEFITS:
 * - Test multiple scenarios with one test method
 * - Non-technical team can add test cases
 * - Data is separate from test logic
 *
 * HOW @DataProvider WORKS:
 * ------------------------
 *
 *     @DataProvider(name = "loginData")
 *     public String[][] getData() {
 *         return new String[][] {
 *             {"user1@test.com", "pass1", "true"},   // Test iteration 1
 *             {"user2@test.com", "pass2", "true"},   // Test iteration 2
 *             {"invalid@test.com", "wrong", "false"} // Test iteration 3
 *         };
 *     }
 *
 *     @Test(dataProvider = "loginData")
 *     public void loginTest(String email, String password, String expected) {
 *         // This method runs 3 times with different data!
 *     }
 *
 * DATA FLOW:
 *     Excel File → ExcelUtility → 2D Array → DataProvider → Test Method
 *
 * =============================================================================
 */
public class DataProviders {

    /**
     * DataProvider for Login Test Data
     *
     * Reads login credentials from Excel file.
     *
     * EXCEL FORMAT (LoginTestData.xlsx, Sheet: LoginData):
     * +---+----------------------+------------+----------+
     * |   |          A           |      B     |    C     |
     * +---+----------------------+------------+----------+
     * | 1 | Email                | Password   | Expected |  <- Header (skip)
     * | 2 | teacher@test.com     | Test@123   | true     |
     * | 3 | student@test.com     | Test@456   | true     |
     * | 4 | invalid@test.com     | wrongpass  | false    |
     * +---+----------------------+------------+----------+
     *
     * 2D ARRAY STRUCTURE:
     * -------------------
     * In Java, a 2D array is like a table:
     *
     *     String[][] data = new String[3][3];
     *
     *     data[0] = {"teacher@test.com", "Test@123", "true"}   // Row 0
     *     data[1] = {"student@test.com", "Test@456", "true"}   // Row 1
     *     data[2] = {"invalid@test.com", "wrongpass", "false"} // Row 2
     *
     * @return 2D String array with login test data
     * @throws IOException If Excel file cannot be read
     */
    @DataProvider(name = "LoginData")
    public String[][] getLoginData() throws IOException {
        // Path to test data file
        String path = "./testData/LoginTestData.xlsx";

        // Create Excel utility instance
        ExcelUtility xlutil = new ExcelUtility(path);

        // Get row and column counts (skip header row)
        int totalRows = xlutil.getRowCount("LoginData");
        int totalCols = xlutil.getCellCount("LoginData", 0);

        // Create 2D array to store data
        // Size: (totalRows - 1) because we skip header
        String[][] loginData = new String[totalRows - 1][totalCols];

        // Read data starting from row 1 (skipping header at row 0)
        for (int i = 1; i < totalRows; i++) {
            for (int j = 0; j < totalCols; j++) {
                // i-1 because our array is 0-indexed but we start from row 1
                loginData[i - 1][j] = xlutil.getCellData("LoginData", i, j);
            }
        }

        xlutil.close();
        return loginData;
    }

    /**
     * DataProvider for Signup Test Data
     *
     * EXCEL FORMAT (SignupTestData.xlsx, Sheet: SignupData):
     * +---+-------------+----------------------+------------+----------+
     * |   |      A      |          B           |      C     |    D     |
     * +---+-------------+----------------------+------------+----------+
     * | 1 | FullName    | Email                | Password   | Expected |
     * | 2 | John Doe    | john@test.com        | Pass123!   | true     |
     * | 3 | Jane Smith  | jane@test.com        | Pass456!   | true     |
     * | 4 | Test User   | invalid-email        | weak       | false    |
     * +---+-------------+----------------------+------------+----------+
     *
     * @return 2D String array with signup test data
     * @throws IOException If Excel file cannot be read
     */
    @DataProvider(name = "SignupData")
    public String[][] getSignupData() throws IOException {
        String path = "./testData/SignupTestData.xlsx";
        ExcelUtility xlutil = new ExcelUtility(path);

        int totalRows = xlutil.getRowCount("SignupData");
        int totalCols = xlutil.getCellCount("SignupData", 0);

        String[][] signupData = new String[totalRows - 1][totalCols];

        for (int i = 1; i < totalRows; i++) {
            for (int j = 0; j < totalCols; j++) {
                signupData[i - 1][j] = xlutil.getCellData("SignupData", i, j);
            }
        }

        xlutil.close();
        return signupData;
    }

    /**
     * DataProvider for Invalid Login Attempts
     *
     * Specifically for testing error handling with bad credentials.
     *
     * @return 2D String array with invalid login data
     * @throws IOException If Excel file cannot be read
     */
    @DataProvider(name = "InvalidLoginData")
    public String[][] getInvalidLoginData() throws IOException {
        String path = "./testData/InvalidLoginData.xlsx";
        ExcelUtility xlutil = new ExcelUtility(path);

        int totalRows = xlutil.getRowCount("InvalidData");
        int totalCols = xlutil.getCellCount("InvalidData", 0);

        String[][] invalidData = new String[totalRows - 1][totalCols];

        for (int i = 1; i < totalRows; i++) {
            for (int j = 0; j < totalCols; j++) {
                invalidData[i - 1][j] = xlutil.getCellData("InvalidData", i, j);
            }
        }

        xlutil.close();
        return invalidData;
    }

    /**
     * Hardcoded DataProvider (No Excel)
     *
     * Sometimes it's simpler to hardcode test data directly.
     * Use this when:
     * - Test data rarely changes
     * - You want tests to be self-contained
     * - No external file dependencies needed
     *
     * INLINE DATA FORMAT:
     * Each inner array is one test iteration.
     * Array elements map to method parameters in order.
     */
    @DataProvider(name = "ValidCredentials")
    public Object[][] getValidCredentials() {
        return new Object[][] {
            // {email, password, fullName, expectedRole}
            {"teacher@musiclms.test", "SecurePass123!", "Test Teacher", "teacher"},
            {"student@musiclms.test", "SecurePass456!", "Test Student", "student"}
        };
    }

    /**
     * DataProvider for Password Validation Testing
     *
     * Tests various password scenarios.
     */
    @DataProvider(name = "PasswordValidation")
    public Object[][] getPasswordValidationData() {
        return new Object[][] {
            // {password, shouldPass, reason}
            {"12345", false, "Too short (less than 6 chars)"},
            {"123456", true, "Minimum length (6 chars)"},
            {"password", true, "Valid length, no special chars"},
            {"P@ssw0rd!", true, "Strong password"},
            {"", false, "Empty password"},
            {"   ", false, "Whitespace only"}
        };
    }

    /**
     * DataProvider for Email Validation Testing
     *
     * Tests various email formats.
     */
    @DataProvider(name = "EmailValidation")
    public Object[][] getEmailValidationData() {
        return new Object[][] {
            // {email, shouldPass, reason}
            {"user@domain.com", true, "Valid email"},
            {"user.name@domain.com", true, "Email with dot in local part"},
            {"user@sub.domain.com", true, "Email with subdomain"},
            {"invalid-email", false, "Missing @ and domain"},
            {"@domain.com", false, "Missing local part"},
            {"user@", false, "Missing domain"},
            {"", false, "Empty email"},
            {"user@domain", false, "Missing TLD"}
        };
    }

    /**
     * DataProvider for Student Invite Flow
     *
     * Tests student registration via invite link.
     */
    @DataProvider(name = "StudentInviteData")
    public Object[][] getStudentInviteData() {
        return new Object[][] {
            // {fullName, email, password, instrument, skillLevel, expected}
            {"Alice Johnson", "alice@test.com", "Pass123!", "Piano", "Beginner", true},
            {"Bob Williams", "bob@test.com", "Pass456!", "Guitar", "Intermediate", true},
            {"Carol Davis", "carol@test.com", "Pass789!", "Violin", "Advanced", true}
        };
    }
}

=============================================================================
TEST DATA FILES
=============================================================================

This folder contains Excel files used for data-driven testing.

REQUIRED FILES:
---------------

1. LoginTestData.xlsx
   Sheet: LoginData
   Columns: Email | Password | Expected

   Example:
   +---+----------------------+------------+----------+
   |   |          A           |      B     |    C     |
   +---+----------------------+------------+----------+
   | 1 | Email                | Password   | Expected |
   | 2 | teacher@test.com     | Test@123   | true     |
   | 3 | student@test.com     | Test@456   | true     |
   | 4 | invalid@test.com     | wrongpass  | false    |
   +---+----------------------+------------+----------+

2. SignupTestData.xlsx
   Sheet: SignupData
   Columns: FullName | Email | Password | Expected

3. InvalidLoginData.xlsx
   Sheet: InvalidData
   Columns: Email | Password | ErrorMessage

HOW TO CREATE:
--------------
1. Open Microsoft Excel or Google Sheets
2. Create the columns as shown above
3. Add your test data rows
4. Save as .xlsx format
5. Place in this folder

NOTES:
------
- Row 1 is always the HEADER row (skipped during reading)
- "Expected" column: "true" for success, "false" for failure
- Keep one blank row at the end to avoid ArrayIndexOutOfBoundsException

package utilities;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

/**
 * =============================================================================
 * EXCEL UTILITY CLASS
 * =============================================================================
 *
 * This utility class provides methods to read and write Excel files.
 * It uses Apache POI library for Excel file operations.
 *
 * WHY EXCEL FOR TEST DATA?
 * ------------------------
 * 1. Non-technical team members can maintain test data
 * 2. Easy to add new test cases (just add rows)
 * 3. Data is separate from code (easier maintenance)
 * 4. Supports data-driven testing (same test, different data)
 *
 * APACHE POI CONCEPTS:
 * --------------------
 *
 *     +------------------------+
 *     |       WORKBOOK         |  <-- The entire Excel file (.xlsx)
 *     |  +------------------+  |
 *     |  |     SHEET        |  |  <-- A single tab in Excel
 *     |  |  +------------+  |  |
 *     |  |  |    ROW     |  |  |  <-- A horizontal row (1, 2, 3...)
 *     |  |  | +--------+ |  |  |
 *     |  |  | |  CELL  | |  |  |  <-- Individual cell (A1, B2, etc.)
 *     |  |  | +--------+ |  |  |
 *     |  |  +------------+  |  |
 *     |  +------------------+  |
 *     +------------------------+
 *
 * CLASS HIERARCHY:
 * - XSSFWorkbook: Represents .xlsx file (Excel 2007+)
 * - XSSFSheet: Represents a sheet/tab
 * - XSSFRow: Represents a row
 * - XSSFCell: Represents a cell
 *
 * Note: "XSSF" is for .xlsx files. "HSSF" is for older .xls files.
 *
 * =============================================================================
 */
public class ExcelUtility {

    /**
     * Instance variables
     *
     * We store these as instance variables so multiple method calls
     * can work on the same file without reopening it.
     */
    private FileInputStream fis;     // For reading
    private FileOutputStream fos;    // For writing
    private XSSFWorkbook workbook;   // The Excel workbook
    private XSSFSheet sheet;         // Current sheet
    private XSSFRow row;             // Current row
    private XSSFCell cell;           // Current cell
    private String path;             // File path

    /**
     * Constructor - Opens the Excel file
     *
     * WHAT IS FileInputStream?
     * ------------------------
     * In Java, streams are used for reading/writing data.
     * - InputStream: For reading (data flows IN to our program)
     * - OutputStream: For writing (data flows OUT of our program)
     *
     * FileInputStream reads bytes from a file.
     * We pass it to XSSFWorkbook to parse the Excel content.
     *
     * @param path Path to the Excel file
     */
    public ExcelUtility(String path) {
        this.path = path;
        try {
            fis = new FileInputStream(path);
            workbook = new XSSFWorkbook(fis);
        } catch (IOException e) {
            System.err.println("Error opening Excel file: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Get the number of rows in a sheet
     *
     * IMPORTANT:
     * - getLastRowNum() returns ZERO-BASED index
     * - If sheet has 5 rows (1-5), getLastRowNum() returns 4
     * - We add 1 to get the actual count
     *
     * ROW INDEXING:
     * Excel displays: Row 1, Row 2, Row 3...
     * POI uses:       Index 0, Index 1, Index 2...
     *
     * @param sheetName Name of the sheet (tab)
     * @return Number of rows containing data
     */
    public int getRowCount(String sheetName) {
        sheet = workbook.getSheet(sheetName);
        if (sheet == null) {
            return 0;
        }
        // getLastRowNum() returns 0-based index, so we add 1
        // BUT if you have a header row, you might want to subtract 1
        return sheet.getLastRowNum() + 1;
    }

    /**
     * Get the number of cells (columns) in a specific row
     *
     * Different rows can have different numbers of cells!
     * That's why we specify which row to check.
     *
     * @param sheetName Name of the sheet
     * @param rowNum Row number (0-based)
     * @return Number of cells in that row
     */
    public int getCellCount(String sheetName, int rowNum) {
        sheet = workbook.getSheet(sheetName);
        if (sheet == null) {
            return 0;
        }
        row = sheet.getRow(rowNum);
        if (row == null) {
            return 0;
        }
        return row.getLastCellNum();
    }

    /**
     * Get the data from a specific cell
     *
     * CELL TYPES:
     * -----------
     * Excel cells can contain different types of data:
     * - STRING: Text like "John Doe"
     * - NUMERIC: Numbers like 42 or 3.14 or dates
     * - BOOLEAN: true/false
     * - FORMULA: =SUM(A1:A10)
     * - BLANK: Empty cell
     *
     * We use DataFormatter to get a consistent String representation
     * regardless of the actual cell type.
     *
     * @param sheetName Name of the sheet
     * @param rowNum Row number (0-based in POI, but we often pass 1-based)
     * @param colNum Column number (0-based: A=0, B=1, C=2...)
     * @return Cell value as String
     */
    public String getCellData(String sheetName, int rowNum, int colNum) {
        sheet = workbook.getSheet(sheetName);
        if (sheet == null) {
            return "";
        }

        row = sheet.getRow(rowNum);
        if (row == null) {
            return "";
        }

        cell = row.getCell(colNum);
        if (cell == null) {
            return "";
        }

        // DataFormatter handles all cell types and returns String
        DataFormatter formatter = new DataFormatter();
        return formatter.formatCellValue(cell);
    }

    /**
     * Set/write data to a specific cell
     *
     * This method creates rows/cells if they don't exist.
     * After writing, we save the file.
     *
     * WRITING PROCESS:
     * 1. Get or create the row
     * 2. Get or create the cell
     * 3. Set the value
     * 4. Write changes to file
     *
     * @param sheetName Name of the sheet
     * @param rowNum Row number
     * @param colNum Column number
     * @param data Data to write
     */
    public void setCellData(String sheetName, int rowNum, int colNum, String data) {
        try {
            sheet = workbook.getSheet(sheetName);

            // Get or create row
            row = sheet.getRow(rowNum);
            if (row == null) {
                row = sheet.createRow(rowNum);
            }

            // Get or create cell
            cell = row.getCell(colNum);
            if (cell == null) {
                cell = row.createCell(colNum);
            }

            // Set the value
            cell.setCellValue(data);

            // Save to file
            fos = new FileOutputStream(path);
            workbook.write(fos);
            fos.close();

        } catch (IOException e) {
            System.err.println("Error writing to Excel: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Check if a cell contains specific data
     *
     * Useful for searching through Excel data.
     *
     * @param sheetName Sheet to search
     * @param data Data to find
     * @return true if found
     */
    public boolean isDataPresent(String sheetName, String data) {
        sheet = workbook.getSheet(sheetName);
        if (sheet == null) {
            return false;
        }

        int rows = getRowCount(sheetName);
        for (int i = 0; i < rows; i++) {
            int cols = getCellCount(sheetName, i);
            for (int j = 0; j < cols; j++) {
                if (getCellData(sheetName, i, j).equals(data)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Get row number containing specific data in a column
     *
     * @param sheetName Sheet to search
     * @param colNum Column to search in
     * @param data Data to find
     * @return Row number (0-based), or -1 if not found
     */
    public int getRowNum(String sheetName, int colNum, String data) {
        int rows = getRowCount(sheetName);
        for (int i = 0; i < rows; i++) {
            if (getCellData(sheetName, i, colNum).equals(data)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Close the workbook and release resources
     *
     * IMPORTANT: Always close when done!
     * Failing to close can cause:
     * - Memory leaks
     * - File locks (can't delete/modify file)
     */
    public void close() {
        try {
            if (fis != null) {
                fis.close();
            }
            if (workbook != null) {
                workbook.close();
            }
        } catch (IOException e) {
            System.err.println("Error closing Excel: " + e.getMessage());
        }
    }
}

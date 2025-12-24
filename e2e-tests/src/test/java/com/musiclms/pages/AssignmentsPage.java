package com.musiclms.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.By;

public class AssignmentsPage extends BasePage {

    @FindBy(xpath = "//button[contains(text(), 'New Assignment')]")
    private WebElement newAssignmentBtn;

    @FindBy(name = "title")
    private WebElement titleInput;
    
    // Simplification: In a real test, we'd need complex interaction for the custom Select/Combobox components
    @FindBy(css = "button[type='submit']") 
    private WebElement createBtn;

    public AssignmentsPage(WebDriver driver) {
        super(driver);
    }

    public void createAssignment(String title, String student, String resource) {
        click(newAssignmentBtn);
        type(titleInput, title);
        // Note: Selecting student/resource in shadcn/ui select/dialog requires more complex steps
        // This is a simplified placeholder
        click(createBtn);
    }

    public boolean isAssignmentVisible(String title) {
        return isDisplayed(driver.findElement(By.xpath("//h3[contains(text(), '" + title + "')]")));
    }
}

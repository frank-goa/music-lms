package com.musiclms.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class DashboardPage extends BasePage {

    @FindBy(linkText = "Assignments")
    private WebElement assignmentsLink;

    @FindBy(linkText = "Library")
    private WebElement libraryLink;

    @FindBy(linkText = "Schedule")
    private WebElement scheduleLink;
    
    @FindBy(linkText = "Practice Log")
    private WebElement practiceLogLink;

    public DashboardPage(WebDriver driver) {
        super(driver);
    }

    public void navigateTo(String pageName) {
        switch (pageName) {
            case "Assignments":
                click(assignmentsLink);
                break;
            case "Library":
                click(libraryLink);
                break;
            case "Schedule":
                click(scheduleLink);
                break;
            case "Practice Log":
                click(practiceLogLink);
                break;
            default:
                throw new IllegalArgumentException("Unknown page: " + pageName);
        }
    }
}

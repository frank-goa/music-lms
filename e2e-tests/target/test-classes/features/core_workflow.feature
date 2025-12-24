Feature: Music LMS Core Workflows

  Background:
    Given I navigate to the Music LMS application

  @Teacher
  Scenario: Teacher creates an assignment with a resource
    Given I login as a "teacher" with email "teacher@example.com" and password "password123"
    When I navigate to the "Library" page
    And I upload a resource with title "Scales PDF"
    And I navigate to the "Assignments" page
    And I create a new assignment titled "Week 1 Practice" for student "Student One" with resource "Scales PDF"
    Then I should see "Week 1 Practice" in the assignment list

  @Student
  Scenario: Student logs practice and submits assignment
    Given I login as a "student" with email "student@example.com" and password "password123"
    When I navigate to the "Practice Log" page
    And I log a practice session for 45 minutes with notes "Felt good today"
    Then I should see the practice session in the history
    When I navigate to the "Assignments" page
    And I open the assignment "Week 1 Practice"
    And I submit a recording
    Then the assignment status should be "Submitted"

  @Teacher
  Scenario: Teacher schedules a lesson
    Given I login as a "teacher" with email "teacher@example.com" and password "password123"
    When I navigate to the "Schedule" page
    And I schedule a lesson for "Student One" tomorrow at "10:00 AM"
    Then I should see the lesson on the calendar

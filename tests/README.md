# MusicLMS Testing

## Test Automation Framework

The test automation framework for MusicLMS is located in the `music-lms-tests/` directory.

This is a **Java-based framework** using:
- **Selenium WebDriver** - Browser automation
- **TestNG** - Test framework
- **Page Object Model** - Design pattern
- **Apache POI** - Excel test data
- **Extent Reports** - HTML reporting

## Getting Started

```bash
# Navigate to test project
cd music-lms-tests

# Install dependencies
mvn clean install -DskipTests

# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=TC_Auth_001_LoginTest

# View report
# Report is generated in: music-lms-tests/reports/
```

## Prerequisites

1. **Java 17+** installed
2. **Maven 3.8+** installed
3. **MusicLMS app** running at http://localhost:3000
4. **Chrome/Firefox/Edge** browser

## Documentation

See `music-lms-tests/README.md` for comprehensive documentation including:
- Java concepts used in the framework
- Framework architecture
- Project structure explanation
- How to add new tests
- Troubleshooting guide

## Test Categories

| Category | Description | Command |
|----------|-------------|---------|
| Authentication | Login, Signup, Invite | `mvn test -Dgroups=sanity` |
| Sanity | Quick smoke tests | `mvn test -Dgroups=sanity` |
| Regression | Full test suite | `mvn test -Dgroups=regression` |
| Data-Driven | Tests with Excel data | `mvn test -Dgroups=dataDriven` |

## Quick Links

- [Full Documentation](../music-lms-tests/README.md)
- [Test Cases](../music-lms-tests/src/test/java/testCases/)
- [Page Objects](../music-lms-tests/src/test/java/pageObjects/)
- [Configuration](../music-lms-tests/src/test/resources/)

# Contributing to sizes="auto" Polyfill

Thank you for your interest in contributing to the sizes="auto" polyfill! This document provides guidelines and instructions for contributing to the project.

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install Playwright browsers:
   ```bash
   npx playwright install firefox webkit
   ```

## Running Tests

The project uses Playwright for testing across different browsers. You can run tests using:

```bash
# Run all tests
npm test

# Run tests with HTML report
npm run test:report

# Run tests in specific browser
npm run test:firefox
npm run test:webkit
```

## Development Workflow

1. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes to `autosizes.js`

3. Update tests in `test.spec.js` if needed

4. Run tests to ensure everything works:
   ```bash
   npm test
   ```

5. Commit your changes with a descriptive message:
   ```bash
   git commit -m "Description of your changes"
   ```

6. Push your branch and create a pull request

## Testing Guidelines

- All changes must be tested in both Firefox and Safari
- New features should include corresponding test cases
- Tests should be added to `test.spec.js`
- Test cases should be added to `test.html` if needed

## Code Style

- Use consistent indentation (2 spaces)
- Use descriptive variable names
- Add comments for complex logic
- Keep functions focused and small
- Use `for...of` loops instead of `forEach`

## Pull Request Process

1. Ensure your PR description clearly explains the changes
2. Reference any related issues
3. Ensure all tests pass
4. Update documentation if needed
5. Wait for review and address any feedback

## Test Cases

When adding new test cases:

1. Add the test case to `test.html`
2. Give the image a unique ID (e.g., `img-testX`)
3. Add corresponding tests to `test.spec.js`
4. Test in both Firefox and Safari

## Browser Support

The polyfill should work in:
- Firefox (latest)
- Safari (latest)
- Other modern browsers

Changes should not break support for any of these browsers.

## Documentation

- Update README.md for significant changes
- Add comments to code for complex logic
- Document any new features or changes in behavior

## Questions?

Feel free to open an issue if you have any questions about contributing! 
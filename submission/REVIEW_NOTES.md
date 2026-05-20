# Chrome Web Store Review Notes

## How to test

1. Load the extension.
2. Open `https://www.google.com/search?q=running+shoes`.
3. Confirm a Serendipity panel appears above the results.
4. Open the popup and change intensity or remix engines.
5. Confirm the results page reloads and the remix cards change.
6. Enable auto-inject and submit an exploratory query.
7. Confirm utility/navigation queries like `gmail` or `slack login` are not remixed.

## Supported pages

- `https://www.google.com/`
- `https://www.google.com/search*`

## Important limitation

The extension is intended for standard Google web pages only. It does not
modify Chrome-internal pages such as `chrome://contextual-tasks`.

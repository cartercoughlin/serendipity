# Privacy Disclosure Draft

## Single purpose

Serendipity modifies Google Search pages to introduce alternate query pivots and
optional reduced-personalization search reruns.

## User data handling

Serendipity does not collect, transmit, sell, or share personal data to a
remote server.

## What the extension stores

The extension stores user preferences in Chrome sync storage:

- enabled/disabled state
- auto-depersonalize toggle
- auto-inject toggle
- panel collapsed state
- intensity setting
- enabled remix engines

## Where processing happens

All query remixing and page modifications happen locally in the browser.

## Permissions rationale

- `storage`: Save user preferences.
- `tabs`: Reload the active Google tab after settings changes.
- `scripting`: Reinforce script injection on supported Google web pages.
- `webNavigation`: Reapply the extension when Google changes route state.
- `https://www.google.com/*`: Operate on Google Search pages.

## Unsupported surfaces

Chrome-internal pages such as `chrome://contextual-tasks` are not scriptable by
extensions and are not modified.

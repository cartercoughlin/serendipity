const DEFAULT_SETTINGS = {
  enabled: true,
  autoDepersonalize: true,
  autoInjectQuery: false,
  panelCollapsed: false,
  intensity: 3,
  engines: {
    adjacent: true,
    contrarian: true,
    random: true,
    reflective: true
  }
};

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.sync.get("settings");
  if (!stored.settings) {
    await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
    return;
  }

  const mergedSettings = {
    ...DEFAULT_SETTINGS,
    ...stored.settings,
    engines: {
      ...DEFAULT_SETTINGS.engines,
      ...(stored.settings.engines || {})
    }
  };

  await chrome.storage.sync.set({ settings: mergedSettings });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "GET_SETTINGS") {
    chrome.storage.sync.get("settings").then((stored) => {
      sendResponse(stored.settings || DEFAULT_SETTINGS);
    });

    return true;
  }

  return false;
});

function isGoogleSearchSurface(urlString) {
  try {
    const url = new URL(urlString);
    if (url.hostname !== "www.google.com") {
      return false;
    }

    return url.pathname === "/" || url.pathname.startsWith("/search") || url.pathname.startsWith("/ai");
  } catch {
    return false;
  }
}

async function injectIntoTab(tabId, urlString) {
  if (!isGoogleSearchSurface(urlString)) {
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: {
        tabId,
        allFrames: true
      },
      files: ["content.js"]
    });
  } catch (_error) {
    // Ignore injection misses for frames/documents Chrome won't allow.
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const candidateUrl = changeInfo.url || tab.url;
  if (changeInfo.status !== "complete" && !changeInfo.url) {
    return;
  }

  injectIntoTab(tabId, candidateUrl);
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  injectIntoTab(details.tabId, details.url);
});

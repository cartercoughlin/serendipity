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

const INTENSITY_COPY = {
  1: "1: light drift",
  2: "2: modest disruption",
  3: "3: balanced remix",
  4: "4: strong divergence",
  5: "5: maximum weirdness"
};

const elements = {
  enabled: document.getElementById("enabled"),
  autoDepersonalize: document.getElementById("autoDepersonalize"),
  autoInjectQuery: document.getElementById("autoInjectQuery"),
  intensity: document.getElementById("intensity"),
  intensityValue: document.getElementById("intensityValue"),
  adjacent: document.getElementById("adjacent"),
  contrarian: document.getElementById("contrarian"),
  reflective: document.getElementById("reflective"),
  random: document.getElementById("random"),
  status: document.getElementById("status")
};

function renderIntensity(value) {
  elements.intensityValue.textContent = INTENSITY_COPY[value];
}

async function readSettings() {
  const { settings } = await chrome.storage.sync.get("settings");
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    engines: {
      ...DEFAULT_SETTINGS.engines,
      ...(settings?.engines || {})
    }
  };
}

async function writeSettings(settings) {
  await chrome.storage.sync.set({ settings });
  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
    url: ["https://www.google.com/search*", "https://www.google.com/ai*"]
  });

  if (tabs[0]?.id) {
    await chrome.tabs.reload(tabs[0].id);
  }

  elements.status.textContent = "Saved.";
  window.setTimeout(() => {
    if (elements.status.textContent === "Saved.") {
      elements.status.textContent = "";
    }
  }, 1200);
}

function collectSettings() {
  return {
    enabled: elements.enabled.checked,
    autoDepersonalize: elements.autoDepersonalize.checked,
    autoInjectQuery: elements.autoInjectQuery.checked,
    intensity: Number(elements.intensity.value),
    engines: {
      adjacent: elements.adjacent.checked,
      contrarian: elements.contrarian.checked,
      reflective: elements.reflective.checked,
      random: elements.random.checked
    }
  };
}

function bindAutosave() {
  Object.values(elements).forEach((element) => {
    if (!element || element === elements.status || element === elements.intensityValue) {
      return;
    }

    element.addEventListener("change", async () => {
      renderIntensity(Number(elements.intensity.value));
      await writeSettings(collectSettings());
    });
  });

  elements.intensity.addEventListener("input", () => {
    renderIntensity(Number(elements.intensity.value));
  });
}

async function init() {
  const settings = await readSettings();
  elements.enabled.checked = settings.enabled;
  elements.autoDepersonalize.checked = settings.autoDepersonalize;
  elements.autoInjectQuery.checked = settings.autoInjectQuery;
  elements.intensity.value = settings.intensity;
  elements.adjacent.checked = settings.engines.adjacent;
  elements.contrarian.checked = settings.engines.contrarian;
  elements.reflective.checked = settings.engines.reflective;
  elements.random.checked = settings.engines.random;
  renderIntensity(settings.intensity);
  bindAutosave();
}

init();

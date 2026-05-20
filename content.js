if (window.__serendipityContentLoaded) {
  void 0;
} else {
  window.__serendipityContentLoaded = true;

const PANEL_ID = "serendipity-panel";
const PANEL_HOST_ID = "serendipity-panel-host";
const STYLE_ID = "serendipity-style";
const AUTO_INJECT_MARKER = "data-serendipity-injected";
const AUTO_INJECT_BOUND = "data-serendipity-auto-inject-bound";
const ROOT_QUERY_PARAM = "serendipity_root";
let lastProcessedLocation = "";
let lastProcessedQuery = "";
let lifecycleObserversStarted = false;
let refreshTimer = null;

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "their",
  "this",
  "to",
  "what",
  "when",
  "where",
  "who",
  "why",
  "with"
]);

const NAVIGATION_TOKENS = new Set([
  "amazon",
  "asana",
  "discord",
  "docs",
  "drive",
  "dropbox",
  "facebook",
  "figma",
  "github",
  "gmail",
  "google",
  "hubspot",
  "instagram",
  "jira",
  "linkedin",
  "mail",
  "maps",
  "notion",
  "outlook",
  "reddit",
  "salesforce",
  "shopify",
  "slack",
  "sheets",
  "slides",
  "spotify",
  "trello",
  "twitter",
  "wikipedia",
  "youtube",
  "zoom"
]);

const NAVIGATION_PHRASES = [
  "log in",
  "login",
  "sign in",
  "sign into",
  "open ",
  "go to ",
  "gmail",
  "google docs",
  "google drive",
  "google slides",
  "google sheets",
  "salesforce",
  "slack"
];

const DOMAIN_KEYWORDS = {
  geopolitics: [
    "country",
    "war",
    "government",
    "sanctions",
    "iran",
    "israel",
    "russia",
    "china",
    "ukraine",
    "election",
    "policy",
    "military",
    "diplomacy",
    "border",
    "conflict"
  ],
  consumer: [
    "buy",
    "best",
    "price",
    "review",
    "vs",
    "versus",
    "shoe",
    "shoes",
    "phone",
    "laptop",
    "headphones",
    "camera",
    "mattress",
    "watch"
  ],
  technology: [
    "ai",
    "software",
    "programming",
    "code",
    "developer",
    "cloud",
    "api",
    "app",
    "startup",
    "chip",
    "computer",
    "model",
    "search",
    "google"
  ],
  science: [
    "biology",
    "physics",
    "chemistry",
    "crispr",
    "genetics",
    "climate",
    "research",
    "study",
    "experiment",
    "quantum",
    "species",
    "ecology"
  ],
  health: [
    "health",
    "diet",
    "sleep",
    "anxiety",
    "depression",
    "workout",
    "running",
    "nutrition",
    "symptoms",
    "doctor",
    "medicine",
    "treatment"
  ],
  finance: [
    "stock",
    "investing",
    "market",
    "economy",
    "finance",
    "money",
    "business",
    "company",
    "revenue",
    "inflation",
    "tariff",
    "crypto"
  ],
  culture: [
    "movie",
    "music",
    "book",
    "novel",
    "art",
    "fashion",
    "poetry",
    "religion",
    "philosophy",
    "history",
    "language"
  ]
};

const DOMAIN_FACETS = {
  general: {
    adjacent: [
      "{topic} in daily life",
      "hidden histories of {topic}",
      "{topic} through culture",
      "{topic} on the ground",
      "how {topic} shows up in practice",
      "{topic} outside the headline version"
    ],
    contrarian: [
      "critiques of {topic}",
      "{topic} what gets overstated",
      "{topic} limits and tradeoffs",
      "who pushes back on {topic}",
      "{topic} unintended consequences",
      "{topic} what the mainstream framing misses"
    ],
    reflective: [
      "{topic} from another point of view",
      "{topic} through personal stories",
      "{topic} without the usual assumptions",
      "{topic} for a first-time learner",
      "{topic} in human terms",
      "{topic} from the margins"
    ],
    random: [
      "{topic} in literature and film",
      "{topic} through folklore",
      "{topic} and game design",
      "{topic} as a systems problem",
      "{topic} in speculative fiction",
      "{topic} through anthropology"
    ]
  },
  geopolitics: {
    adjacent: [
      "{topic} through ordinary life",
      "historical turning points in {topic}",
      "{topic} through regional neighbors",
      "{topic} cultural life and identity",
      "{topic} beyond foreign policy",
      "{topic} inside domestic politics"
    ],
    contrarian: [
      "{topic} dissenting voices",
      "{topic} policy failures and blowback",
      "{topic} contested narratives",
      "{topic} who benefits and who pays",
      "{topic} unintended regional effects",
      "{topic} arguments against the dominant view"
    ],
    reflective: [
      "{topic} from the perspective of ordinary people",
      "{topic} through family and memory",
      "{topic} without great-power framing",
      "{topic} through local journalists and writers",
      "{topic} in lived experience",
      "{topic} outside crisis language"
    ],
    random: [
      "{topic} in cinema and literature",
      "{topic} through architecture and cities",
      "{topic} and water geography",
      "{topic} through food and ritual",
      "{topic} in maps and border stories",
      "{topic} through migration stories"
    ]
  },
  consumer: {
    adjacent: [
      "{topic} long-term ownership",
      "{topic} for unusual use cases",
      "{topic} what enthusiasts notice",
      "{topic} in daily routines",
      "{topic} alternatives people overlook",
      "{topic} beyond spec sheets"
    ],
    contrarian: [
      "{topic} buyer regrets",
      "{topic} where reviews mislead",
      "{topic} tradeoffs people ignore",
      "{topic} when not to buy",
      "{topic} hidden costs and annoyances",
      "{topic} arguments against the hype"
    ],
    reflective: [
      "{topic} for a beginner",
      "{topic} for someone on a budget",
      "{topic} through accessibility needs",
      "{topic} in real life rather than reviews",
      "{topic} with fewer assumptions",
      "{topic} for a different kind of buyer"
    ],
    random: [
      "{topic} in repair culture",
      "{topic} and material design",
      "{topic} through sustainability",
      "{topic} in subcultures",
      "{topic} and secondhand markets",
      "{topic} through industrial design"
    ]
  },
  technology: {
    adjacent: [
      "{topic} in real workflows",
      "{topic} through developer experience",
      "{topic} historical roots",
      "{topic} beyond product demos",
      "{topic} in small teams",
      "{topic} cultural impact"
    ],
    contrarian: [
      "{topic} failure cases",
      "{topic} what skeptics are right about",
      "{topic} adoption tradeoffs",
      "{topic} security and misuse concerns",
      "{topic} where the narrative breaks down",
      "{topic} what the benchmarks hide"
    ],
    reflective: [
      "{topic} for non-experts",
      "{topic} in human terms",
      "{topic} through worker experience",
      "{topic} without hype language",
      "{topic} from a user's perspective",
      "{topic} for people affected but not building it"
    ],
    random: [
      "{topic} through design fiction",
      "{topic} in science fiction",
      "{topic} and labor history",
      "{topic} as infrastructure",
      "{topic} through philosophy",
      "{topic} in classrooms and public life"
    ]
  },
  science: {
    adjacent: [
      "{topic} in the history of science",
      "{topic} in the field and not just the lab",
      "{topic} through real-world applications",
      "{topic} what beginners miss",
      "{topic} across disciplines",
      "{topic} in public understanding"
    ],
    contrarian: [
      "{topic} replication and uncertainty",
      "{topic} ethical tradeoffs",
      "{topic} what the evidence cannot yet say",
      "{topic} scientific criticism",
      "{topic} edge cases and failure modes",
      "{topic} where consensus is weaker than it sounds"
    ],
    reflective: [
      "{topic} explained through a human story",
      "{topic} without technical jargon",
      "{topic} from the researcher's perspective",
      "{topic} for someone new to the field",
      "{topic} in plain language",
      "{topic} through lived stakes"
    ],
    random: [
      "{topic} in art and metaphor",
      "{topic} through philosophy of science",
      "{topic} and public imagination",
      "{topic} in museums and education",
      "{topic} through fiction",
      "{topic} across unexpected organisms and systems"
    ]
  }
};

const REMIX_ENGINES = {
  adjacent: {
    label: "Side Path",
    note: "A nearby lens that shifts the frame without leaving the topic behind."
  },
  contrarian: {
    label: "Countercurrent",
    note: "A route through tension, tradeoffs, critique, and resistance."
  },
  reflective: {
    label: "Reframe",
    note: "A softer shift that changes perspective instead of piling on more keywords."
  },
  random: {
    label: "Drift",
    note: "A deliberate lateral jump into another domain to see what unexpectedly connects."
  }
};

function readQuery() {
  const params = new URLSearchParams(window.location.search);
  const paramQuery = (params.get("q") || "").trim();
  if (paramQuery) {
    return paramQuery;
  }

  const input = document.querySelector(
    'input[name="q"], textarea[name="q"], textarea[aria-label*="Ask" i], input[aria-label*="Ask" i], textarea, input[type="search"]'
  );
  return input ? normalizeWhitespace(input.value) : "";
}

function readRootQuery() {
  const params = new URLSearchParams(window.location.search);
  const rootQuery = normalizeWhitespace(params.get(ROOT_QUERY_PARAM) || "");
  return rootQuery || readQuery();
}

function createSeed(input) {
  return input.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function tokenize(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter(Boolean);
}

function dedupeWords(value) {
  const seen = new Set();
  const tokens = normalizeWhitespace(value).split(" ");
  const kept = [];

  tokens.forEach((token) => {
    const normalized = token.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, "");
    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    kept.push(token);
  });

  return kept.join(" ");
}

function stripKnownModifiers(query) {
  return normalizeWhitespace(
    query
      .replace(/\bsurprising perspectives?\b/gi, "")
      .replace(/\bcounterarguments?\b/gi, "")
      .replace(/\bfailures?\b/gi, "")
      .replace(/\bethical concerns?\b/gi, "")
      .replace(/\bhistory\b/gi, "")
      .replace(/\bcase study\b/gi, "")
      .replace(/\bunusual examples?\b/gi, "")
      .replace(/\bcultural impact\b/gi, "")
      .replace(/\bdownsides?\b/gi, "")
      .replace(/\bskeptical view\b/gi, "")
  );
}

function extractBaseTopic(query) {
  const stripped = stripKnownModifiers(query);
  const cleaned = dedupeWords(stripped);
  return cleaned || dedupeWords(query) || query.trim();
}

function inferDomain(tokens) {
  const scores = Object.fromEntries(Object.keys(DOMAIN_KEYWORDS).map((key) => [key, 0]));

  tokens.forEach((token) => {
    Object.entries(DOMAIN_KEYWORDS).forEach(([domain, keywords]) => {
      if (keywords.includes(token)) {
        scores[domain] += 1;
      }
    });
  });

  let bestDomain = "general";
  let bestScore = 0;

  Object.entries(scores).forEach(([domain, score]) => {
    if (score > bestScore) {
      bestDomain = domain;
      bestScore = score;
    }
  });

  return bestDomain;
}

function inferIntent(tokens, query) {
  const lowered = query.toLowerCase();
  if (isNavigationalUtilityQuery(tokens, lowered)) {
    return "navigation";
  }

  if (/\b(vs|versus|compare|comparison)\b/.test(lowered)) {
    return "comparison";
  }

  if (/\b(best|top|recommend|buy|worth it)\b/.test(lowered)) {
    return "recommendation";
  }

  if (/\bwhy|how|what|when|who\b/.test(lowered)) {
    return "question";
  }

  if (/\bnews|latest|today|2026|update\b/.test(lowered)) {
    return "current";
  }

  if (tokens.length <= 2) {
    return "broad";
  }

  return "explainer";
}

function isLikelyUrl(query) {
  return /\b[a-z0-9-]+\.(com|org|net|io|ai|app|dev|co)\b/i.test(query);
}

function isNavigationalUtilityQuery(tokens, loweredQuery) {
  if (isLikelyUrl(loweredQuery)) {
    return true;
  }

  if (tokens.length <= 3 && tokens.some((token) => NAVIGATION_TOKENS.has(token))) {
    return true;
  }

  if (tokens.length <= 5 && /^open\s+/.test(loweredQuery)) {
    return true;
  }

  if (tokens.length <= 5 && /^(go to|login|log in|sign in|sign into)\b/.test(loweredQuery)) {
    return true;
  }

  return NAVIGATION_PHRASES.some((phrase) => loweredQuery === phrase || loweredQuery.startsWith(phrase));
}

function intentPrefix(intent, engineName, domain) {
  if (intent === "comparison" && domain === "consumer" && engineName === "contrarian") {
    return "before choosing,";
  }

  if (intent === "recommendation" && engineName === "reflective") {
    return "for a different kind of answer,";
  }

  if (intent === "current" && domain === "geopolitics" && engineName === "adjacent") {
    return "beyond today's headlines,";
  }

  if (intent === "question" && engineName === "random") {
    return "unexpectedly,";
  }

  return "";
}

function renderFacet(template, topic, intent, engineName, domain) {
  const prefix = intentPrefix(intent, engineName, domain);
  const rendered = template.replaceAll("{topic}", topic);
  return normalizeWhitespace([prefix, rendered].filter(Boolean).join(" "));
}

function semanticSeed(topic, engineName, domain, intent) {
  return createSeed([topic, engineName, domain, intent].join("|"));
}

function pickMany(list, count, seed) {
  const copy = [...list];
  const selected = [];
  let cursor = seed || 1;

  while (copy.length && selected.length < count) {
    cursor = (cursor * 9301 + 49297) % 233280;
    const index = cursor % copy.length;
    selected.push(copy.splice(index, 1)[0]);
  }

  return selected;
}

function getGoogleOrigin() {
  return `${window.location.protocol}//${window.location.host}`;
}

function buildSearchUrl(query, depersonalized = true, rootQuery = query) {
  const url = new URL("/search", getGoogleOrigin());
  url.searchParams.set("q", query);
  url.searchParams.set(ROOT_QUERY_PARAM, rootQuery);
  if (depersonalized) {
    url.searchParams.set("pws", "0");
  }
  return url.toString();
}

function isDepersonalizedSearch() {
  const params = new URLSearchParams(window.location.search);
  return params.get("pws") === "0";
}

function isSuppressedSearchSurface() {
  const params = new URLSearchParams(window.location.search);
  const tbm = params.get("tbm");
  return tbm === "isch" || tbm === "shop" || tbm === "vid";
}

function isAiModeSurface() {
  const params = new URLSearchParams(window.location.search);
  return window.location.pathname.startsWith("/ai") || params.get("udm") === "50";
}

function removePanel() {
  const existing = document.getElementById(PANEL_ID);
  if (existing) {
    existing.remove();
  }

  const host = document.getElementById(PANEL_HOST_ID);
  if (host) {
    host.remove();
  }
}

function findRenderTarget() {
  if (isAiModeSurface()) {
    return (
      document.querySelector('[role="main"]') ||
      document.querySelector("main") ||
      document.querySelector("body")
    );
  }

  return (
    document.getElementById("search") ||
    document.querySelector('[role="main"]') ||
    document.querySelector("main") ||
    document.body
  );
}

async function persistPanelCollapsed(collapsed) {
  const stored = await chrome.storage.sync.get("settings");
  const current = stored.settings || {};
  await chrome.storage.sync.set({
    settings: {
      ...current,
      panelCollapsed: collapsed
    }
  });
}

function buildVariantQueries(query, intensity, engines) {
  const topic = extractBaseTopic(query);
  const tokens = tokenize(topic).filter((token) => !STOP_WORDS.has(token));
  const domain = inferDomain(tokens);
  const intent = inferIntent(tokens, query);
  const count = Math.max(2, Math.min(intensity + 1, 4));
  const variants = [];
  const domainFacets = DOMAIN_FACETS[domain] || DOMAIN_FACETS.general;
  const generalFacets = DOMAIN_FACETS.general;

  Object.entries(REMIX_ENGINES).forEach(([engineName, config], index) => {
    if (!engines[engineName]) {
      return;
    }

    const sourceFacets = [
      ...(domainFacets[engineName] || []),
      ...(generalFacets[engineName] || [])
    ];

    pickMany(sourceFacets, count, semanticSeed(topic, engineName, domain, intent) + index * 17).forEach((template) => {
      variants.push({
        label: config.label,
        query: dedupeWords(renderFacet(template, topic, intent, engineName, domain)),
        note: config.note,
        domain,
        intent
      });
    });
  });

  return variants.slice(0, count * 2);
}

function chooseInjectedQuery(query, settings) {
  const variants = buildVariantQueries(query, settings.intensity, settings.engines);
  if (!variants.length) {
    return query;
  }

  const topic = extractBaseTopic(query);
  const seed = createSeed(topic);
  return variants[seed % variants.length].query;
}

function rewriteSearchInput(input, settings) {
  if (!input) {
    return false;
  }

  const originalQuery = normalizeWhitespace(input.value);
  if (!originalQuery || input.getAttribute(AUTO_INJECT_MARKER) === "true") {
    return false;
  }

  const topicTokens = tokenize(originalQuery).filter((token) => !STOP_WORDS.has(token));
  if (inferIntent(topicTokens, originalQuery) === "navigation") {
    return false;
  }

  const remixedQuery = chooseInjectedQuery(originalQuery, settings);
  if (!remixedQuery || remixedQuery === originalQuery) {
    return false;
  }

  input.value = remixedQuery;
  input.setAttribute(AUTO_INJECT_MARKER, "true");
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));

  const form = input.form;
  if (form) {
    let rootInput = form.querySelector(`input[name="${ROOT_QUERY_PARAM}"]`);
    if (!rootInput) {
      rootInput = document.createElement("input");
      rootInput.type = "hidden";
      rootInput.name = ROOT_QUERY_PARAM;
      form.appendChild(rootInput);
    }

    rootInput.value = originalQuery;
  }

  return true;
}

function bindAutoInject(settings) {
  if (!settings.autoInjectQuery) {
    return;
  }

  const bindForm = (form) => {
    if (!form || form.getAttribute(AUTO_INJECT_BOUND) === "true") {
      return;
    }

    form.setAttribute(AUTO_INJECT_BOUND, "true");

    form.addEventListener("submit", () => {
      const input = form.querySelector('input[name="q"], textarea[name="q"]');
      rewriteSearchInput(input, settings);
    }, true);

    form.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }

      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
        return;
      }

      if (target.name !== "q") {
        return;
      }

      rewriteSearchInput(target, settings);
    }, true);

    form.addEventListener("click", (event) => {
      const submitControl = event.target instanceof Element
        ? event.target.closest('button[type="submit"], input[type="submit"], input[name="btnK"]')
        : null;

      if (!submitControl) {
        return;
      }

      const input = form.querySelector('input[name="q"], textarea[name="q"]');
      rewriteSearchInput(input, settings);
    }, true);

    const input = form.querySelector('input[name="q"], textarea[name="q"]');
    if (input) {
      input.addEventListener("input", () => {
        input.removeAttribute(AUTO_INJECT_MARKER);
      });
    }
  };

  const bindAllForms = () => {
    const forms = Array.from(document.querySelectorAll('form[role="search"], form[action="/search"], form'));
    forms.forEach((form) => {
      const queryInput = form.querySelector('input[name="q"], textarea[name="q"]');
      if (!queryInput) {
        return;
      }

      bindForm(form);
    });
  };

  bindAllForms();

  const observer = new MutationObserver(() => {
    bindAllForms();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${PANEL_ID} {
      margin: 16px 0 24px;
      padding: 20px;
      border-radius: 20px;
      border: 1px solid #eadfce;
      background:
        radial-gradient(circle at top right, rgba(214, 127, 36, 0.14), transparent 34%),
        radial-gradient(circle at bottom left, rgba(121, 78, 43, 0.1), transparent 36%),
        linear-gradient(135deg, #fff9f1 0%, #fffdf9 72%);
      color: #2d2117;
      font-family: "Avenir Next", "Segoe UI", sans-serif;
      box-shadow: 0 14px 34px rgba(74, 46, 24, 0.08);
    }

    #${PANEL_ID} * {
      box-sizing: border-box;
    }

    .serendipity-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: baseline;
      margin-bottom: 12px;
    }

    .serendipity-header-main {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .serendipity-header-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .serendipity-title {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    .serendipity-mark {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      margin-right: 10px;
      border-radius: 999px;
      background: #f1e2d2;
      color: #7a3f19;
      font-size: 17px;
      vertical-align: text-bottom;
    }

    .serendipity-subtitle {
      max-width: 60ch;
      font-size: 13px;
      line-height: 1.5;
      color: #6d5742;
      margin-bottom: 18px;
    }

    .serendipity-status {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      padding: 5px 10px;
      border-radius: 999px;
      background: #f3eee7;
      color: #7b6551;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }

    .serendipity-toggle {
      border: 1px solid rgba(122, 63, 25, 0.14);
      background: rgba(255, 251, 246, 0.95);
      color: #7a3f19;
      min-height: 32px;
      padding: 0 12px;
      border-radius: 999px;
      font: inherit;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
    }

    .serendipity-toggle:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 18px rgba(122, 63, 25, 0.12);
      background: #fff7ee;
    }

    .serendipity-body[data-collapsed="true"] {
      display: none;
    }

    .serendipity-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 16px;
    }

    .serendipity-button,
    .serendipity-link,
    .serendipity-state {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 38px;
      padding: 0 14px;
      border-radius: 999px;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
    }

    .serendipity-button {
      border: 0;
      background: #7a3f19;
      color: #fffaf4;
      cursor: pointer;
    }

    .serendipity-link {
      background: #f4e8d9;
      color: #7a3f19;
    }

    .serendipity-state {
      background: #f3eee7;
      color: #7b6551;
      cursor: default;
    }

    .serendipity-button:visited,
    .serendipity-link:visited,
    .serendipity-query:visited {
      color: inherit;
    }

    .serendipity-button:hover,
    .serendipity-link:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 22px rgba(122, 63, 25, 0.14);
    }

    .serendipity-button:hover {
      background: #8b4a1c;
    }

    .serendipity-link:hover {
      background: #efdeca;
    }

    .serendipity-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }

    .serendipity-card {
      padding: 14px;
      border-radius: 16px;
      background: rgba(255, 252, 248, 0.92);
      border: 1px solid rgba(122, 63, 25, 0.1);
    }

    .serendipity-chip {
      display: inline-block;
      margin-bottom: 8px;
      padding: 4px 8px;
      border-radius: 999px;
      background: #f1e2d2;
      color: #8a4f27;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .serendipity-query {
      display: block;
      margin-bottom: 6px;
      color: #2d2117;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      line-height: 1.35;
    }

    .serendipity-query:hover {
      color: #7a3f19;
      text-decoration: underline;
      text-decoration-color: rgba(122, 63, 25, 0.35);
    }

    .serendipity-note {
      margin: 0;
      color: #7b6551;
      font-size: 12px;
      line-height: 1.45;
    }

    #${PANEL_HOST_ID} {
      all: initial;
    }

    #${PANEL_ID}[data-ai-surface="true"] {
      position: fixed;
      top: 88px;
      right: 20px;
      z-index: 2147483646;
      width: min(380px, calc(100vw - 24px));
      max-height: calc(100vh - 120px);
      overflow: auto;
      margin: 0;
    }

    #${PANEL_ID}[data-ai-surface="true"] .serendipity-grid {
      grid-template-columns: 1fr;
    }

    @media (max-width: 900px) {
      #${PANEL_ID}[data-ai-surface="true"] {
        top: auto;
        right: 12px;
        bottom: 12px;
        left: 12px;
        width: auto;
        max-height: 52vh;
      }
    }
  `;

  document.head.appendChild(style);
}

function renderPanel(query, settings) {
  removePanel();

  ensureStyles();

  const panel = document.createElement("section");
  panel.id = PANEL_ID;
  const aiSurface = isAiModeSurface();
  panel.setAttribute("data-ai-surface", aiSurface ? "true" : "false");

  const rootQuery = readRootQuery();
  const variants = buildVariantQueries(rootQuery, settings.intensity, settings.engines);
  const baseTopic = extractBaseTopic(rootQuery);
  const topicTokens = tokenize(baseTopic).filter((token) => !STOP_WORDS.has(token));
  const navigational = inferIntent(topicTokens, rootQuery) === "navigation";
  const depersonalized = isDepersonalizedSearch();
  const depersonalizedUrl = buildSearchUrl(query, true, rootQuery);
  const personalizationControl = depersonalized
    ? `<span class="serendipity-state">${
        settings.autoDepersonalize
          ? "Re-ran with reduced personalization"
          : "Reduced personalization active"
      }</span>`
    : `<a class="serendipity-button" href="${depersonalizedUrl}">Less personalized</a>`;
  const subtitle = depersonalized && settings.autoDepersonalize
    ? "Your original search was automatically re-run with less personalization. These pivots now branch from that cleaner starting point."
    : "Break the feedback loop. These pivots pull the query toward side paths, disagreement, and stranger territory.";
  const status = navigational && settings.autoInjectQuery
    ? '<div class="serendipity-status">Utility query detected: remix skipped</div>'
    : "";
  const toggleLabel = settings.panelCollapsed ? "Expand" : "Collapse";

  panel.innerHTML = `
    <div class="serendipity-header">
      <div class="serendipity-header-main">
        <div class="serendipity-title"><span class="serendipity-mark">🪩</span>Serendipity mode</div>
        ${status}
      </div>
      <div class="serendipity-header-meta">
        <div>Intensity ${settings.intensity}/5</div>
        <button class="serendipity-toggle" type="button" aria-expanded="${settings.panelCollapsed ? "false" : "true"}">
          ${toggleLabel}
        </button>
      </div>
    </div>
    <div class="serendipity-body" data-collapsed="${settings.panelCollapsed ? "true" : "false"}">
      <div class="serendipity-subtitle">
        ${subtitle}
      </div>
      <div class="serendipity-actions">
        ${personalizationControl}
        <a class="serendipity-link" href="${buildSearchUrl(`unexpected angles on ${baseTopic}`, true, rootQuery)}">Surprise me</a>
      </div>
      <div class="serendipity-grid">
        ${variants
          .map(
            (variant) => `
              <article class="serendipity-card">
                <span class="serendipity-chip">${variant.label}</span>
                <a
                  class="serendipity-query"
                  href="${buildSearchUrl(variant.query, true, rootQuery)}"
                >
                  ${variant.query}
                </a>
                <p class="serendipity-note">${variant.note}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </div>
  `;

  if (aiSurface) {
    const host = document.createElement("div");
    host.id = PANEL_HOST_ID;
    host.appendChild(panel);
    document.documentElement.appendChild(host);
  } else {
    const target = findRenderTarget();
    if (!target) {
      return;
    }

    target.prepend(panel);
  }

  const toggle = panel.querySelector(".serendipity-toggle");
  const body = panel.querySelector(".serendipity-body");
  if (toggle && body) {
    toggle.addEventListener("click", async () => {
      const collapsed = body.getAttribute("data-collapsed") !== "true";
      body.setAttribute("data-collapsed", collapsed ? "true" : "false");
      toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
      toggle.textContent = collapsed ? "Expand" : "Collapse";
      await persistPanelCollapsed(collapsed);
    });
  }
}

function maybeDepersonalize(settings) {
  if (!settings.autoDepersonalize) {
    return false;
  }

  const url = new URL(window.location.href);
  if (url.searchParams.get("pws") === "0") {
    return false;
  }

  url.searchParams.set("pws", "0");
  window.location.replace(url.toString());
  return true;
}

function bindLocationListeners(settings) {
  if (window.__serendipityHistoryBound) {
    return;
  }

  window.__serendipityHistoryBound = true;

  const rerender = () => {
    window.setTimeout(() => {
      refreshPage(settings);
    }, 60);
  };

  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    const result = originalPushState.apply(this, args);
    rerender();
    return result;
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    const result = originalReplaceState.apply(this, args);
    rerender();
    return result;
  };

  window.addEventListener("popstate", rerender);
}

function startLifecycleObservers(settings) {
  if (lifecycleObserversStarted) {
    return;
  }

  lifecycleObserversStarted = true;
  bindLocationListeners(settings);

  const observer = new MutationObserver((mutations) => {
    const onlySerendipityMutations = mutations.every((mutation) => {
      const target = mutation.target;
      if (!(target instanceof Element)) {
        return false;
      }

      return Boolean(target.closest(`#${PANEL_HOST_ID}, #${PANEL_ID}`));
    });

    if (onlySerendipityMutations) {
      return;
    }

    const currentLocation = `${window.location.pathname}${window.location.search}`;
    const query = readQuery();

    if (currentLocation !== lastProcessedLocation || query !== lastProcessedQuery) {
      if (refreshTimer) {
        window.clearTimeout(refreshTimer);
      }

      refreshTimer = window.setTimeout(() => {
        refreshTimer = null;
        refreshPage(settings);
      }, 80);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

function refreshPage(settings) {
  lastProcessedLocation = `${window.location.pathname}${window.location.search}`;

  const query = readQuery();
  lastProcessedQuery = query;
  if (!query) {
    removePanel();
    return;
  }

  if (isSuppressedSearchSurface()) {
    removePanel();
    return;
  }

  if (!isAiModeSurface() && maybeDepersonalize(settings)) {
    return;
  }

  renderPanel(query, settings);
}

async function init() {
  const settings = await chrome.runtime.sendMessage({ type: "GET_SETTINGS" });
  if (!settings?.enabled) {
    return;
  }

  bindAutoInject(settings);
  startLifecycleObservers(settings);
  refreshPage(settings);
}

init();
}

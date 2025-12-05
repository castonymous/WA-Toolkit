// -------------------------------------------------------------
// 1. WA shortcut helpers
// -------------------------------------------------------------
function fireShortcut(key, opts = {}) {
  const k = key.toUpperCase();
  const base = {
    key: k,
    code: "Key" + k,
    keyCode: k.charCodeAt(0),
    which: k.charCodeAt(0),
    bubbles: true,
    cancelable: true,
    ...opts,
  };

  ["keydown", "keyup"].forEach((type) => {
    document.dispatchEvent(new KeyboardEvent(type, base));
  });
}

// WA Web shortcuts (default bawaan WA Web)
function doArchiveChat() {
  // Arsipkan chat → Ctrl+Alt+Shift+E
  fireShortcut("e", { ctrlKey: true, altKey: true, shiftKey: true });
}

function doMarkUnread() {
  // Tandai belum dibaca → Ctrl+Alt+Shift+U
  fireShortcut("u", { ctrlKey: true, altKey: true, shiftKey: true });
}

function doLabelChat() {
  // Labeli obrolan → Ctrl+Alt+Shift+L
  fireShortcut("l", { ctrlKey: true, altKey: true, shiftKey: true });
}

function doProfileAbout() {
  // Profil & Tentang → Ctrl+Alt+P
  fireShortcut("p", { ctrlKey: true, altKey: true });
}

// -------------------------------------------------------------
// 2. Scroll helpers (brute-force ke semua elemen scrollable)
// -------------------------------------------------------------
function scrollAllScrollableBottomInstant() {
  document.querySelectorAll("*").forEach((el) => {
    const sh = el.scrollHeight;
    const ch = el.clientHeight;
    if (sh > ch + 50) {
      el.scrollTop = sh;
    }
  });
}

function scrollAllScrollableBottomSmooth() {
  document.querySelectorAll("*").forEach((el) => {
    const sh = el.scrollHeight;
    const ch = el.clientHeight;
    if (sh > ch + 50) {
      try {
        el.scrollTo({ top: sh, behavior: "smooth" });
      } catch {
        el.scrollTop = sh;
      }
    }
  });
}

function scrollAllScrollableTopInstant() {
  document.querySelectorAll("*").forEach((el) => {
    const sh = el.scrollHeight;
    const ch = el.clientHeight;
    if (sh > ch + 50) {
      el.scrollTop = 0;
    }
  });
}

function scrollAllScrollableTopSmooth() {
  document.querySelectorAll("*").forEach((el) => {
    const sh = el.scrollHeight;
    const ch = el.clientHeight;
    if (sh > ch + 50) {
      try {
        el.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        el.scrollTop = 0;
      }
    }
  });
}

// -------------------------------------------------------------
// 3. Inject CSS glass bar (ikon doang, tanpa label teks)
// -------------------------------------------------------------
function injectStyle() {
  if (document.getElementById("wa-glass-style")) return;

  const st = document.createElement("style");
  st.id = "wa-glass-style";
  st.textContent = `
    .wa-glass-bar {
      margin: 8px 12px 0;
      padding: 8px 12px;
      border-radius: 999px;
      background: radial-gradient(circle at 0% 0%, rgba(255,255,255,0.35), rgba(255,255,255,0.06));
      border: 1px solid rgba(255,255,255,0.35);
      box-shadow: 0 18px 45px rgba(0,0,0,0.45);
      backdrop-filter: blur(18px) saturate(180%);
      -webkit-backdrop-filter: blur(18px) saturate(180%);
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 400px;
      z-index: 9999;
    }

    .wa-glass-chip {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      border-radius: 999px;
      background: rgba(255,255,255,0.16);
      border: 1px solid rgba(255,255,255,0.35);
      font-size: 18px;
      cursor: pointer;
      color: #f5f5f7;
      transition: background .15s, transform .08s, box-shadow .15s;
      user-select: none;
    }
    .wa-glass-chip:hover {
      background: rgba(255,255,255,0.32);
      transform: translateY(-1px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.35);
    }
    .wa-glass-chip:active {
      transform: scale(.96);
      background: rgba(255,255,255,0.22);
      box-shadow: 0 4px 12px rgba(0,0,0,0.45);
    }
  `;
  document.head.appendChild(st);
}

// -------------------------------------------------------------
// 4. Factory bikin satu glass bar untuk lokasi tertentu
// -------------------------------------------------------------
function createGlassBar(location) {
  const bar = document.createElement("div");
  bar.className = "wa-glass-bar";
  bar.dataset.location = location; // "main" atau "archived"

  // Urutan: TOP | ARCHIVE | UNREAD | LABEL | PROFILE | BOTTOM
  bar.innerHTML = `
      <div class="wa-glass-chip" data-action="top">⤒</div>
      <div class="wa-glass-chip" data-action="archive">📂</div>
      <div class="wa-glass-chip" data-action="unread">⭕</div>
      <div class="wa-glass-chip" data-action="label">🏷️</div>
      <div class="wa-glass-chip" data-action="profile">👤</div>
      <div class="wa-glass-chip" data-action="bottom">⤓</div>
  `;

  // Klik: top/bottom juga ikut di sini, instant/smooth pakai Alt
  bar.addEventListener("click", (e) => {
    const btn = e.target.closest(".wa-glass-chip");
    if (!btn) return;

    const act = btn.dataset.action;
    const fast = e.altKey; // Alt+click = instant, click biasa = smooth

    switch (act) {
      case "archive":
        doArchiveChat();
        break;
      case "unread":
        doMarkUnread();
        break;
      case "label":
        doLabelChat();
        break;
      case "profile":
        doProfileAbout();
        break;
      case "bottom":
        if (fast) {
          scrollAllScrollableBottomInstant();
        } else {
          scrollAllScrollableBottomSmooth();
        }
        break;
      case "top":
        if (fast) {
          scrollAllScrollableTopInstant();
        } else {
          scrollAllScrollableTopSmooth();
        }
        break;
    }
  });

  return bar;
}

// -------------------------------------------------------------
// 5. Inject glass bar di MAIN & ARCHIVED
// -------------------------------------------------------------
function injectGlassBars() {
  injectStyle();

  const targets = [
    {
      selector: "div._ak9t", // search bar utama (chat aktif)
      location: "main",
    },
    {
      selector: "div.x889kno.x1xnnf8n.x1a8lsjc.x106a9eq", // container header arsip (dari kamu)
      location: "archived",
    },
  ];

  targets.forEach((t) => {
    const host = document.querySelector(t.selector);
    if (!host) return;

    // Cek apakah bar untuk lokasi ini sudah ada
    const exists = document.querySelector(
      `.wa-glass-bar[data-location="${t.location}"]`
    );
    if (exists) return;

    const bar = createGlassBar(t.location);
    host.insertAdjacentElement("afterend", bar);
  });
}

// -------------------------------------------------------------
// 6. Keyboard shortcuts: Alt+1..6
// -------------------------------------------------------------
document.addEventListener("keydown", (e) => {
  if (!e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) return;

  // Jangan ganggu kalau lagi ngetik
  const t = e.target;
  const edit =
    t.tagName === "INPUT" ||
    t.tagName === "TEXTAREA" ||
    t.isContentEditable;

  if (edit) return;

  switch (e.key) {
    case "1":
      e.preventDefault();
      doArchiveChat();
      break;
    case "2":
      e.preventDefault();
      doMarkUnread();
      break;
    case "3":
      e.preventDefault();
      doLabelChat();
      break;
    case "4":
      e.preventDefault();
      doProfileAbout();
      break;
    case "5":
      e.preventDefault();
      scrollAllScrollableBottomSmooth();
      break;
    case "6":
      e.preventDefault();
      scrollAllScrollableTopSmooth();
      break;
  }
});

// -------------------------------------------------------------
// 7. Pesan dari background (ikon ekstensi → Archive)
// -------------------------------------------------------------
chrome.runtime.onMessage.addListener((msg) => {
  if (!msg || !msg.type) return;

  if (msg.type === "TRIGGER_ARCHIVE") {
    doArchiveChat();
  }
});

// -------------------------------------------------------------
// 8. START + observer biar ikut hidup di arsip
// -------------------------------------------------------------
function startGlass() {
  injectGlassBars();

  // Observe perubahan layout, supaya kalau buka arsip / balik lagi, bar tetep diinject
  const root = document.body;
  if (!root) return;

  const obs = new MutationObserver(() => {
    injectGlassBars();
  });

  obs.observe(root, {
    childList: true,
    subtree: true,
  });
}

startGlass();

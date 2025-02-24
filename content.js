// Advanced language detection
function detectLanguage(text) {
  const rtlChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g; // RTL languages like Persian, Arabic
  const latinChars = /[a-zA-Z]/g;
  const rtlCount = (text.match(rtlChars) || []).length;
  const latinCount = (text.match(latinChars) || []).length;
  const total = rtlCount + latinCount;

  if (total === 0) return 'unknown';
  return rtlCount > latinCount * 0.2 ? 'rtl' : 'ltr'; // Adjusted threshold
}

// Apply text direction
function fixTextDirection(element, mode) {
  const text = element.textContent.trim();
  if (!text) return;

  const lang = detectLanguage(text);
  if (mode === 'auto') {
    if (lang === 'rtl') {
      element.style.direction = 'rtl';
      element.style.textAlign = 'right';
      if (/[a-zA-Z]/.test(text)) element.style.unicodeBidi = 'embed';
    } else if (lang === 'ltr') {
      element.style.direction = 'ltr';
      element.style.textAlign = 'left';
    }
  } else if (mode === 'manual') {
    element.dataset.rtlFixer = lang; // Store language for manual mode
  }
}

// Apply manual fixes
function applyManualFixes() {
  document.querySelectorAll('[data-rtl-fixer="rtl"]').forEach(el => {
    el.style.direction = 'rtl';
    el.style.textAlign = 'right';
    if (/[a-zA-Z]/.test(el.textContent)) el.style.unicodeBidi = 'embed';
  });
  document.querySelectorAll('[data-rtl-fixer="ltr"]').forEach(el => {
    el.style.direction = 'ltr';
    el.style.textAlign = 'left';
  });
}

// Reset changes
function resetChanges() {
  const elements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6, li, td, th');
  elements.forEach(el => {
    el.style.direction = ''; // Remove direction
    el.style.textAlign = ''; // Remove text alignment
    el.style.unicodeBidi = ''; // Remove unicode-bidi
    delete el.dataset.rtlFixer; // Remove language tag
  });
}

// Initial text direction fix
function initializeFix(mode) {
  chrome.storage.sync.get(['enabled', 'blacklist'], (data) => {
    const enabled = data.enabled !== false;
    const blacklist = data.blacklist || [];
    const hostname = window.location.hostname;
    if (!enabled || blacklist.includes(hostname)) return;

    const elements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6, li, td, th');
    elements.forEach((el) => fixTextDirection(el, mode));
  });
}

// Live monitoring with optimization
let observer;
function startObserver(mode) {
  if (observer) observer.disconnect();
  observer = new MutationObserver((mutations) => {
    chrome.storage.sync.get(['enabled', 'blacklist'], (data) => {
      const enabled = data.enabled !== false;
      const blacklist = data.blacklist || [];
      const hostname = window.location.hostname;
      if (!enabled || blacklist.includes(hostname)) return;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          const target = mutation.target;
          if (target.nodeType === Node.TEXT_NODE) {
            fixTextDirection(target.parentElement, mode);
          } else if (target.nodeType === Node.ELEMENT_NODE) {
            fixTextDirection(target, mode);
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: false // Optimize by disabling unnecessary checks
  });
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message) => {
  chrome.storage.sync.get(['mode'], (data) => {
    const currentMode = data.mode || 'auto';
    if (message.action === 'toggle') {
      if (message.enabled) {
        initializeFix(currentMode);
        startObserver(currentMode);
      } else if (observer) {
        observer.disconnect();
        observer = null;
      }
    } else if (message.action === 'mode') {
      initializeFix(message.mode);
      startObserver(message.mode);
    } else if (message.action === 'applyManual' && currentMode === 'manual') {
      applyManualFixes();
    } else if (message.action === 'resetChanges') {
      resetChanges();
    }
  });
});

// Start the extension
chrome.storage.sync.get(['mode'], (data) => {
  const mode = data.mode || 'auto';
  initializeFix(mode);
  startObserver(mode);
});
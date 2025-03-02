// Utility function for language detection
function detectLanguage(text) {
  const rtlChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g; // RTL languages like Persian, Arabic
  const latinChars = /[a-zA-Z]/g;
  const rtlCount = (text.match(rtlChars) || []).length;
  const latinCount = (text.match(latinChars) || []).length;
  const total = rtlCount + latinCount;

  return total === 0 ? 'unknown' : rtlCount > latinCount * 0.2 ? 'rtl' : 'ltr';
}

// Check if element is a code block
function isCodeElement(element) {
  const codeTags = ['CODE', 'PRE']; // Tags typically used for code
  const codeClasses = ['code', 'highlight', 'hljs', 'prettyprint']; // Common code-related classes
  return codeTags.includes(element.tagName) || 
         codeClasses.some(cls => element.classList.contains(cls)) ||
         element.closest('code, pre') !== null; // Check if inside a code/pre tag
}

// Apply text direction based on mode, excluding code blocks
function applyTextDirection(element, mode) {
  const text = element.textContent.trim();
  if (!text || isCodeElement(element)) return; // Skip if empty or a code block

  const lang = detectLanguage(text);
  if (mode === 'auto' && lang !== 'unknown') {
    element.style.direction = lang === 'rtl' ? 'rtl' : 'ltr';
    element.style.textAlign = lang === 'rtl' ? 'right' : 'left';
    if (lang === 'rtl' && /[a-zA-Z]/.test(text)) {
      element.style.unicodeBidi = 'embed';
    }
    chrome.storage.sync.set({ changesApplied: true });
    chrome.runtime.sendMessage({ action: 'changesApplied' });
  } else if (mode === 'manual') {
    element.dataset.rtlFixer = lang;
  }
}

// Apply manual fixes to tagged elements, excluding code blocks
function applyManualFixes() {
  const elements = document.querySelectorAll('[data-rtl-fixer]');
  elements.forEach(el => {
    if (isCodeElement(el)) return; // Skip code blocks
    const lang = el.dataset.rtlFixer;
    if (lang === 'rtl') {
      el.style.direction = 'rtl';
      el.style.textAlign = 'right';
      if (/[a-zA-Z]/.test(el.textContent)) el.style.unicodeBidi = 'embed';
    } else if (lang === 'ltr') {
      el.style.direction = 'ltr';
      el.style.textAlign = 'left';
    }
  });
  chrome.storage.sync.set({ changesApplied: true });
  chrome.runtime.sendMessage({ action: 'changesApplied' });
}

// Reset all applied changes
function resetChanges() {
  const elements = document.querySelectorAll('[data-rtl-fixer], [style*="direction"]');
  elements.forEach(el => {
    el.style.direction = '';
    el.style.textAlign = '';
    el.style.unicodeBidi = '';
    delete el.dataset.rtlFixer;
  });
  chrome.storage.sync.set({ changesApplied: false });
}

// Initialize text direction fixes
function initializeFix(mode) {
  chrome.storage.sync.get(['enabled', 'blacklist'], (data) => {
    if (!data.enabled || (data.blacklist && data.blacklist.includes(window.location.hostname))) return;
    const elements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6, li, td, th');
    elements.forEach(el => applyTextDirection(el, mode));
  });
}

// Optimized live monitoring
let observer;
function startObserver(mode) {
  if (observer) observer.disconnect();

  observer = new MutationObserver((mutations) => {
    chrome.storage.sync.get(['enabled', 'blacklist'], (data) => {
      if (!data.enabled || (data.blacklist && data.blacklist.includes(window.location.hostname))) return;

      mutations.forEach(mutation => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          const target = mutation.target;
          if (target.nodeType === Node.TEXT_NODE && target.parentElement) {
            applyTextDirection(target.parentElement, mode);
          } else if (target.nodeType === Node.ELEMENT_NODE && target.textContent.trim()) {
            applyTextDirection(target, mode);
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: false
  });
}

// Handle incoming messages from popup
function handleMessages(message) {
  chrome.storage.sync.get(['mode', 'enabled'], (data) => {
    const currentMode = data.mode || 'auto';
    const isEnabled = data.enabled !== false;
    try {
      switch (message.action) {
        case 'toggle':
          if (message.enabled && isEnabled) {
            initializeFix(currentMode);
            startObserver(currentMode);
          } else if (observer) {
            observer.disconnect();
            observer = null;
            resetChanges();
          }
          break;
        case 'mode':
          if (isEnabled) {
            initializeFix(message.mode);
            startObserver(message.mode);
          }
          break;
        case 'applyManual':
          if (currentMode === 'manual' && isEnabled) applyManualFixes();
          break;
        case 'resetChanges':
          if (isEnabled) resetChanges();
          break;
      }
    } catch (error) {
      console.error('Live RTL Fixer Error:', error);
    }
  });
}

// Main initialization
(function init() {
  chrome.storage.sync.get(['mode', 'enabled'], (data) => {
    const mode = data.mode || 'auto';
    const enabled = data.enabled !== false;
    if (enabled) {
      initializeFix(mode);
      startObserver(mode);
    }
  });

  chrome.runtime.onMessage.addListener(handleMessages);
})();
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle');
  const modeSelect = document.getElementById('mode');
  const applyManualBtn = document.getElementById('apply-manual');
  const resetChangesBtn = document.getElementById('reset-changes');
  const blacklistBtn = document.getElementById('blacklist');
  const viewBlacklistBtn = document.getElementById('view-blacklist');
  const reportBtn = document.getElementById('report');
  const statusText = document.getElementById('status');
  const blacklistView = document.getElementById('blacklist-view');

  // Load initial settings
  chrome.storage.sync.get(['enabled', 'mode', 'blacklist', 'changesApplied'], (data) => {
    const enabled = data.enabled !== false;
    const mode = data.mode || 'auto';
    const changesApplied = data.changesApplied || false;
    statusText.textContent = `Status: ${enabled ? 'On' : 'Off'} | Mode: ${mode}`;
    toggleBtn.textContent = enabled ? 'Turn Off' : 'Turn On';
    modeSelect.value = mode;
    applyManualBtn.style.display = mode === 'manual' ? 'block' : 'none';
    resetChangesBtn.style.display = changesApplied ? 'block' : 'none';
  });

  // Toggle enable/disable
  toggleBtn.addEventListener('click', () => {
    chrome.storage.sync.get(['enabled'], (data) => {
      const newState = !data.enabled !== false;
      chrome.storage.sync.set({ enabled: newState });
      updateStatus(newState, modeSelect.value);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle', enabled: newState });
      });
    });
  });

  // Change mode
  modeSelect.addEventListener('change', () => {
    const newMode = modeSelect.value;
    chrome.storage.sync.set({ mode: newMode });
    chrome.storage.sync.get(['enabled', 'changesApplied'], (data) => {
      updateStatus(data.enabled !== false, newMode);
      applyManualBtn.style.display = newMode === 'manual' ? 'block' : 'none';
      resetChangesBtn.style.display = data.changesApplied ? 'block' : 'none';
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'mode', mode: newMode });
      });
    });
  });

  // Apply manual fixes
  applyManualBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'applyManual' });
      applyManualBtn.textContent = 'Fixed';
      chrome.storage.sync.set({ changesApplied: true }); // Set changes applied
      resetChangesBtn.style.display = 'block'; // Show reset button immediately
      setTimeout(() => {
        applyManualBtn.textContent = 'Apply Fixes Now';
      }, 2000); // Revert text after 2 seconds
    });
  });

  // Reset changes
  resetChangesBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'resetChanges' });
      resetChangesBtn.style.display = 'none'; // Hide after reset
    });
  });

  // Add to blacklist
  blacklistBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = new URL(tabs[0].url).hostname;
      chrome.storage.sync.get(['blacklist'], (data) => {
        const blacklist = data.blacklist || [];
        if (!blacklist.includes(url)) {
          blacklist.push(url);
          chrome.storage.sync.set({ blacklist });
          alert(`${url} added to blacklist`);
        }
      });
    });
  });

  // View and manage blacklist
  viewBlacklistBtn.addEventListener('click', () => {
    blacklistView.style.display = blacklistView.style.display === 'none' ? 'block' : 'none';
    if (blacklistView.style.display === 'block') {
      chrome.storage.sync.get(['blacklist'], (data) => {
        const blacklist = data.blacklist || [];
        blacklistView.innerHTML = '';
        blacklist.forEach((site) => {
          const div = document.createElement('div');
          div.className = 'blacklist-item';
          div.innerHTML = `<span>${site}</span><button data-site="${site}">Remove</button>`;
          blacklistView.appendChild(div);
        });

        // Remove from blacklist
        blacklistView.querySelectorAll('button').forEach((btn) => {
          btn.addEventListener('click', () => {
            const site = btn.dataset.site;
            chrome.storage.sync.get(['blacklist'], (data) => {
              const blacklist = data.blacklist.filter((s) => s !== site);
              chrome.storage.sync.set({ blacklist });
              btn.parentElement.remove();
            });
          });
        });
      });
    }
  });

  // Report issue with email
  reportBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url;
      alert(`Please send your issue report to jalalvandi.sina@gmail.com with this URL: ${url}`);
    });
  });

  // Listen for messages from content script (optional fallback)
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'changesApplied') {
      resetChangesBtn.style.display = 'block';
    }
  });

  function updateStatus(enabled, mode) {
    chrome.storage.sync.get(['changesApplied'], (data) => {
      const changesApplied = data.changesApplied || false;
      statusText.textContent = `Status: ${enabled ? 'On' : 'Off'} | Mode: ${mode}`;
      toggleBtn.textContent = enabled ? 'Turn Off' : 'Turn On';
      resetChangesBtn.style.display = changesApplied ? 'block' : 'none';
    });
  }
});
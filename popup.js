document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle');
  const modeSelect = document.getElementById('mode');
  const blacklistBtn = document.getElementById('blacklist');
  const viewBlacklistBtn = document.getElementById('view-blacklist');
  const reportBtn = document.getElementById('report');
  const statusText = document.getElementById('status');
  const blacklistView = document.getElementById('blacklist-view');

  // Load initial settings
  chrome.storage.sync.get(['enabled', 'mode', 'blacklist'], (data) => {
    const enabled = data.enabled !== false;
    const mode = data.mode || 'auto';
    statusText.textContent = `Status: ${enabled ? 'On' : 'Off'} | Mode: ${mode}`;
    toggleBtn.textContent = enabled ? 'Turn Off' : 'Turn On';
    modeSelect.value = mode;
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
    chrome.storage.sync.get(['enabled'], (data) => {
      updateStatus(data.enabled !== false, newMode);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'mode', mode: newMode });
      });
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

  function updateStatus(enabled, mode) {
    statusText.textContent = `Status: ${enabled ? 'On' : 'Off'} | Mode: ${mode}`;
    toggleBtn.textContent = enabled ? 'Turn Off' : 'Turn On';
  }
});
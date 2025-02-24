# Live RTL Fixer Ultimate

A powerful Chrome extension designed to fix Right-to-Left (RTL) and Left-to-Right (LTR) text alignment issues in real-time, primarily for Persian users, with support for other RTL languages like Arabic. This tool ensures seamless text rendering on websites, especially when using browser translation tools (e.g., Google Translate), without requiring a page refresh.

## Features
- **Real-Time Fixes**: Automatically adjusts text direction and alignment as content changes (e.g., during translation).
- **Language Detection**: Smart detection of RTL (Persian, Arabic, etc.) and LTR (English, etc.) text with customizable thresholds.
- **Auto/Manual Modes**: Switch between automatic fixes or manual control for flexibility.
- **Blacklist Management**: Add or remove websites from a blacklist to exclude them from processing.
- **User-Friendly Interface**: A sleek popup with toggle, mode selection, blacklist view, and issue reporting.
- **Optimized Performance**: Lightweight and efficient, with minimal resource usage.
- **Issue Reporting**: Send feedback directly to the developer for problematic sites.

## Installation
1. **Clone or Download**:
git clone https://github.com/yourusername/live-rtl-fixer-ultimate.git
Or download the ZIP file and extract it.

2. **Load in Chrome**:
- Open Chrome and go to chrome://extensions/.
- Enable "Developer mode" in the top-right corner.
- Click "Load unpacked" and select the folder containing the extension files (manifest.json, etc.).

3. **Verify**:
- The extension icon should appear in your Chrome toolbar. Click it to access the popup.

## Usage
- **Toggle On/Off**: Enable or disable the extension with a single click.
- **Mode Selection**: Choose "Auto Mode" for automatic fixes or "Manual Mode" to tag text without applying styles (for advanced use).
- **Blacklist Sites**: Add a site to the blacklist if you don’t want the extension to run on it. View and remove sites from the blacklist via the "View Blacklist" button.
- **Report Issues**: If a site doesn’t display correctly, use the "Report Issue" button to send feedback with the URL to jalalvandi.sina@gmail.com.

### Example
1. Open a webpage in English (e.g., wikipedia.org).
2. Use Chrome’s built-in translator to convert it to Persian.
3. Watch as the extension instantly adjusts the text direction to RTL—no refresh needed!

## Files
- manifest.json: Extension configuration.
- content.js: Core logic for real-time text fixing.
- styles.css: CSS overrides for RTL/LTR styling.
- popup.html: Popup interface.
- popup.js: Popup functionality and settings management.
- icon16.png, icon48.png, icon128.png: Extension icons (replace with your own if desired).

## Development
Want to contribute or customize? Here’s how:
1. **Fork the Repository**: Click "Fork" on GitHub and clone your fork.
2. **Modify the Code**: Edit the JavaScript, CSS, or HTML files as needed.
3. **Test Locally**: Reload the extension in Chrome after changes (chrome://extensions/ > "Reload").
4. **Submit a Pull Request**: Share your improvements with the community!

### Notes for Developers
- The MutationObserver in content.js monitors DOM changes efficiently—tweak the observe options for specific use cases.
- Language detection in detectLanguage() uses regex; adjust the threshold (0.2) for sensitivity.
- Manual mode currently tags elements (data-rtl-fixer); expand this feature for custom workflows.

## Reporting Issues
Encounter a bug? Click "Report Issue" in the popup and send the URL along with a description to jalalvandi.sina@gmail.com.

## License
This project is open-source under the MIT License (LICENSE). Feel free to use, modify, and distribute it.

## Credits
Developed by Sina Jalalvandi (mailto:jalalvandi.sina@gmail.com). Contributions and feedback are welcome!

---
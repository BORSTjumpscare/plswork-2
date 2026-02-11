// Keeps track of which tab is focused
let focusedTabId = null;

chrome.tabs.onActivated.addListener(activeInfo => {
    focusedTabId = activeInfo.tabId;
});

chrome.windows.onFocusChanged.addListener(windowId => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        focusedTabId = null;
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "checkFocus") {
        sendResponse({ isFocused: sender.tab.id === focusedTabId });
    }
});

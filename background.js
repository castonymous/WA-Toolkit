// Klik ikon extension -> Archive
chrome.action.onClicked.addListener((tab) => {
  if (!tab || !tab.id) return;
  chrome.tabs.sendMessage(tab.id, { type: "TRIGGER_ARCHIVE" });
});

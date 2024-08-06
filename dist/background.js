"use strict";
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openPopup') {
        chrome.action.openPopup();
    }
});

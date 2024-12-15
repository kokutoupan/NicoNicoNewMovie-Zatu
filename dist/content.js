"use strict";
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action) {
        console.log("Action received: " + request.action);
        window.location.href = request.action;
        // ここでリンクに基づいた処理を行う
        sendResponse({ result: request.action + " completed" });
    }
    return true;
});

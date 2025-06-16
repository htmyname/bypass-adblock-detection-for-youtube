import './logger.js';

logger.updateDebug();

let lastUrl = null;

function sendMessageAsync(tabId, message) {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        });
    });
}

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.debug) {
        logger.log('Debug flag cambiado en background:', changes.debug.newValue);
    }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {

    if (!details.url.includes("youtube.com")) return;

    if (lastUrl === null) {
        lastUrl = details.url;
        return;
    } else if (lastUrl !== details.url) {
        lastUrl = details.url;
    } else {
        return;
    }

    // Obtiene la pestaña activa en la ventana donde ocurrió el cambio
    const tabs = await chrome.tabs.query({active: true, windowId: details.windowId});
    if (tabs.length === 0) return;

    const activeTab = tabs[0];
    if (activeTab.id === details.tabId) {
        logger.log('Background: URL changed on active tab', details.url);
        try {
            await sendMessageAsync(details.tabId, {
                type: 'urlChanged',
                url: details.url
            });
        } catch (e) {
            logger.log('Error sending message:', e);
        }
    } else {
        logger.log('Background: URL changed on inactive tab, no message sent');
    }
}, {
    url: [{hostContains: 'youtube.com'}]
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'wakeup') {
        logger.log('Background wakeup');
        sendResponse({ status: 'ok' });
    }
});


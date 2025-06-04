import './logger.js';

logger.updateDebug();

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.debug) {
        logger.log('Debug flag cambiado en background:', changes.debug.newValue);
    }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
    console.log(details)

    if (!details.url.includes("youtube.com/watch")) return;

    // Obtiene la pestaña activa en la ventana donde ocurrió el cambio
    const tabs = await chrome.tabs.query({active: true, windowId: details.windowId});
    if (tabs.length === 0) return;

    const activeTab = tabs[0];
    if (activeTab.id === details.tabId) {
        console.log('Background: URL changed on active tab', details.url);
        chrome.tabs.sendMessage(details.tabId, {
            type: 'urlChanged',
            url: details.url
        });
    } else {
        console.log('Background: URL changed on inactive tab, no message sent');
    }
}, {
    url: [{hostContains: 'youtube.com'}]
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'wakeup') {
        console.log('Background wakeup');
    }
});


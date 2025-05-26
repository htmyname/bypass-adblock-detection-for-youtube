console.log('Observer initialized, waiting for YouTube adblock modal...');

let userInteractedBtn = false;
let lastUrl = location.href;
let video = document.querySelector('.video-stream.html5-main-video');
let liveTimeout = null;
let observerActiveSince;

const observer = new MutationObserver(removeAdblockModal);

// Observer Management
function startObserver() {
    observerActiveSince = Date.now();
    observer.observe(document.body, { childList: true, subtree: true });
    console.log('Observer connected');
    addVideoEvent();
}

function stopObserver() {
    observer.disconnect();
    console.log('Observer disconnected');
    if (video) {
        video.removeEventListener('pause', playPauseHandler);
    }
}

// Modal Handling y Video Control
function removeAdblockModal() {
    const dismissButton = document.querySelector('#dismiss-button button');
    video = document.querySelector('.video-stream.html5-main-video');

    if (dismissButton) {
        console.log("Adblock modal detected — dismissing now...");
        dismissButton.click();
        playVideoIfPaused();
    }

    if (Date.now() - observerActiveSince > 15000) {
        console.log("Timeout 15s — stopping observer");
        stopObserver();
        return;
    }

    if (video && video.currentTime > 15 && Date.now() - observerActiveSince > 15000) {
        const liveBadge = document.querySelector('.ytp-live-badge');
        if (liveBadge && liveBadge.offsetParent !== null) {
            console.log("Live detected — do nothing");
            if (!liveTimeout) {
                liveTimeout = setTimeout(() => {
                    console.log("Timeout in live — stopping observer");
                    stopObserver();
                    liveTimeout = null;
                }, 15000);
            }
        } else {
            stopObserver();
        }
    }
}

function playVideoIfPaused() {
    if (!video) return;

    if (video.paused && video.currentTime <= 15 && !userInteractedBtn) {
        video.play();
        console.log("Video playback resumed");
    } else if (video.currentTime > 15) {
        const modal = document.querySelector('.ytd-popup-container .tp-yt-paper-dialog');
        if (modal) {
            console.log("Late modal detected, removing now...");
            modal.remove();
        }
    }
}

// Video Playback Event Management
function playPauseHandler() {
    console.log('User manually paused the video');
    userInteractedBtn = true;
    if (video.currentTime > 15 && Date.now() - observerActiveSince > 15000) {
        stopObserver();
    }
}

function addVideoEvent() {
    video = document.querySelector('.video-stream.html5-main-video');
    if (video) {
        video.addEventListener('pause', playPauseHandler);
    }
}

// URL Change Handling
function onUrlChange() {
    console.log('Checking URL change...');
    if (location.href !== lastUrl) {
        console.log('URL changed from', lastUrl, 'to', location.href);
        lastUrl = location.href;
        userInteractedBtn = false;
        stopObserver();
        startObserver();
    } else {
        console.log('URL unchanged.');
    }
}

// Visibility Change Handling
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log('Tab is active again — reactivating observer if needed');
        stopObserver();
        if (video) {
            video.removeEventListener('pause', playPauseHandler);
        }
        startObserver();
    }
});

// Message Listener
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'urlChanged') {
        console.log('Content script: URL changed to', message.url);
        onUrlChange();
    }
});

// Init
startObserver();
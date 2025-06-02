console.log('Observer initialized, waiting for YouTube adblock modal...');

let userInteractedBtn = false;
let lastUrl = location.href;
let video = undefined;
let playBtn = undefined;
let liveTimeout = null;
let observerActiveSince;
let observerTimeout = 15;
let videoListenerAdded = false;

const observer = new MutationObserver(removeAdblockModal);

// Observer Management
function startObserver() {
    observerActiveSince = Date.now();
    observer.observe(document.body, {childList: true, subtree: true});
    console.log('Observer connected');
    addShareListener();
}

function stopObserver() {
    observer.disconnect();
    console.log('Observer disconnected');
    removeShareListener();
    if (video) {
        document.removeEventListener('keydown', onKeydown);
        video.removeEventListener('click', onVideoClick);
        playBtn.removeEventListener('click', onPlayBtnClick);
        videoListenerAdded = false;
        liveTimeout = null;
    }
}

// Modal Handling y Video Control
function removeAdblockModal() {
    const dismissButton = document.querySelector('#dismiss-button button');
    video = document.querySelector('.video-stream.html5-main-video');
    playBtn = document.querySelector('.ytp-play-button.ytp-button');

    if (video && playBtn && !videoListenerAdded) {
        videoListenerAdded = true;
        addVideoEvent();
    }

    if (dismissButton) {
        if (isVisible(dismissButton)) {
            console.log("Adblock modal detected — dismissing now...");
            dismissButton.click();
        }
        playVideoIfPaused();
    }

    if (video && video.currentTime > observerTimeout && observerTimeout !== 0) {
        const liveBadge = document.querySelector('.ytp-live-badge');
        if (liveBadge && liveBadge.offsetParent !== null) {
            console.log("Live detected — do nothing");
            if (!liveTimeout) {
                liveTimeout = setTimeout(() => {
                    console.log("Timeout in live — stopping observer");
                    stopObserver();
                    liveTimeout = null;
                }, observerTimeout * 1000);
            }
        } else {
            if (Date.now() - observerActiveSince > observerTimeout * 1000) {
                console.log(`Timeout ${observerTimeout}s — stopping observer`);
                stopObserver();
            }
        }
    }
}

function playVideoIfPaused() {
    if (!video) return;

    if ((video.paused && video.currentTime <= observerTimeout || observerTimeout === 0) && !userInteractedBtn) {
        video.play();
        console.log("Video playback resumed");
    }
}

function isVisible(el) {
    if (!el) return false;

    const style = getComputedStyle(el);

    return (
        el.offsetParent !== null && // display: none y detached del layout
        el.offsetWidth > 0 &&
        el.offsetHeight > 0 &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0'
    );
}

// Video Playback Event Management
function playPauseHandler() {
    if (!video) return;
    if (video.paused) {
        console.log('User manually paused the video');
        if (video.currentTime > observerTimeout && Date.now() - observerActiveSince > observerTimeout * 1000 && observerTimeout !== 0) {
            stopObserver();
        }
    }
}

function onKeydown(e) {
    if (e.code === 'Space' || e.code === 'KeyK') {
        userInteractedBtn = true;
        setTimeout(playPauseHandler, 250);
    }
}

function onVideoClick() {
    userInteractedBtn = true;
    setTimeout(playPauseHandler, 250);
}

function onPlayBtnClick() {
    userInteractedBtn = true;
    setTimeout(playPauseHandler, 250);
}

function addVideoEvent() {
    if (video) {
        document.addEventListener('keydown', onKeydown);
        video.addEventListener('click', onVideoClick);
        playBtn.addEventListener('click', onPlayBtnClick);
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

function loadObserverTimeout() {
    chrome.storage.local.get(['observerTimeout'], (result) => {
        console.log('localstorage:', result.observerTimeout)
        if (result.observerTimeout >= 5 || result.observerTimeout <= 60 || result.observerTimeout === 0) {
            observerTimeout = result.observerTimeout;
            console.log(`Timeout cargado: ${observerTimeout} s`);
            startObserver();
        } else {
            observerTimeout = 15;
            console.log(`Timeout cargado: ${observerTimeout} s`);
            startObserver();
        }
    });
}

// Visibility Change Handling
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log('Tab is active again — reactivating observer if needed');
        chrome.runtime.sendMessage({type: 'wakeup'});
        stopObserver();
        startObserver();
    }
});

document.addEventListener('click', () => {
    chrome.runtime.sendMessage({type: 'wakeup'});
})

// Message Listener
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'urlChanged') {
        console.log('Content script: URL changed to', message.url);
        onUrlChange();
    }
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.observerTimeout) {
        observerTimeout = changes.observerTimeout.newValue;
        console.log(`Timeout actualizado a: ${observerTimeout} s`);
    }
});

// Init
injectBackdropStyle();
injectBackdropOverrideStyle();

injectDialogVisibilityHidden();
injectSharePanelStyle();
injectDismissButtonStyle();

loadObserverTimeout();
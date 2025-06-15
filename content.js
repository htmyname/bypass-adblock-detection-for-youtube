logger.log('Observer initialized, waiting for YouTube adblock modal...');

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
    logger.log('Observer connected');
    addActionsListener();
}

function stopObserver() {
    observer.disconnect();
    logger.log('Observer disconnected');
    removeActionsListener();
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
    let adBlockModal = document.querySelector('ytd-enforcement-message-view-model.style-scope.ytd-popup-container');
    let btnEl = undefined;
    let dismissButton = undefined;

    if (adBlockModal) {
        let backdropOverrideStyle = document.getElementById('backdrop-override-style-yt-bypass');
        if (backdropOverrideStyle) {
            backdropOverrideStyle.remove();
        }
        btnEl = adBlockModal.querySelector('button');
        if (btnEl) {
            dismissButton = btnEl.closest('#dismiss-button');
        }
    }


    video = document.querySelector('.video-stream.html5-main-video');
    playBtn = document.querySelector('.ytp-play-button.ytp-button');

    if (video && playBtn && !videoListenerAdded) {
        videoListenerAdded = true;
        addVideoEvent();
    }

    if (dismissButton) {
        if (isVisible(dismissButton)) {
            logger.log("Adblock modal detected — dismissing now...");
            dismissButton.click();
            adBlockModal.remove();
        }
        playVideoIfPaused();
    }

    if (video && video.currentTime > observerTimeout && observerTimeout !== 0) {
        const liveBadge = document.querySelector('.ytp-live-badge');
        if (liveBadge && liveBadge.offsetParent !== null) {
            logger.log("Live detected — do nothing");
            if (!liveTimeout) {
                liveTimeout = setTimeout(() => {
                    logger.log("Timeout in live — stopping observer");
                    stopObserver();
                    liveTimeout = null;
                }, observerTimeout * 1000);
            }
        } else {
            if (Date.now() - observerActiveSince > observerTimeout * 1000) {
                logger.log(`Timeout ${observerTimeout}s — stopping observer`);
                stopObserver();
            }
        }
    }
}

function playVideoIfPaused() {
    if (!video) return;

    if ((video.paused && video.currentTime <= observerTimeout || observerTimeout === 0) && !userInteractedBtn) {
        video.play();
        logger.log("Video playback resumed");
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
        logger.log('User manually paused the video');
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
    logger.log('Checking URL change...');
    if (location.href !== lastUrl) {
        logger.log('URL changed from', lastUrl, 'to', location.href);
        lastUrl = location.href;
        userInteractedBtn = false;
        stopObserver();
        startObserver();
    } else {
        logger.log('URL unchanged.');
    }
}

function loadObserverTimeout() {
    chrome.storage.local.get(['observerTimeout'], (result) => {
        logger.log('localstorage:', result.observerTimeout)
        if (result.observerTimeout >= 5 || result.observerTimeout <= 60 || result.observerTimeout === 0) {
            observerTimeout = result.observerTimeout;
            logger.log(`Timeout cargado: ${observerTimeout} s`);
            startObserver();
        } else {
            observerTimeout = 15;
            logger.log(`Timeout cargado: ${observerTimeout} s`);
            startObserver();
        }
    });
}

// Visibility Change Handling
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        logger.log('Tab is active again — reactivating observer if needed');

        if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
            chrome.runtime.sendMessage({type: 'wakeup'});
        }

        stopObserver();
        startObserver();
    }
});

document.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
        chrome.runtime.sendMessage({type: 'wakeup'});
    }
})

// Message Listener
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'urlChanged') {
        logger.log('Content script: URL changed to', message.url);
        onUrlChange();
    }
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.observerTimeout) {
        observerTimeout = changes.observerTimeout.newValue;
        logger.log(`Timeout actualizado a: ${observerTimeout} s`);
    }
});

// Init
loadObserverTimeout();
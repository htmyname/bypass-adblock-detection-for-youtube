logger.log('Observer initialized, waiting for YouTube adblock modal...');

let userInteractedBtn = false;
let lastUrl = location.href;
let video = null;
let playBtn = null;
let liveTimeout = null;
let isObserverActive = false;
let observerActiveSince;
let observerTimeout = 15;
let videoListenerAdded = false;

const observer = new MutationObserver(removeAdblockModal);

// Observer Management
function startObserver() {
    observerActiveSince = Date.now();
    isObserverActive = true;
    observer.observe(document.body, {childList: true, subtree: true});
    chrome.storage.local.set({isObserverActive: true}).then(() => {
        logger.log('Observer connected');
    });
    addActionsListener();
}

function stopObserver() {
    observer.disconnect();
    isObserverActive = false;
    chrome.storage.local.set({isObserverActive: false}).then(() => {
        logger.log('Observer disconnected');
    });

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
    const adBlockModal = document.querySelector('ytd-enforcement-message-view-model.style-scope.ytd-popup-container');
    const backdropOverrideStyle = document.getElementById('backdrop-override-style-yt-bypass');
    let dismissButton = null;
    video = document.querySelector('.html5-video-container > .video-stream.html5-main-video');
    playBtn = document.querySelector('.ytp-play-button.ytp-button');

    if (adBlockModal) {
        dismissButton = btnEl.closest('#dismiss-button');
    }

    if (dismissButton) {
        if (isVisible(dismissButton)) {
            logger.log("Adblock modal detected — dismissing now...");
            if (backdropOverrideStyle) {
                backdropOverrideStyle.remove();
            }
            dismissButton.click();
            //adBlockModal.remove();
            playVideoIfPaused();
        }
    }

    if (video && playBtn && !videoListenerAdded) {
        videoListenerAdded = true;
        addVideoEvent();
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
        } else if (Date.now() - observerActiveSince > observerTimeout * 1000) {
            logger.log(`Timeout ${observerTimeout}s — stopping observer`);
            stopObserver();
        }
    }
}

function playVideoIfPaused() {
    if (video && video.paused && !userInteractedBtn &&
        (video.currentTime <= observerTimeout || observerTimeout === 0 || Date.now() - observerActiveSince < observerTimeout * 1000)) {
        video.play();
        logger.log("Video playback resumed");
    }
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
    document.addEventListener('keydown', onKeydown);
    video.addEventListener('click', onVideoClick);
    playBtn.addEventListener('click', onPlayBtnClick);
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
        logger.log('localstorage:', result.observerTimeout);
        if ((result.observerTimeout >= 5 && result.observerTimeout <= 60) || result.observerTimeout === 0) {
            observerTimeout = result.observerTimeout;
        } else {
            observerTimeout = 15;
        }
        logger.log(`Timeout cargado: ${observerTimeout} s`);
        startObserver();
    });
}

// Visibility Change Handling
function sendMessageAsync(message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        });
    });
}

function getStorageValue(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, (result) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            resolve(result[key]);
        });
    });
}


document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
        logger.log('Tab is active again — reactivating observer if needed');

        isObserverActive = await getStorageValue('isObserverActive');

        if (typeof chrome !== 'undefined' && chrome.runtime?.id && isObserverActive === false) {
            try {
                await sendMessageAsync({type: 'wakeup'});
                stopObserver();
                startObserver();
            } catch (e) {
                logger.log('Error sending wakeup message:', e);
            }
        }
    }
});

document.addEventListener('click', async () => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
        await sendMessageAsync({type: 'wakeup'});
    }
});

// Message Listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'urlChanged') {
        logger.log('Content script: URL changed to', message.url);
        onUrlChange();
        sendResponse({status: 'ok'});
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
function injectBackdropStyle() {
    if (document.getElementById('backdrop-style-yt-bypass')) return;
    const style = document.createElement('style');
    style.id = 'backdrop-style-yt-bypass';
    style.textContent = `
    tp-yt-iron-overlay-backdrop.opened {
      opacity: 0;
    }
  `;
    document.head.appendChild(style);
}

function injectBackdropOverrideStyle() {
    if (document.getElementById('backdrop-override-style-yt-bypass')) return;
    const style = document.createElement('style');
    style.id = 'backdrop-override-style-yt-bypass';
    style.textContent = `
     tp-yt-iron-overlay-backdrop.opened {
        opacity: 0.6 !important;
    }
    `;
    document.head.appendChild(style);
}

function injectDialogVisibilityHidden() {
    if (document.getElementById('dialog-visibility-style-yt-bypass')) return;
    const style = document.createElement('style');
    style.id = 'dialog-visibility-style-yt-bypass';
    style.textContent = `
    ytd-enforcement-message-view-model.style-scope.ytd-popup-container {
      visibility: hidden !important;
    }
  `;
    document.head.appendChild(style);
}

function injectDismissButtonStyle() {
    if (document.getElementById('dismiss-button-style-yt-bypass')) return;

    const style = document.createElement('style');
    style.id = 'dismiss-button-style-yt-bypass';
    style.textContent = `
    yt-button-view-model#dismiss-button {
      visibility: visible !important;
      opacity: 0.01 !important;
    }
  `;
    document.head.appendChild(style);
}

function actionsListenerHandler(e) {
    const clicked = e.target.closest('button');
    if (!clicked) {
        logger.log('No button found on click target');
        return;
    }

    const shareBtn = document.querySelector('#top-level-buttons-computed > yt-button-view-model > button-view-model > button');
    const videoMenuBtn = document.querySelector('#menu > ytd-menu-renderer > yt-button-shape#button-shape > button');
    const videoListMenuIcon = document.querySelector('#button > yt-icon.style-scope.ytd-menu-renderer');
    const joinBtn = document.querySelector('#sponsor-button > timed-animation-button-renderer > yt-smartimation > div > ytd-button-renderer > yt-button-shape > button');
    const unSubscribeBtn = document.querySelector('#notification-preference-button > ytd-subscription-notification-toggle-button-renderer-next > yt-button-shape > button');
    const leftMenuBtn = document.querySelector('yt-icon-button#guide-button > button#button');

    const elementsToMatch = [
        shareBtn,
        videoMenuBtn,
        joinBtn,
        unSubscribeBtn,
        leftMenuBtn,
        videoListMenuIcon?.parentElement || null,
    ];

    const matched = elementsToMatch.some(elem => elem === clicked);

    if (matched) {
        logger.log('Clicked button:', clicked);
        injectBackdropOverrideStyle();
    } else {
        logger.log('Action button not found');
    }
}


function addActionsListener() {
    document.addEventListener('click', actionsListenerHandler);
}

function removeActionsListener() {
    document.removeEventListener('click', actionsListenerHandler);
    injectBackdropOverrideStyle();
}

//Init Styles
injectBackdropStyle();
injectBackdropOverrideStyle();

injectDialogVisibilityHidden();
injectDismissButtonStyle();

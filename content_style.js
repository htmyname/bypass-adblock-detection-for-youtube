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
    let share = document.querySelector('#top-level-buttons-computed > yt-button-view-model > button-view-model > button')
    let videoMenu = document.querySelector('#menu > ytd-menu-renderer > yt-button-shape#button-shape > button');
    let videoListMenu = document.querySelector('#button > yt-icon.style-scope.ytd-menu-renderer');
    let join = document.querySelector('#sponsor-button > timed-animation-button-renderer > yt-smartimation > div > ytd-button-renderer > yt-button-shape > button');
    let unSubscribe = document.querySelector('#notification-preference-button > ytd-subscription-notification-toggle-button-renderer-next > yt-button-shape > button');
    let leftMenu = document.querySelector('yt-icon-button#guide-button > button#button');

    if (share || videoMenu || videoListMenu || join || unSubscribe || leftMenu) {
        injectBackdropOverrideStyle();
    }else {
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

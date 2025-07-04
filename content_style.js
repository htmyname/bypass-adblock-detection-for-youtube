function injectStyle(id, css) {
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
}

function injectBackdropStyle() {
    injectStyle('backdrop-style-yt-bypass', `
    tp-yt-iron-overlay-backdrop.opened {
      opacity: 0 !important;
    }
  `);
}

function injectBackdropOverrideStyle() {
    injectStyle('backdrop-override-style-yt-bypass', `
    tp-yt-iron-overlay-backdrop.opened {
      opacity: 0.6 !important;
    }
  `);
}

function injectDialogVisibilityHidden() {
    injectStyle('dialog-visibility-style-yt-bypass', `
    ytd-enforcement-message-view-model.style-scope.ytd-popup-container {
      visibility: hidden !important;
    }
  `);
}

function injectParentDialogVisibilityHidden() {
    injectStyle('parent-style-yt-bypass', `
    .adblock-modal-parent-yt-bypass {
        opacity: 0 !important;
    }
    `);
}


function injectDismissButtonStyle() {
    injectStyle('dismiss-button-style-yt-bypass', `
    yt-button-view-model#dismiss-button {
      visibility: visible !important;
      opacity: 0.01 !important;
    }
  `);
}

function actionsListenerHandler(e) {
    if (!e.target) return;

    let clicked = e.target.closest('button')
        || e.target.closest('yt-icon-button')
        || e.target.closest('div[style*="fill: currentcolor;"][style*="display: block;"]');

    if (!clicked) {
        return;
    }

    const buttonSelectors = [
        '#top-level-buttons-computed > yt-button-view-model > button-view-model > button',
        '#menu > ytd-menu-renderer > yt-button-shape#button-shape > button',
        'yt-icon-button > button#button.style-scope.yt-icon-button',
        '#sponsor-button > timed-animation-button-renderer > yt-smartimation > div > ytd-button-renderer > yt-button-shape > button',
        '#notification-preference-button > ytd-subscription-notification-toggle-button-renderer-next > yt-button-shape > button',
        'yt-icon-button#guide-button > button#button',
        'yt-icon-button',
        'yt-icon#guide-icon > span > div'
    ];

    const matched = buttonSelectors.some(selector => {
        const buttons = document.querySelectorAll(selector);
        return Array.from(buttons).some(btn => btn.isEqualNode(clicked));
    });

    if (matched) {
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
    injectBackdropOverrideStyle(); // redundancia controlada
}

function isVisible(el) {
    if (!el) return false;
    const style = getComputedStyle(el);
    return (
        el.offsetParent !== null &&
        el.offsetWidth > 0 &&
        el.offsetHeight > 0 &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0'
    );
}

// Init Styles
injectBackdropStyle();
injectBackdropOverrideStyle();
injectDialogVisibilityHidden();
injectParentDialogVisibilityHidden();
injectDismissButtonStyle();

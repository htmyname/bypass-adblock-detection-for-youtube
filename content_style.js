let shareBtn = undefined;
let modalParent = undefined;
let shareObserver = null;
let shareObserverStarted = false;


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
    .custom-opacity-important {
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
    tp-yt-paper-dialog.style-scope.ytd-popup-container {
      visibility: hidden !important;
    }
  `;
    document.head.appendChild(style);
}

function injectSharePanelStyle() {
    if (document.getElementById('share-panel-style-yt-bypass')) return;

    const style = document.createElement('style');
    style.id = 'share-panel-style-yt-bypass';
    style.textContent = `
    ytd-unified-share-panel-renderer.style-scope.ytd-popup-container {
      visibility: visible !important;
      background-color: white !important;
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

function initShareObserver() {
    modalParent = document.querySelector('tp-yt-paper-dialog.style-scope.ytd-popup-container');
    if (modalParent) {
        shareObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'style') {
                    const style = modalParent.getAttribute('style') || '';

                    const isVisible = !style.includes('display: none');
                    const backdrop = document.querySelector('tp-yt-iron-overlay-backdrop');

                    if (backdrop) {
                        if (isVisible) {
                            backdrop.classList.add('custom-opacity-important');
                        } else {
                            backdrop.classList.remove('custom-opacity-important');
                        }
                    }
                }
            });
        });
        if (!shareObserverStarted){
            startShareObserver();
        }
    }
}

function startShareObserver() {
    console.log('share observer start')
    shareObserver.observe(modalParent, {attributes: true, attributeFilter: ['style']});
    shareObserverStarted = true;
}

function stopShareObserver() {
    console.log('share observer stop')
    shareObserver.disconnect()
    shareObserverStarted = false;
}

function shareListenerHandler(e) {
    shareBtn = e.target.closest('button.yt-spec-button-shape-next');
    if (shareBtn) {
        initShareObserver();
    }
}

function addShareListener() {
    document.addEventListener('click', shareListenerHandler);
}

function removeShareListener() {
    document.removeEventListener('click', shareListenerHandler);
    stopShareObserver();
}

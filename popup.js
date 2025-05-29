document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('timeoutInput');
    const status = document.getElementById('status');

    // Cargar valor actual
    chrome.storage.local.get(['observerTimeout'], (result) => {
        if (result.observerTimeout) {
            input.value = result.observerTimeout;
        }
    });

    document.getElementById('saveBtn').addEventListener('click', () => {
        const newTimeout = parseInt(input.value);
        if (isNaN(newTimeout) || newTimeout < 5 || newTimeout > 60) {
            status.style.color = "#dc3545"
            status.textContent = chrome.i18n.getMessage("noRangeValueMsg");
            return;
        }

        chrome.storage.local.set({ observerTimeout: newTimeout }, () => {
            status.style.color = "#28a745"
            status.textContent = chrome.i18n.getMessage("successMsg");
            setTimeout(() => {
                status.style.color = "#666"
                status.textContent = chrome.i18n.getMessage("defaultMsg")
            }, 2000);
        });
    });
});

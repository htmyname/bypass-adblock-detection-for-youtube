// logger.js
let DEBUG = false;

function updateDebug() {
    chrome.storage.local.get('debug', ({ debug }) => {
        DEBUG = debug ?? false;
    });
}

// Inicializa DEBUG al cargar el script
updateDebug();

// Escucha cambios en storage para actualizar DEBUG dinámicamente
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.debug) {
        DEBUG = changes.debug.newValue;
    }
});

function log(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

// Exportamos globalmente para content scripts o en background se puede importar con módulos
globalThis.logger = { log, updateDebug };

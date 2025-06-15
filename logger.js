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
        let stack = new Error().stack;
        let callerLine = stack.split("\n")[2];
        console.log('↪', callerLine.trim());
        console.log(' ')
    }
}

// Exportamos globalmente para content scripts o en background se puede importar con módulos
globalThis.logger = { log, updateDebug };

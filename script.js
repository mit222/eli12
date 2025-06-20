// WICHTIG: Diese URL erhältst du von Make.com im nächsten Schritt
const WEBHOOK_URL = "https://hook.eu2.make.com/f1hrknpu3jsbflwh4m64ceifok293kq6";

// DOM-Elemente
const elements = {
    uploadForm: document.getElementById('uploadForm'),
    imageInput: document.getElementById('imageInput'),
    preview: document.getElementById('preview'),
    previewImage: document.getElementById('previewImage'),
    removeImage: document.getElementById('removeImage'),
    submitBtn: document.getElementById('submitBtn'),
    status: document.getElementById('status'),
    statusText: document.getElementById('statusText'),
    result: document.getElementById('result'),
    summaryContent: document.getElementById('summaryContent'),
    error: document.getElementById('error'),
    errorMessage: document.getElementById('errorMessage'),
    newAnalysis: document.getElementById('newAnalysis'),
    retryBtn: document.getElementById('retryBtn'),
    fileText: document.querySelector('.file-text')
};

// Event Listeners
elements.imageInput.addEventListener('change', handleImageSelect);
elements.removeImage.addEventListener('click', clearImage);
elements.uploadForm.addEventListener('submit', handleSubmit);
elements.newAnalysis.addEventListener('click', resetForm);
elements.retryBtn.addEventListener('click', resetForm);

// Bild auswählen
function handleImageSelect(e) {
    const file = e.target.files[0];
    
    if (file && file.type.startsWith('image/')) {
        // Dateiname anzeigen
        elements.fileText.textContent = file.name;
        
        // Vorschau anzeigen
        const reader = new FileReader();
        reader.onload = function(e) {
            elements.previewImage.src = e.target.result;
            elements.preview.classList.remove('hidden');
            elements.submitBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
}

// Bild entfernen
function clearImage() {
    elements.imageInput.value = '';
    elements.preview.classList.add('hidden');
    elements.submitBtn.disabled = true;
    elements.fileText.textContent = 'Bild auswählen';
}

// Formular absenden
async function handleSubmit(e) {
    e.preventDefault();
    
    const file = elements.imageInput.files[0];
    if (!file) return;
    
    // UI-Status aktualisieren
    showStatus('Bild wird hochgeladen...');
    
    try {
        // Bild in Base64 konvertieren
        const base64Image = await fileToBase64(file);

        //WICHTIG: Nur den Base64-Teil ohne Data-URL Prefix
        const base64Only = base64Image.split(',')[1];
        
        // Status aktualisieren
        updateStatus('Text wird extrahiert...');
        
        // An Make.com senden
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                image: base64Only, // Nur Base64-Teil ohne Data-URL
                timestamp: new Date().toISOString(),
                filename: file.name
            })
        });
        
        if (!response.ok) {
            throw new Error(`Server-Fehler: ${response.status}`);
        }
        
        updateStatus('Zusammenfassung wird erstellt...');
        
        const data = await response.json();
        
        // Ergebnis anzeigen
        showResult(data.summary);
        
    } catch (error) {
        console.error('Fehler:', error);
        showError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    }
}

// Hilfsfunktionen
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function showStatus(message) {
    elements.uploadForm.parentElement.classList.add('hidden');
    elements.status.classList.remove('hidden');
    elements.result.classList.add('hidden');
    elements.error.classList.add('hidden');
    elements.statusText.textContent = message;
}

function updateStatus(message) {
    elements.statusText.textContent = message;
}

function showResult(summary) {
    elements.status.classList.add('hidden');
    elements.result.classList.remove('hidden');
    elements.summaryContent.textContent = summary;
}

function showError(message) {
    elements.status.classList.add('hidden');
    elements.error.classList.remove('hidden');
    elements.errorMessage.textContent = message;
}

function resetForm() {
    elements.uploadForm.parentElement.classList.remove('hidden');
    elements.status.classList.add('hidden');
    elements.result.classList.add('hidden');
    elements.error.classList.add('hidden');
    clearImage();
}

// Webhook-URL-Warnung
if (WEBHOOK_URL === "https://hook.eu2.make.com/f1hrknpu3jsbflwh4m64ceifok293kq6") {
    console.warn('⚠️ WICHTIG: Bitte die Make.com Webhook-URL in script.js einfügen!');
}
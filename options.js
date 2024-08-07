document.addEventListener('DOMContentLoaded', () => {
    const ipInput = document.getElementById('ip');
    const portInput = document.getElementById('port');
    const characterVoiceInput = document.getElementById('characterVoice');
    const languageInput = document.getElementById('language');
    const saveButton = document.getElementById('save');

    // Ensure all elements are loaded
    if (!ipInput || !portInput || !characterVoiceInput || !languageInput || !saveButton) {
        console.error('One or more elements not found in the DOM');
        return;
    }

    // Load saved settings
    chrome.storage.sync.get(['ip', 'port', 'characterVoice', 'language'], (data) => {
        if (data.ip) ipInput.value = data.ip;
        if (data.port) portInput.value = data.port;
        if (data.characterVoice) characterVoiceInput.value = data.characterVoice;
        if (data.language) languageInput.value = data.language;
    });

    // Save settings
    saveButton.addEventListener('click', () => {
        const ip = ipInput.value;
        const port = portInput.value;
        const characterVoice = characterVoiceInput.value;
        const language = languageInput.value;

        chrome.storage.sync.set({ ip, port, characterVoice, language }, () => {
            alert('Settings saved');
        });
    });
});

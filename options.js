document.addEventListener('DOMContentLoaded', () => {
    const ipInput = document.getElementById('ip');
    const portInput = document.getElementById('port');
    const characterVoiceInput = document.getElementById('characterVoice');
    const saveButton = document.getElementById('save');

    // Load saved settings
    chrome.storage.sync.get(['ip', 'port', 'characterVoice'], (data) => {
        if (data.ip) ipInput.value = data.ip;
        if (data.port) portInput.value = data.port;
        if (data.characterVoice) characterVoiceInput.value = data.characterVoice;
    });

    // Save settings
    saveButton.addEventListener('click', () => {
        const ip = ipInput.value;
        const port = portInput.value;
        const characterVoice = characterVoiceInput.value;

        chrome.storage.sync.set({ ip, port, characterVoice }, () => {
            alert('Settings saved');
        });
    });
});

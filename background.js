// Function to dynamically load the Howler.js library from CDN
function loadHowler(callback) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js';
    script.onload = callback;
    document.head.appendChild(script);
}

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
    createContextMenu();
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'TTS Extension Installed',
        message: 'Right-click on selected text and choose "Play TTS" to use the extension.'
    });
});

chrome.runtime.onStartup.addListener(() => {
    console.log('Extension started');
    createContextMenu();
});

function createContextMenu() {
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: "playTTS",
            title: "Play TTS",
            contexts: ["selection"]
        });
        console.log('Context menu created');
    });
}

let currentSound = null;

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "playTTS") {
        console.log('Context menu clicked');
        const selectionText = info.selectionText;
        console.log(`Selected text: ${selectionText}`);
        if (selectionText) {
            const ip = '192.168.1.3'; // Set your IP here
            const port = '7851'; // Set your port here
            const textInput = selectionText;
            const textFiltering = 'standard';
            const characterVoice = 'thompson.wav';
            const narratorEnabled = 'false';
            const narratorVoice = 'male_01.wav';
            const textNotInside = 'character';
            const language = 'en';
            const outputFileName = 'myoutputfile';
            const outputFileTimestamp = 'true';
            const autoplay = 'false'; // Change autoplay to false
            const autoplayVolume = '0.7';

            loadHowler(() => {
                console.log('Howler.js loaded');
                generateAndPlayTTS(ip, port, {
                    text_input: textInput,
                    text_filtering: textFiltering,
                    character_voice_gen: characterVoice,
                    narrator_enabled: narratorEnabled,
                    narrator_voice_gen: narratorVoice,
                    text_not_inside: textNotInside,
                    language: language,
                    output_file_name: outputFileName,
                    output_file_timestamp: outputFileTimestamp,
                    autoplay: autoplay, // Set autoplay to false to prevent API from playing
                    autoplay_volume: autoplayVolume
                });
            });
        } else {
            console.error('No text selected');
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon.png',
                title: 'Error',
                message: 'No text selected for TTS.'
            });
        }
    }
});

async function generateAndPlayTTS(ip, port, data) {
    const url = `http://${ip}:${port}/api/tts-generate`;

    try {
        console.log('Sending POST request to:', url);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(data)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const result = await response.json();
        console.log('Response from TTS API:', result);

        if (result.output_file_url) {
            // Stop and unload any current sound before creating a new one
            if (currentSound) {
                currentSound.stop();
                currentSound.unload();
            }

            currentSound = new Howl({
                src: [result.output_file_url],
                format: ['wav'],
                html5: true,
                volume: parseFloat(data.autoplay_volume),
                onload: function() {
                    console.log('Audio loaded successfully');
                },
                onloaderror: function(_, err) {
                    console.error('Error loading audio:', err);
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'icon.png',
                        title: 'Error',
                        message: 'Failed to load audio.'
                    });
                },
                onplay: function() {
                    console.log('Audio playback started');
                },
                onplayerror: function(_, err) {
                    console.error('Error playing audio:', err);
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: 'icon.png',
                        title: 'Error',
                        message: 'Failed to play audio.'
                    });
                },
                onend: function() {
                    console.log('Audio playback ended');
                }
            });

            currentSound.play();
        } else {
            console.error('No output file URL in response');
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon.png',
                title: 'Error',
                message: 'No output file URL in response from TTS API.'
            });
        }
    } catch (error) {
        console.error('Error requesting TTS audio:', error);
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Network Error',
            message: 'Error requesting TTS audio. Please check your network and server settings.'
        });
    }
}

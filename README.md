# AllTalk TTS Browser Extension

This browser extension enables text-to-speech (TTS) functionality for selected text in your browser. Right-click on highlighted text and choose "Play TTS" to hear the text read aloud. The extension interacts with a backend TTS API to generate and stream the audio.

## Features

Text-to-Speech Playback: Highlight text on any webpage, right-click, and select "Play TTS" to listen to the selected text.

Audio file will open within a new browser tab.

## About AllTalk

AllTalk is based on the Coqui TTS engine, similar to the Coqui_tts extension for Text generation webUI, however supports a variety of advanced features, such as a settings page, low VRAM support, DeepSpeed, narrator, model finetuning, custom models, wav file maintenance. It can also be used with 3rd Party software via JSON calls.
https://github.com/erew123/alltalk_tts

###
Extension options:
#### Navigate to: 
* chrome://extensions
* Select TTS Extension Details
* Click on Extension options and fill in the form and save:
* Example: IP Address: 192.168.1.35, Port: 7851, Character Voice: female_01.wav, Language: en

### Exporting the Extension
#### Prepare the Extension:

Make sure all necessary files are included (background.js, content.js, manifest.json, images/icon.png, etc.).
Update the version number in manifest.json if necessary.
Package the Extension:

Open Chrome and navigate to chrome://extensions/.
Click "Pack extension".
In the "Extension root directory" field, select the directory where your extension's files are located.
Click "Pack Extension".

#### Distribute the Extension:

This will create a .crx file (the packaged extension) and a .pem file (the private key).
You can distribute the .crx file to users. They can install it by dragging and dropping the file onto chrome://extensions/.
Additional Tips
Ensure all URLs, especially those involving the IP and port in the generateAndPlayTTS function, are correctly reachable and the backend service is running.

### Debugging the Extension
#### Load the Extension Locally:

Open Chrome and navigate to chrome://extensions/.
Enable "Developer mode" using the toggle switch in the top right corner.
Click "Load unpacked" and select the directory where your extension's files are located.
Inspect the Background Script:

After loading the extension, click "background page" under your extension entry in chrome://extensions/. This will open a DevTools window for the background script, where you can set breakpoints and debug the background.js code.
#### Inspect Content Scripts:

Open DevTools (F12 or right-click and select "Inspect").
Go to the "Sources" tab, and you should see your content.js file under the "Content scripts" section. You can set breakpoints and debug the content script here.
Debug Context Menu Actions:

Right-click on any selected text on a web page to trigger the context menu action.
Monitor the background script console (from the "background page" DevTools) to see logs and errors.
Debug Notifications and Spinner:

### Install
npm install --save-dev webpack webpack-cli
npx webpack
(note: $env:OLLAMA_ORIGINS="chrome-extension://*"; ollama serve)
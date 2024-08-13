chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
  createContextMenu();
  chrome.notifications.create({
    type: "basic",
    iconUrl: "images/icon.png",
    title: "TTS Extension Installed",
    message:
      'Right-click on selected text and choose "Play TTS" to use the extension.',
  });
});

chrome.runtime.onStartup.addListener(() => {
  console.log("Extension started");
  createContextMenu();
});

function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "playTTS",
      title: "Play TTS",
      contexts: ["selection"],
    });
    console.log("Context menu created");
  });
}

let currentSound = null;

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "playTTS") {
    console.log("Context menu clicked");
    const selectionText = info.selectionText;
    console.log(`Selected text: ${selectionText}`);
    if (selectionText) {
      // Load settings
      chrome.storage.sync.get(
        ["ip", "port", "characterVoice", "language"],
        (data) => {
          const ip = data.ip || "192.168.1.35";
          const port = data.port || "7851";
          const characterVoice = data.characterVoice || "female_01.wav";
          const language = data.language || "en";

          const textInput = selectionText;
          const textFiltering = "standard";
          const narratorEnabled = "false";
          const narratorVoice = "male_01.wav";
          const textNotInside = "character";
          const outputFileName = "myoutputfile";
          const outputFileTimestamp = "true";
          const autoplay = "false";
          const autoplayVolume = "0.7";

          generateAndPlayTTS(
            ip,
            port,
            {
              text_input: textInput,
              text_filtering: textFiltering,
              character_voice_gen: characterVoice,
              narrator_enabled: narratorEnabled,
              narrator_voice_gen: narratorVoice,
              text_not_inside: textNotInside,
              language: language,
              output_file_name: outputFileName,
              output_file_timestamp: outputFileTimestamp,
              autoplay: autoplay,
              autoplay_volume: autoplayVolume,
            },
            tab
          );
        }
      );
    } else {
      console.error("No text selected");
      chrome.notifications.create({
        type: "basic",
        iconUrl: "images/icon.png",
        title: "Error",
        message: "No text selected for TTS.",
      });
    }
  }
});

async function generateAndPlayTTS(ip, port, data, tab) {
  const url = `http://${ip}:${port}/api/tts-generate`;

  try {
    console.log("Sending POST request to:", url);
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["dist/content.bundle.js"],
      },
      () => {
        chrome.tabs.sendMessage(tab.id, { action: "showSpinner" });
      }
    );

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(data),
    });

    if (!response.ok) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ["dist/content.bundle.js"],
        },
        () => {
          chrome.tabs.sendMessage(tab.id, { action: "hideSpinner" });
        }
      );
      throw new Error("Network response was not ok " + response.statusText);
    }

    const result = await response.json();
    console.log("Response from TTS API:", result);

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["dist/content.bundle.js"],
      },
      () => {
        chrome.tabs.sendMessage(tab.id, { action: "hideSpinner" });
      }
    );

    chrome.windows.create(
      {
        url: result.output_file_url,
        type: "popup",
        width: 500, // Define the width of the popup
        height: 300, // Define the height of the popup
        left: 100, // Optionally define the left position of the popup
        top: 100, // Optionally define the top position of the popup
      },
      function (window) {
        console.log("Popup window created:", window);
      }
    );

    // chrome.tabs.create({ url: result.output_file_url }, function (tab) {
    //   console.log("New tab created for audio:", tab);

    // });
  } catch (error) {
    console.error("Error requesting TTS audio:", error);
    // Hide spinner if there's an error
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["dist/content.bundle.js"],
      },
      () => {
        chrome.tabs.sendMessage(tab.id, { action: "hideSpinner" });
      }
    );

    chrome.notifications.create({
      type: "basic",
      iconUrl: "images/icon.png",
      title: "Network Error",
      message:
        "Error requesting TTS audio. Please check your network and server settings.",
    });
  }
}

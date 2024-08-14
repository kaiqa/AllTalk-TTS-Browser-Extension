// Event Listener when the extension is installed
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

// Event Listener when Chrome starts
chrome.runtime.onStartup.addListener(() => {
  console.log("Extension started");
  createContextMenu();
});

// Function to create the context menus
function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    // Create the main Play TTS context menu
    chrome.contextMenus.create(
      {
        id: "playTTS",
        title: "Play TTS",
        contexts: ["selection"],
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error creating Play TTS menu:",
            chrome.runtime.lastError
          );
        } else {
          console.log("Play TTS menu created");
        }
      }
    );

    // Create the Voices submenu
    chrome.contextMenus.create(
      {
        id: "voices",
        parentId: "playTTS",
        title: "Voices",
        contexts: ["selection"],
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error creating Voices submenu:",
            chrome.runtime.lastError
          );
        } else {
          console.log("Voices submenu created");
          // Fetch and create submenu items for voices
          fetchVoicesAndCreateSubmenu();
        }
      }
    );
  });
}

function fetchVoicesAndCreateSubmenu() {
  console.log("Fetching available voices...");

  chrome.storage.sync.get(
    ["ip", "port", "characterVoice", "language"],
    (data) => {
      const ip = data.ip || "192.168.1.35";
      const port = data.port || "7851";

      const apiUrl = `http://${ip}:${port}/api/voices`;
      console.log(`Fetching voices from: ${apiUrl}`);

      fetch(apiUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Network response was not ok: ${response.statusText}`
            );
          }
          return response.json();
        })
        .then((data) => {
          console.log("Voices fetched:", data);
          const voices = data.voices;
          if (voices.length === 0) {
            console.warn("No voices available.");
          }
          voices.forEach((voice) => {
            const voiceId = voice;
            chrome.contextMenus.create(
              {
                id: voiceId,
                parentId: "voices",
                title: voice,
                contexts: ["selection"],
                // No onclick here, use global listener instead
              },
              () => {
                if (chrome.runtime.lastError) {
                  console.error(
                    `Error creating submenu for voice "${voice}" with ID "${voiceId}":`,
                    chrome.runtime.lastError
                  );
                } else {
                  console.log(`Submenu created for voice: ${voice}`);
                }
              }
            );
          });
        })
        .catch((error) => {
          console.error("Error fetching voices:", error);
        });
    }
  );
}

// Global event listener for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId) {
    console.log(`Selected voice ID: ${info.menuItemId}`);
    const selectedVoice = info.menuItemId; // This should capture the selected voice correctly
    console.log(`Selected voice: ${selectedVoice}`);
    const selectionText = info.selectionText;
    console.log(`Selected text: ${selectionText}`);
    if (selectionText) {
      chrome.storage.sync.get(
        ["ip", "port", "characterVoice", "language"],
        (data) => {
          const ip = data.ip || "192.168.1.35";
          const port = data.port || "7851";
          const characterVoice = selectedVoice || "female_01.wav"; // Use selectedVoice here
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
              character_voice_gen: characterVoice, // Pass characterVoice
              narrator_enabled: narratorEnabled,
              narrator_voice_gen: narratorVoice,
              text_not_inside: textNotInside,
              language: language,
              output_file_name: outputFileName,
              output_file_timestamp: outputFileTimestamp,
              autoplay: autoplay,
              autoplay_volume: autoplayVolume,
            },
            tab,
            selectedVoice // Pass selectedVoice as a separate argument
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

// Function to generate and play TTS
async function generateAndPlayTTS(ip, port, data, tab, selectedVoice) {
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

    console.log("Selected voice before popup:", selectedVoice); // Debug log

    // Open the playerpop.html with the audio URL and selected voice name as query parameters
    const popupUrl = `playerpop.html?audio=${encodeURIComponent(
      result.output_file_url
    )}&title=${encodeURIComponent(selectedVoice)}`;

    chrome.windows.create(
      {
        url: popupUrl,
        type: "popup",
        width: 500, // Define the width of the popup
        height: 300, // Define the height of the popup
        left: 100, // Optionally define the left position of the popup
        top: 100, // Optionally define the top position of the popup
      },
      function (window) {
        console.log(`Popup window created for voice: ${selectedVoice}`, window);
      }
    );
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

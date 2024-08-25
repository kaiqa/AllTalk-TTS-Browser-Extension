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
    // Create the main Play TTS context menu (as a standalone actionable item)
    chrome.contextMenus.create(
      {
        id: "playTTS",
        title: "Play",
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

    // Create the Voices submenu (not an actionable item)
    chrome.contextMenus.create(
      {
        id: "voicesParent",
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
            chrome.notifications.create({
              type: "basic",
              iconUrl: "images/icon.png",
              title: "Error",
              message:
                "No voices available, ensure TTS server is started then reload extension.",
            });
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
                parentId: "voicesParent", // Attach to Voices parent
                title: voice,
                contexts: ["selection"],
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
  const menuItemId = info.menuItemId;
  const selectionText = info.selectionText;

  console.log(`Menu item clicked: ${menuItemId}`);
  console.log(`Selected text: ${selectionText}`);

  if (!selectionText) {
    console.error("No text selected");
    chrome.notifications.create({
      type: "basic",
      iconUrl: "images/icon.png",
      title: "Error",
      message: "No text selected for TTS.",
    });
    return;
  }

  chrome.storage.sync.get(
    ["ip", "port", "characterVoice", "language"],
    (data) => {
      const ip = data.ip || "192.168.1.35";
      const port = data.port || "7851";
      let characterVoice = data.characterVoice || "female_01.wav"; // Default to settings' voice
      const language = data.language || "en";

      if (menuItemId === "playTTS") {
        console.log(
          "Top-level 'Play TTS' clicked, using default voice from settings."
        );
      } else {
        console.log(`Submenu voice selected: ${menuItemId}`);
        characterVoice = menuItemId; // Use the voice from the submenu
      }

      console.log("Final characterVoice being used:", characterVoice);

      const textInput = selectionText;
      const textFiltering = "standard";
      const narratorEnabled = "false";
      const narratorVoice = "male_01.wav";
      const textNotInside = "character";
      const outputFileName = "myoutputfile";
      const outputFileTimestamp = "true";
      const autoplay = "false";
      const autoplayVolume = "0.7";

      const requestData = {
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
      };

      console.log("Request Data:", requestData);

      generateAndPlayTTS(ip, port, requestData, tab, characterVoice, textInput);
    }
  );
});

// Function to generate and play TTS
async function generateAndPlayTTS(
  ip,
  port,
  data,
  tab,
  selectedVoice,
  selectionText
) {
  const url = `http://${ip}:${port}/api/tts-generate`;

  try {
    console.log("Sending POST request to:", url);
    console.log("Request data:", data);

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
      console.error(
        "Network response was not ok:",
        response.status,
        response.statusText
      );
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ["dist/content.bundle.js"],
        },
        () => {
          chrome.tabs.sendMessage(tab.id, { action: "hideSpinner" });
        }
      );
      throw new Error("Network response was not ok: " + response.statusText);
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

    console.log("Selected voice before popup:", selectedVoice);

    const popupUrl = `playerpop.html?audio=${encodeURIComponent(
      result.output_file_url
    )}&title=${encodeURIComponent(selectedVoice)}&text=${encodeURIComponent(
      selectionText
    )}`;

    chrome.windows.create(
      {
        url: popupUrl,
        type: "popup",
        width: 500,
        height: 500,
        left: 100,
        top: 100,
      },
      function (window) {
        console.log(`Popup window created for voice: ${selectedVoice}`, window);
      }
    );
  } catch (error) {
    console.error("Error requesting TTS audio:", error.message);
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

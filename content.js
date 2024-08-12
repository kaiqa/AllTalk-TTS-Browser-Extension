console.log("Content script loaded");
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showSpinner") {
    console.log("Received message to show spinner");
    showSpinner();
  }
  if (request.action === "hideSpinner") {
    console.log("Received message to hide spinner");
    hideSpinner();
  } else if (request.action === "playAudio") {
    console.log("Received message to play audio");
    playAudio(request.audioUrl);
  }
});

function showSpinner() {
  console.log("Creating spinner");
  // Check if the spinner already exists to avoid duplication
  if (!document.getElementById("tts-spinner")) {
    // Create and display a spinner element
    const spinner = document.createElement("div");
    spinner.id = "tts-spinner";
    spinner.style.position = "fixed";
    spinner.style.top = "50%";
    spinner.style.left = "50%";
    spinner.style.transform = "translate(-50%, -50%)";
    spinner.style.zIndex = "1000";
    spinner.style.border = "16px solid #f3f3f3";
    spinner.style.borderRadius = "50%";
    spinner.style.borderTop = "16px solid #3498db";
    spinner.style.width = "120px";
    spinner.style.height = "120px";
    spinner.style.animation = "spin 2s linear infinite";
    spinner.style.backgroundColor = "transparent"; // Explicit background color
    spinner.style.display = "block"; // Explicit display property
    document.body.appendChild(spinner);

    // Add CSS animation for the spinner
    const style = document.createElement("style");
    style.id = "spinner-style";
    style.innerHTML = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
    document.head.appendChild(style);
    console.log("Spinner created and added to DOM");
  } else {
    console.log("Spinner already exists");
  }
}

function hideSpinner() {
  console.log("Removing spinner");
  // Remove the spinner element
  const spinner = document.getElementById("tts-spinner");
  if (spinner) {
    spinner.remove();
    console.log("Spinner removed from DOM");
  } else {
    console.log("No spinner found to remove");
  }
  // Remove the style element
  const style = document.getElementById("spinner-style");
  if (style) {
    style.remove();
    console.log("Spinner style removed from DOM");
  } else {
    console.log("No spinner style found to remove");
  }
}

function playAudio(audioUrl) {
  console.log("trying to play audio for: " + audioUrl);
}

// document.addEventListener("mouseup", function (e) {
//   if (e.button === 0) {
//     // Left mouse button
//     const selectedText = window.getSelection().toString();
//     if (selectedText.length > 0) {
//       // Use e.pageX and e.pageY to include scroll offsets
//       showFloatingCount(e.pageX, e.pageY, selectedText.length);
//     }
//   }
// });

// function showFloatingCount(x, y, count) {
//   let floater = document.getElementById("text-counter-floater");
//   if (!floater) {
//     floater = document.createElement("div");
//     floater.id = "text-counter-floater";
//     document.body.appendChild(floater);
//   }
//   floater.textContent = `char: ${count}`;
//   floater.style.position = "absolute"; // Positioned relative to the document
//   floater.style.left = `${x}px`;
//   floater.style.top = `${y}px`;
//   floater.style.backgroundColor = "white";
//   floater.style.border = "1px solid black";
//   floater.style.padding = "2px 5px";
//   floater.style.zIndex = "1000";
//   setTimeout(() => {
//     floater.remove();
//   }, 1000); // Automatically remove after 2 seconds
// }

document.addEventListener('mouseup', function (e) {
    if (e.button === 0) { // Left mouse button
        const selectedText = window.getSelection().toString();
        if (selectedText.length > 0) {
            const textColor = shouldUseLightText() ? 'white' : 'black'; // Decide text color based on system theme
            const backgroundColor = shouldUseLightText() ? 'black' : 'white'; // Inverse of text color for background
            showFloatingCount(e.pageX, e.pageY, selectedText.length, textColor, backgroundColor);
        }
    }
});

function shouldUseLightText() {
    // Checks if the system is set to dark mode
    const darkModeOn = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return darkModeOn;
}

function showFloatingCount(x, y, count, textColor, backgroundColor) {
    let floater = document.getElementById('text-counter-floater');
    if (!floater) {
        floater = document.createElement('div');
        floater.id = 'text-counter-floater';
        document.body.appendChild(floater);
    }
    floater.textContent = `Count: ${count}`;
    floater.style.position = 'absolute';
    floater.style.left = `${x}px`;
    floater.style.top = `${y}px`;
    floater.style.color = textColor;
    floater.style.backgroundColor = backgroundColor;
    floater.style.border = '1px solid ' + (textColor === 'white' ? 'grey' : 'black');
    floater.style.padding = '2px 5px';
    floater.style.zIndex = '1000';
    setTimeout(() => { floater.remove(); }, 1000); // Remove after 1 seconds
}

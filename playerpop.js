// Extract the audio URL, voice name, and selected text from the query parameters
const params = new URLSearchParams(window.location.search);
const audioUrl = params.get("audio");
const voiceName = params.get("title");
const selectedText = params.get("text");

if (audioUrl) {
  const audioPlayer = document.getElementById("audioPlayer");
  audioPlayer.src = audioUrl;
}

if (voiceName) {
  document.title = voiceName;
  document.getElementById(
    "voiceName"
  ).textContent = `Playing Voice: ${voiceName}`;
}

const selectedTextElement = document.getElementById("selectedText");
if (selectedText) {
  selectedTextElement.textContent = `Selected Text: "${selectedText}"`;
} else {
  selectedTextElement.textContent = "No text selected.";
}
// Testing local llama model as proof of concept
// document
//   .getElementById("translateButton")
//   .addEventListener("click", async () => {
//     const queryAi = "Translate to German: " + selectedText;
//     const ollamaApiUrl = "http://localhost:11434/api/generate";

//     // Construct the request payload
//     const requestData = {
//       // model: "llama3.1:latest",
//       model: "llama3.1:latest",
//       keep_alive: 1,
//       prompt: queryAi,
//       format: "json",
//       stream: false,
//     };

//     try {
//       console.log("Sending request:", requestData);
//       const response = await fetch(ollamaApiUrl, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           // Authorization: "", // Include your access token here if necessary
//         },
//         body: JSON.stringify(requestData),
//       });

//       console.log("Response received");
//       if (!response.ok) {
//         const errorDetails = await response.text(); // Fetching text to see detailed error message
//         console.error("Server responded with non-OK status", errorDetails);
//         throw new Error(
//           `Network response was not ok. Status: ${response.status}. Details: ${errorDetails}`
//         );
//       }

//       const responseData = await response.json();
//       console.log("the response:", responseData); // Correctly log the object
//       const translatedText = responseData.response || "No translation provided"; // Adjust based on actual response structure
//       document.getElementById(
//         "translatedText"
//       ).textContent = `Translated Text: "${translatedText}"`;
//     } catch (error) {
//       console.error("Translation failed:", error);
//       document.getElementById("translatedText").textContent =
//         "Translation failed.";
//     }
//   });

// Extract the audio URL, voice name, and selected text from the query parameters
const params = new URLSearchParams(window.location.search);
const audioUrl = params.get("audio");
const voiceName = params.get("title");
const selectedText = params.get("text");

if (audioUrl) {
  const audioPlayer = document.getElementById("audioPlayer");
  audioPlayer.src = audioUrl;
} else {
  alert("No audio file provided!");
}

if (voiceName) {
  document.title = voiceName;
  document.getElementById(
    "voiceName"
  ).textContent = `Playing Voice: ${voiceName}`;
}

if (selectedText) {
  document.getElementById("selectedText").textContent = `"${selectedText}"`;
} else {
  document.getElementById("selectedText").textContent = "No text selected.";
}

// Extract the audio URL and voice name from the query parameters
const params = new URLSearchParams(window.location.search);
const audioUrl = params.get("audio");
const voiceName = params.get("title");

if (audioUrl) {
  // Set the audio source to the provided URL
  const audioPlayer = document.getElementById("audioPlayer");
  audioPlayer.src = audioUrl;
} else {
  // Handle the case where no audio URL is provided
  alert("No audio file provided!");
}

if (voiceName) {
  // Set the document title and display the voice name
  document.title = voiceName;
  document.getElementById(
    "voiceName"
  ).textContent = `Playing Voice: ${voiceName}`;
}

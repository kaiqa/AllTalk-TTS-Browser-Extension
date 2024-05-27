chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showSpinner") {
        console.log('Received message to show spinner');
        showSpinner();
    } else if (request.action === "hideSpinner") {
        console.log('Received message to hide spinner');
        hideSpinner();
    }
});

function showSpinner() {
    console.log('Creating spinner');
    // Check if the spinner already exists to avoid duplication
    if (!document.getElementById('tts-spinner')) {
        // Create and display a spinner element
        const spinner = document.createElement('div');
        spinner.id = 'tts-spinner';
        spinner.style.position = 'fixed';
        spinner.style.top = '50%';
        spinner.style.left = '50%';
        spinner.style.transform = 'translate(-50%, -50%)';
        spinner.style.zIndex = '1000';
        spinner.style.border = '16px solid #f3f3f3';
        spinner.style.borderRadius = '50%';
        spinner.style.borderTop = '16px solid #3498db';
        spinner.style.width = '120px';
        spinner.style.height = '120px';
        spinner.style.animation = 'spin 2s linear infinite';
        spinner.style.backgroundColor = 'white';  // Explicit background color
        spinner.style.display = 'block';  // Explicit display property
        document.body.appendChild(spinner);

        // Add CSS animation for the spinner
        const style = document.createElement('style');
        style.id = 'spinner-style';
        style.innerHTML = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        console.log('Spinner created and added to DOM');
    } else {
        console.log('Spinner already exists');
    }
}

function hideSpinner() {
    console.log('Removing spinner');
    // Remove the spinner element
    const spinner = document.getElementById('tts-spinner');
    if (spinner) {
        spinner.remove();
        console.log('Spinner removed from DOM');
    } else {
        console.log('No spinner found to remove');
    }
    // Remove the style element
    const style = document.getElementById('spinner-style');
    if (style) {
        style.remove();
        console.log('Spinner style removed from DOM');
    } else {
        console.log('No spinner style found to remove');
    }
}

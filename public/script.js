async function sendMessage() {
  const userInput = document.getElementById('userInput').value;
  if (!userInput) return;

  const chatbox = document.getElementById("chatbox");
  const userMessage = document.createElement("div");
  userMessage.className = "user-message";
  userMessage.textContent = `You: ${userInput}`;
  chatbox.appendChild(userMessage);

  const loadingMessage = document.createElement("div");
  loadingMessage.className = "ai-message loading-msg";
  loadingMessage.innerText = "SenBoom is thinking...";
  chatbox.appendChild(loadingMessage);

  try {
    const response = await fetch("https://senboom-api.onrender.com/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question: userInput })
    });

    const data = await response.json();
    loadingMessage.remove();

    const reply = document.createElement("div");
    reply.className = "ai-message";
    reply.innerText = `SenBoom: ${data.reply}`;
    chatbox.appendChild(reply);
    speakText(data.reply, window.detectedLanguage || 'en-US');
  } catch (error) {
    loadingMessage.remove();

    const errorMsg = document.createElement("div");
    errorMsg.className = "ai-message";
    errorMsg.innerText = `⚠️ Error: ${error.message}`;
    chatbox.appendChild(errorMsg);
  }

  chatbox.scrollTop = chatbox.scrollHeight;
  document.getElementById("userInput").value = "";
}
function startVoiceInput() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Sorry, your browser doesn't support voice input.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = navigator.language || 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  window.detectedLanguage = recognition.lang;
  recognition.start();

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("userInput").value = transcript;
  };

  recognition.onerror = function(event) {
    console.error("Voice input error:", event.error);
    alert("Voice input failed. Try again.");
  };
}
function speakText(text, languageCode = 'en-US') {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);

    // ✅ Log language for debugging
    console.log("Speaking in:", languageCode);

    // ✅ Fallback if browser doesn't support this language's voice
    if (!speechSynthesis.getVoices().some(v => v.lang === languageCode)) {
      utterance.lang = 'en-US'; // fallback
    } else {
      utterance.lang = languageCode;
    }

    utterance.rate = 1;
    speechSynthesis.speak(utterance);
  } else {
    console.warn("Sorry, your browser doesn't support text-to-speech.");
  }
}

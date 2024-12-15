// JavaScript for Medical AI Chat Webpage

const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");

// State variables
let userMessage = null;
let isResponseGenerating = false;

// API Configuration
const API_KEY = "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"; // Replace with your Groq API key
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Medical AI assistant prompt for accurate, structured responses
const MEDICAL_AI_PROMPT = `You are a medical AI assistant specialized in MBBS education. 

**Your responses should include:**
- Clinical accuracy and evidence-based information
- Relevant **anatomical and physiological context**
- References to standard medical guidelines
- Proper medical terminology and key diagnostic criteria
- Bullet points for **differential diagnoses** and **clinical pearls**

**Formatting Instructions:**
- Explain in point wise simple language
- Use headings and bold text for key points
- Present lists with bullet points for clarity
- Add cautionary notes where appropriate`;

// Load theme and chat data from local storage
const loadDataFromLocalstorage = () => {
  const savedChats = localStorage.getItem("saved-chats");
  const isLightMode = localStorage.getItem("themeColor") === "light_mode";

  document.body.classList.toggle("light_mode", isLightMode);
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

  chatContainer.innerHTML = savedChats || '';
  document.body.classList.toggle("hide-header", !!savedChats);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

// Create a message element
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Show typing effect for message content
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
  const words = text.split(" ");
  let currentWordIndex = 0;

  const typingInterval = setInterval(() => {
    textElement.innerText += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];
    incomingMessageDiv.querySelector(".icon").classList.add("hide");

    if (currentWordIndex === words.length) {
      clearInterval(typingInterval);
      isResponseGenerating = false;
      incomingMessageDiv.querySelector(".icon").classList.remove("hide");
      localStorage.setItem("saved-chats", chatContainer.innerHTML);
    }
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
  }, 75);
};

const markdownToHtml = (markdown) => {
  return markdown
    .replace(/^# (.*$)/gm, '<h1><strong>$1</strong></h1>')
    .replace(/^## (.*$)/gm, '<h2><strong>$1</strong></h2>')
    .replace(/^### (.*$)/gm, '<h3><strong>$1</strong></h3>')
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n{2,}/g, '\n') // Remove excessive line breaks
    .trim();
};

// Fetch and display API response
const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: MEDICAL_AI_PROMPT },
          { role: "user", content: userMessage },
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    const apiResponse = markdownToHtml(data.choices[0].message.content);
    showTypingEffect(apiResponse, textElement, incomingMessageDiv);
  } catch (error) {
    isResponseGenerating = false;
    textElement.innerText = error.message;
    incomingMessageDiv.classList.add("error");
  } finally {
    incomingMessageDiv.classList.remove("loading");
  }
};

// Display loading animation during API call
const showLoadingAnimation = () => {
  const html = `<div class="message-content">
                  <img class="avatar" src="images/gemini.svg" alt="AI avatar">
                  <p class="text"></p>
                  <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                  </div>
                </div>
                <span onClick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

  const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
  chatContainer.appendChild(incomingMessageDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  generateAPIResponse(incomingMessageDiv);
};

// Copy text to clipboard
const copyMessage = (copyButton) => {
  const messageText = copyButton.parentElement.querySelector(".text").innerText;
  navigator.clipboard.writeText(messageText);
  copyButton.innerText = "done";
  setTimeout(() => copyButton.innerText = "content_copy", 1000);
};

// Handle outgoing chat messages
const handleOutgoingChat = () => {
  userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
  if (!userMessage || isResponseGenerating) return;

  isResponseGenerating = true;

  const html = `<div class="message-content">
                  <img class="avatar" src="images/user.jpg" alt="User avatar">
                  <p class="text"></p>
                </div>`;

  const outgoingMessageDiv = createMessageElement(html, "outgoing");
  outgoingMessageDiv.querySelector(".text").innerText = userMessage;
  chatContainer.appendChild(outgoingMessageDiv);

  typingForm.reset();
  document.body.classList.add("hide-header");
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  setTimeout(showLoadingAnimation, 500);
};

// Theme toggle button handler
toggleThemeButton.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

// Delete chat button handler
deleteChatButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all chats?")) {
    localStorage.removeItem("saved-chats");
    loadDataFromLocalstorage();
  }
});

// Suggestions click handler
suggestions.forEach(suggestion => {
  suggestion.addEventListener("click", () => {
    userMessage = suggestion.querySelector(".text").innerText;
    handleOutgoingChat();
  });
});

// Form submission handler
typingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleOutgoingChat();
});

// Initialize the application
loadDataFromLocalstorage();

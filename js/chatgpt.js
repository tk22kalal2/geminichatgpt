import { generateResponse } from './services/apiService.js';
import { saveChats, loadChats, clearChats } from './utils/storage.js';
import { createMessageElement, addSuggestionClickHandlers } from './components/chatUI.js';

// DOM Elements
const chatContainer = document.querySelector(".chat-list");
const chatInput = document.querySelector(".typing-input");
const chatForm = document.querySelector(".typing-form");
const themeButton = document.querySelector("#theme-toggle-button");
const deleteButton = document.querySelector("#delete-chat-button");

let isResponseGenerating = false;

// Initialize chat
const initializeChat = () => {
  const savedChats = loadChats();
  if (savedChats) chatContainer.innerHTML = savedChats;
  addSuggestionClickHandlers(chatInput);
  handleTheme();
};

// Theme handling
const handleTheme = () => {
  const isDarkMode = localStorage.getItem("dark-mode") === "true";
  document.body.classList.toggle("dark-mode", isDarkMode);
  themeButton.innerText = isDarkMode ? "light_mode" : "dark_mode";
};

// Message handling
const handleChat = async (userMessage) => {
  if (isResponseGenerating) return;
  
  // Create and add user message
  const outgoingDiv = createMessageElement(userMessage, false);
  outgoingDiv.querySelector(".text").textContent = userMessage;
  chatContainer.appendChild(outgoingDiv);
  chatInput.value = "";
  
  // Create and add AI message
  const incomingDiv = createMessageElement("", true);
  incomingDiv.classList.add("loading");
  chatContainer.appendChild(incomingDiv);
  
  // Scroll to bottom
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  
  try {
    isResponseGenerating = true;
    const response = await generateResponse(userMessage);
    incomingDiv.querySelector(".text").innerHTML = response;
    incomingDiv.querySelector(".icon").classList.remove("hide");
    saveChats(chatContainer.innerHTML);
  } catch (error) {
    incomingDiv.querySelector(".text").innerText = error.message;
    incomingDiv.classList.add("error");
  } finally {
    isResponseGenerating = false;
    incomingDiv.classList.remove("loading");
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
  }
};

// Event Listeners
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;
  handleChat(userMessage);
});

themeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("dark-mode", document.body.classList.contains("dark-mode"));
  handleTheme();
});

deleteButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all chats?")) {
    chatContainer.innerHTML = "";
    clearChats();
  }
});

// Initialize the chat application
document.addEventListener("DOMContentLoaded", initializeChat);

// Chat UI related functions
export const createMessageElement = (message, isIncoming = false) => {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", isIncoming ? "incoming" : "outgoing");
  
  messageDiv.innerHTML = `
    <div class="icon material-symbols-rounded ${isIncoming ? "" : "hide"}">
      ${isIncoming ? "smart_toy" : "person"}
    </div>
    <div class="text"></div>
  `;
  
  return messageDiv;
};

export const addSuggestionClickHandlers = (chatInput) => {
  const suggestions = document.querySelectorAll(".suggestion");
  suggestions.forEach(suggestion => {
    suggestion.addEventListener("click", () => {
      const text = suggestion.querySelector(".text").textContent;
      chatInput.value = text;
      chatInput.focus();
    });
  });
};

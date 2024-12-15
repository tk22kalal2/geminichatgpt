// Local storage utilities
export const saveChats = (chatHTML) => {
  localStorage.setItem("saved-chats", chatHTML);
};

export const loadChats = () => {
  return localStorage.getItem("saved-chats");
};

export const clearChats = () => {
  localStorage.removeItem("saved-chats");
};

"use babel";

export default class ChatgptView {
  constructor(serializedState) {
    // Root element should use the same classes for consistent styling
    this.element = document.createElement("div");
    this.element.classList.add("atom-ide-chat");

    // Message area
    this.messagesArea = document.createElement("div");
    this.messagesArea.classList.add("chat-messages");
    this.element.appendChild(this.messagesArea);

    // Input area
    this.inputArea = document.createElement("textarea");
    this.inputArea.classList.add("chat-input");
    this.element.appendChild(this.inputArea);

    // Send button
    this.sendButton = document.createElement("button");
    this.sendButton.classList.add("chat-send-button");
    this.sendButton.textContent = "Send";
    this.sendButton.addEventListener("click", () => this.sendMessage());
    this.element.appendChild(this.sendButton);
  }

  async sendMessage() {
    const message = this.inputArea.value;
    this.updateMessagesArea(message, true);
    const response = await this.chatFunction(message); // Call the ChatGPT function
    this.updateMessagesArea(response, false);
    this.inputArea.value = "";
  }

  setChatFunction(chatFunction) {
    this.chatFunction = chatFunction;
  }

  // Inside ChatgptView class

  getElement() {
    return this.element;
  }
}

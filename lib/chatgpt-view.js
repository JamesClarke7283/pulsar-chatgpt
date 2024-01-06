"use babel";

export default class ChatgptView {
  constructor(serializedState) {
    // Root element should use the same classes for consistent styling
    this.element = document.createElement("div");
    this.element.classList.add("chatgpt-pane-item"); // Use the class for the pane item

    // Message area
    this.messagesArea = document.createElement("div");
    this.messagesArea.classList.add("chatgpt-messages-container"); // Use the class for the messages container
    this.element.appendChild(this.messagesArea);

    // Input container
    this.inputContainer = document.createElement("div");
    this.inputContainer.classList.add("chatgpt-input-container"); // Use the class for the input container
    this.element.appendChild(this.inputContainer);

    // Input area
    this.inputArea = document.createElement("textarea");
    this.inputArea.classList.add("chatgpt-input-area"); // Use the class for the input area
    this.inputContainer.appendChild(this.inputArea); // Append inputArea to the inputContainer

    // Send button
    this.sendButton = document.createElement("button");
    this.sendButton.classList.add("chatgpt-send-btn"); // Use the class for the send button
    this.sendButton.textContent = "Send";
    this.sendButton.addEventListener("click", () => this.sendMessage());
    this.inputContainer.appendChild(this.sendButton); // Append sendButton to the inputContainer

    // In your ChatgptView class constructor or initialization method
    this.inputArea.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        // Prevent default action of sending message when Enter is pressed
        event.preventDefault();
        // Insert a newline at the current cursor position
        const start = this.inputArea.selectionStart;
        const end = this.inputArea.selectionEnd;
        const text = this.inputArea.value;
        const before = text.substring(0, start);
        const after = text.substring(end);
        this.inputArea.value = before + "\n" + after;
        // Move the cursor to right after the inserted newline
        this.inputArea.selectionStart = this.inputArea.selectionEnd = start + 1;
      }
    });
  }

  getTitle() {
    // Implementing getTitle to fix the error
    return "ChatGPT";
  }

  // Add this method to fix the updateMessagesArea is not a function error

  updateMessagesArea(message, isUser) {
    const messageElement = document.createElement("div");
    messageElement.textContent = message;
    messageElement.classList.add("chat-message");
    if (isUser) {
      messageElement.dataset.sender = "You";
      messageElement.classList.add("user-message");
    } else {
      messageElement.dataset.sender = "ChatGPT";
      messageElement.classList.add("gpt-message");
    }
    this.messagesArea.appendChild(messageElement);
  }

  async sendMessage() {
    const message = this.inputArea.value.trim();
    if (message) {
      this.updateMessagesArea(message, true);
      const response = await this.chatFunction(message); // Call the ChatGPT function
      this.updateMessagesArea(response, false);
      this.inputArea.value = "";
    }
  }

  setChatFunction(chatFunction) {
    this.chatFunction = chatFunction;
  }

  getElement() {
    return this.element;
  }
}

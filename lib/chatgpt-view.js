"use babel";

const { render } = require("atom-ide-markdown-service/dist/renderer")

export default class ChatgptView {
  handleSendButtonClick() {
  // Retrieve text from atom-text-editor
  const editor = this.inputEditorElement.getModel();
  const message = editor.getText().trim();
  if (message) {
    this.sendMessageToOpenAI(message);
    editor.setText(''); // Clear the editor after sending the message
  }
}

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
    this.inputEditorElement = document.createElement('atom-text-editor');
    this.inputEditorElement.classList.add("chatgpt-input-area"); // Use the same class for styling
    this.inputContainer.appendChild(this.inputEditorElement);

    // Ensure the editor is fully loaded before configuring
  setImmediate(() => {
      const editorModel = this.inputEditorElement.getModel();
      const lineNumberGutter = editorModel.gutterWithName('line-number');
      if (lineNumberGutter) {
          lineNumberGutter.hide();
      }
  });

    // Send button
    this.sendButton = document.createElement("button");
    this.sendButton.classList.add("chatgpt-send-btn"); // Use the class for the send button
    this.sendButton.textContent = "Send";
    this.sendButton.addEventListener('click', () => {
  this.handleSendButtonClick(); // Updated to the correct method name
});
    this.inputContainer.appendChild(this.sendButton); // Append sendButton to the inputContainer

    if (serializedState && serializedState.messages) {
      serializedState.messages.forEach(({ content, sender }) => {
        this.updateMessagesArea(content, sender === 'user');
      });
    }
  }

  async sendMessageToOpenAI(messageContent) {
    const userMessage = messageContent;
    if (userMessage) {
        // Create a message element for the user's input and add it to the messages area
        this.updateMessagesArea(userMessage, true);

        // Clear the input area after sending the message
        this.inputArea.value = "";

        // Set up the API request data
        const model = atom.config.get('ChatGPT.Model') || 'gpt-3.5-turbo';
        const apiKey = atom.config.get('ChatGPT.APIKey');
        const customInstructions = atom.config.get('ChatGPT.CustomInstructions');
        const data = {
            model: model,
            messages: [{ role: "user", content: userMessage }, {
        role: "system",
        content: "Always Respond in plaintext markdown as it will be run through a markdown to html converter." + customInstructions
      }],
            stream: true
        };
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            let partialData = '';

            // Create an initial message element for the bot's response with empty content
            const botMessageElement = this.createMessageElement('', false);
            var response_string = ""
            this.messagesArea.appendChild(botMessageElement);

            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    break;
                }
                if (value) {
                    partialData += new TextDecoder("utf-8").decode(value, { stream: true });
                    let lastNewlineIndex = partialData.lastIndexOf("\n");
                    if (lastNewlineIndex !== -1) {
                        let completeMessages = partialData.substring(0, lastNewlineIndex);
                        partialData = partialData.substring(lastNewlineIndex + 1);

                        completeMessages.split("\n").forEach((messageStr) => {
                            if (!messageStr.trim()) {
                                return;
                            }
                            if (messageStr.trim() === "data: [DONE]") {
                                return;
                            }

                            let jsonStr = messageStr.startsWith("data: ") ? messageStr.substring(5) : messageStr;
                            try {
                                const json = JSON.parse(jsonStr);
                                if (json.choices && json.choices[0].delta && json.choices[0].delta.content) {
                                    // Update the bot's message element with the new content
                                    if (render) {
      try {
        response_string += json.choices[0].delta.content;
        render(response_string).then(renderedHTML => {
 botMessageElement.innerHTML = renderedHTML;

}).catch(e => {
 console.error('Markdown rendering error:', e);
});
      } catch (e) {
        console.error('Markdown rendering error:', e);
      }
    } else {
      console.error('Markdown service is not available.');
    }
                                }
                            } catch (e) {
                                console.error('JSON parsing error within the stream:', e);
                            }
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error in sending message to ChatGPT:", error);
            atom.notifications.addError("ChatGPT Error", {
                detail: "Unable to get a response from ChatGPT. Please check your API key and internet connection.",
                dismissable: true,
            });
        }
    }
}

updateMessagesAreaMarkdown(markdown, isUser) {
  // Use the markdown service to render HTML
  if (render) {
    const html = render(markdown);
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message");
    messageElement.innerHTML = html; // Set the inner HTML to the rendered HTML
    if (isUser) {
      messageElement.dataset.sender = "You";
      messageElement.classList.add("user-message");
    } else {
      messageElement.dataset.sender = "ChatGPT";
      messageElement.classList.add("gpt-message");
    }
    this.messagesArea.appendChild(messageElement);
  }
}

// Add this helper method to create a message element
createMessageElement(content, isUser) {
  const messageElement = document.createElement("div");
  messageElement.innerHTML = content; // Set the content as innerHTML instead of textContent
  messageElement.classList.add("chat-message");
  if (isUser) {
    messageElement.dataset.sender = "You";
    messageElement.classList.add("user-message");
  } else {
    messageElement.dataset.sender = "ChatGPT";
    messageElement.classList.add("gpt-message");
  }
  return messageElement;
}






  getTitle() {
    // Implementing getTitle to fix the error
    return "ChatGPT";
  }

  serialize() {
    const messages = Array.from(this.messagesArea.children).map(messageElement => ({
      content: messageElement.textContent,
      sender: messageElement.dataset.sender
    }));

    return { messages };
  }

  // Add this method to fix the updateMessagesArea is not a function error

  updateMessagesArea(message, isUser) {
  const messageElement = this.createMessageElement(message, isUser);
  this.messagesArea.appendChild(messageElement);
}


  setChatFunction(chatFunction) {
    this.chatFunction = chatFunction;
  }

  getElement() {
    return this.element;
  }
}

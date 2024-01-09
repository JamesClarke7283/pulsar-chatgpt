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
    this.serializedState = serializedState || { messages: [] };

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

// Options button
this.optionsButton = document.createElement("button");
this.optionsButton.textContent = "Options";
this.optionsButton.classList.add("chatgpt-options-btn");
this.optionsButton.addEventListener('click', () => {
  this.showOptionsModal(); // Function to show the modal
});
this.inputContainer.appendChild(this.optionsButton);


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
      serializedState.messages.forEach(({ markdown, htmlContent, isUser }) => {
        if (markdown) {
          // If markdown is available, render it
          render(markdown).then(renderedHTML => {
            this.messagesArea.appendChild(this.createMessageElement(renderedHTML, isUser, markdown));
          }).catch(e => {
            console.error('Markdown rendering error:', e);
          });
        } else {
          // If only HTML content is available, use it directly
          this.messagesArea.appendChild(this.createMessageElement(htmlContent, isUser));
        }
      });
    }
    // Add this inside the constructor
window.addEventListener('click', (event) => {
  if (event.target === this.optionsModal) {
    this.closeOptionsModal();
  }
});

  }

  async sendMessageToOpenAI(messageContent) {
      const userMessage = messageContent;
      if (userMessage) {
          // Create a message element for the user's input and add it to the messages area
          this.updateMessagesArea(userMessage, true);

          // Clear the text from the atom-text-editor model
          const editor = this.inputEditorElement.getModel();
          editor.setText('');

          // Set up the API request data
          const model = atom.config.get('ChatGPT.Model') || 'gpt-3.5-turbo';
          const apiKey = atom.config.get('ChatGPT.APIKey');
          const customInstructions = atom.config.get('ChatGPT.CustomInstructions');
          const data = {
              model: model,
              messages: [{ role: "user", content: userMessage }, {
                  role: "system",
                  content: customInstructions
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
              this.messagesArea.appendChild(botMessageElement);
              var response_string = "";

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
                                      response_string += json.choices[0].delta.content;

                                      // Update the bot's message element with the new content
                                      if (render) {
                                          try {
                                              render(response_string).then(renderedHTML => {
                                                  botMessageElement.innerHTML = renderedHTML;
                                                  this.addCopyButtons(botMessageElement);
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

  // Ensure the createCopyButton and addCopyButtons functions are defined in your class as well.


// Additional methods needed for sendMessageToOpenAI to work:

// Existing functions and code...

// ... other methods ...

createCopyButton(codeElement) {
  const copyButton = document.createElement('button');
  copyButton.textContent = 'Copy Code';
  copyButton.classList.add('copy-code-button');
  copyButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent bubbling
    atom.clipboard.write(codeElement.textContent);
    copyButton.textContent = 'Copied!';
    setTimeout(() => copyButton.textContent = 'Copy Code', 2000); // Reset button text after 2 seconds
  }, { once: true });
  return copyButton;
}

addCopyButtons(containerElement) {
  const codeBlocks = containerElement.querySelectorAll('pre code');
  codeBlocks.forEach(codeBlock => {
    const codeContainer = document.createElement('div');
    codeContainer.classList.add('code-container');

    // Create the container for the language label and copy button
    const codeCopyContainer = document.createElement('div');
    codeCopyContainer.classList.add('code-copy-container');

    const languageLabel = document.createElement('span');
    languageLabel.classList.add('code-language-label');
    languageLabel.textContent = 'rust'; // Set the language dynamically if needed

    const copyButton = this.createCopyButton(codeBlock);

    // Append the label and button to the codeCopyContainer
    codeCopyContainer.appendChild(languageLabel);
    codeCopyContainer.appendChild(copyButton);

    // Insert the codeCopyContainer into the codeContainer before the code block
    codeContainer.appendChild(codeCopyContainer);

    const preElement = codeBlock.parentNode;
    preElement.parentNode.insertBefore(codeContainer, preElement);
    codeContainer.appendChild(preElement);
  });
}

clearChatHistory() {
  // Clear the messages from the messages area
  this.messagesArea.innerHTML = '';
  // Ensure serializedState is an object with a messages array before trying to clear it
  if (!this.serializedState) {
    this.serializedState = { messages: [] };
  } else {
    this.serializedState.messages = [];
  }
}



updateMessagesAreaMarkdown(markdown, isUser) {
  if (render) {
    render(markdown).then(html => {
      // Create a new message element with the rendered HTML and the original markdown
      const messageElement = document.createElement('div');
      messageElement.classList.add('chat-message');
      messageElement.innerHTML = html; // Set the rendered HTML content
      messageElement.setAttribute('data-markdown', markdown); // Save the original markdown

      // Add classes based on the sender
      if (isUser) {
        messageElement.classList.add('user-message');
      } else {
        messageElement.classList.add('gpt-message');
      }

      // Insert the message element into the messages area
      this.messagesArea.appendChild(messageElement);

      // Add copy buttons to any code elements within the message
      const codeElements = messageElement.querySelectorAll('code');
      codeElements.forEach(codeElement => {
        // For each code tag found, create and insert a copy button
        const copyButton = this.createCopyButton(codeElement);
        codeElement.parentNode.insertBefore(copyButton, codeElement.nextSibling); // Insert after the code element
      });

    }).catch(e => {
      console.error('Markdown rendering error:', e);
    });
  } else {
    console.error('Markdown service is not available.');
  }
}



// Add this helper method to create a message element
createMessageElement(htmlContent, isUser, markdown = null) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message");
  messageElement.innerHTML = htmlContent;
  if (markdown) {
    messageElement.setAttribute('data-markdown', markdown);
  }
  if (isUser) {
    messageElement.classList.add("user-message");
  } else {
    messageElement.classList.add("gpt-message");
  }
  return messageElement;
}







  getTitle() {
    // Implementing getTitle to fix the error
    return "ChatGPT";
  }

  serialize() {
    if (!this.messagesArea) {
      // If messagesArea is not defined, return an empty state
      return { messages: [] };
    }

    // Else, serialize the existing messages
    const messages = Array.from(this.messagesArea.querySelectorAll('.chat-message')).map(messageElement => {
      return {
        htmlContent: messageElement.innerHTML,
        markdown: messageElement.getAttribute('data-markdown'),
        isUser: messageElement.classList.contains('user-message')
      };
    });

    return { messages };
  }
  
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

  showOptionsModal() {
  // Create the modal container
  this.optionsModal = document.createElement('div');
  this.optionsModal.classList.add('chatgpt-modal');

  // Modal content
  const modalContent = document.createElement('div');
  modalContent.classList.add('chatgpt-modal-content');

  // Close button for the modal
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.classList.add('chatgpt-modal-close-btn');
  closeButton.onclick = () => this.closeOptionsModal();
  modalContent.appendChild(closeButton);

  // Clear chat button inside modal
  const clearChatButtonModal = document.createElement('button');
  clearChatButtonModal.textContent = "Clear Chat";
  clearChatButtonModal.addEventListener('click', () => {
    this.clearChatHistory();
    this.closeOptionsModal(); // Use the close method
  });

  // Append the button to the modal content
  modalContent.appendChild(clearChatButtonModal);

  // Append the modal content to the modal container
  this.optionsModal.appendChild(modalContent);

  // Append the modal container to the document body to show it
  document.body.appendChild(this.optionsModal);
}

  closeOptionsModal() {
    if (this.optionsModal) {
      this.optionsModal.remove();
    }
  }
}

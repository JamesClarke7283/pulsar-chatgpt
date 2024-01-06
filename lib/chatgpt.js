"use babel";

import ChatgptView from "./chatgpt-view.js";
import { CompositeDisposable } from "atom";
const axios = require("axios");

export default {
  chatgptView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.chatgptView = new ChatgptView(state.chatgptViewState);
    // Add the view to the right dock instead of a modal panel
    const rightDock = atom.workspace.getRightDock();
    const [pane] = rightDock.getPanes();
    pane.addItem(this.chatgptView.getElement());
    pane.show();

    this.subscriptions = new CompositeDisposable(
      atom.commands.add("atom-workspace", {
        "chatgpt:toggle": () => this.toggle(),
      }),
    );

    // Fetch and set the user's API key from the configuration
    const apiKey = atom.config.get("chatgpt.apiKey");
    this.chatgptView.setChatFunction(async (message) => {
      try {
        const response = await axios.post(
          "https://api.openai.com/v1/engines/chatgpt/completions",
          { prompt: message, max_tokens: 150 },
          { headers: { "Authorization": `Bearer ${apiKey}` } },
        );
        return response.data.choices[0].text;
      } catch (error) {
        console.error("Error in sending message to ChatGPT:", error);
        return "Error: Unable to get a response from ChatGPT.";
      }
    });
  },

  deactivate() {
    this.subscriptions.dispose();
    if (this.chatgptView) {
      this.chatgptView.destroy();
      this.chatgptView = null;
    }
  },

  serialize() {
    return {
      chatgptViewState: this.chatgptView.serialize(),
    };
  },

  toggle() {
    const rightDock = atom.workspace.getRightDock();
    if (
      rightDock.isVisible() &&
      rightDock.getActivePaneItem() === this.chatgptView
    ) {
      rightDock.hide();
    } else {
      rightDock.show();
      rightDock.activateItem(this.chatgptView);
    }
  },
};

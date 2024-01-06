"use babel";

import ChatgptView from "./chatgpt-view.js";
import { CompositeDisposable } from "atom";
import { config } from './config';

export default {
  config: config,
  chatgptView: null,
  modalPanel: null,
  subscriptions: null,
  sendMessage: null,

  activate(state) {
    // Initialize the OpenAI instance with the API key from the settings
    const apiKey = atom.config.get("ChatGPT.APIKey");
    if (!apiKey) {
      atom.notifications.addError("ChatGPT Error", {
        detail:
          "API key is missing. Please enter your ChatGPT API key in the package settings.",
        dismissable: true,
      });
      return; // Stop further execution if the API key is missing
    }

    this.chatgptView = new ChatgptView(state.chatgptViewState);
    const rightDock = atom.workspace.getRightDock();
    const [pane] = rightDock.getPanes();
    pane.addItem(this.chatgptView);
    pane.activateItem(this.chatgptView);
    rightDock.show();

    this.subscriptions = new CompositeDisposable(
      atom.commands.add("atom-workspace", {
        "chatgpt:toggle": () => this.toggle(),
      }),
    );

     this.chatgptView.setChatFunction(this.chatgptView.handleSendButtonClick.bind(this.chatgptView));
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
      chatgptViewState: this.chatgptView ? this.chatgptView.serialize() : {}
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
      const [pane] = rightDock.getPanes();
      pane.activateItem(this.chatgptView);
    }
  },
};

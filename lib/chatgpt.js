"use babel";

import ChatgptView from "./chatgpt-view.js";
import { CompositeDisposable } from "atom";
import { config } from './config';

export default {
  chatgptView: null,
  modalPanel: null,
  subscriptions: null,
  markdownService: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable(
      atom.commands.add("atom-workspace", {
        "chatgpt:toggle": () => this.toggle(),
      })
    );

    // Check for API key
    const apiKey = atom.config.get("ChatGPT.APIKey");
    if (!apiKey) {
      atom.notifications.addError("ChatGPT Error", {
        detail: "API key is missing. Please enter your ChatGPT API key in the package settings.",
        dismissable: true,
      });
      return;
    }
    this.initializeChatgptView(state);
  },

  initializeChatgptView(state) {

    this.chatgptView = new ChatgptView(state.chatgptViewState);
    this.chatgptView.setChatFunction(this.chatgptView.handleSendButtonClick.bind(this.chatgptView));
    this.addToRightDock(this.chatgptView);
  },

  addToRightDock(view) {
    const rightDock = atom.workspace.getRightDock();
    const [pane] = rightDock.getPanes();
    pane.addItem(view);
    pane.activateItem(view);
    rightDock.show();
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
    if (!this.chatgptView) {
      console.error('ChatGPT View is not initialized');
      return;
    }

    const rightDock = atom.workspace.getRightDock();
    if (rightDock.isVisible() && rightDock.getActivePaneItem() === this.chatgptView) {
      rightDock.hide();
    } else {
      rightDock.show();
      const [pane] = rightDock.getPanes();
      if (!pane.items.includes(this.chatgptView)) {
        pane.addItem(this.chatgptView);
      }
      pane.activateItem(this.chatgptView);
    }
  }
};

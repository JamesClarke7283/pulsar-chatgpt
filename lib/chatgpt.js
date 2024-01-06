'use babel';

import ChatgptView from './chatgpt-view';
import { CompositeDisposable } from 'atom';

export default {

  chatgptView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.chatgptView = new ChatgptView(state.chatgptViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.chatgptView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'chatgpt:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.chatgptView.destroy();
  },

  serialize() {
    return {
      chatgptViewState: this.chatgptView.serialize()
    };
  },

  toggle() {
    console.log('Chatgpt was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};

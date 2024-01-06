// config.js
module.exports.config = {
  APIKey: {
    title: 'ChatGPT API Key',
    description: 'Your API key for accessing ChatGPT API.',
    type: 'string',
    default: '',
    order: 1,
  },
  Model: {
    title: 'ChatGPT Model',
    description: 'The model to be used for responses.',
    type: 'string',
    default: 'gpt-3.5-turbo',
    enum: [
      { value: 'gpt-3.5-turbo', description: 'GPT-3.5 Turbo' },
      { value: 'gpt-3', description: 'GPT-3' },
      // Add more models as needed
    ],
    order: 2,
  },
  // Add other settings as needed
};

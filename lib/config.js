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
      // Starting with GPT-3 models
      { value: 'gpt-3.5-turbo', description: 'GPT-3.5 Turbo' },
      { value: 'gpt-3.5-turbo-0301', description: 'GPT-3.5 Turbo (March 1 version)' },
      { value: 'gpt-3.5-turbo-16k-0613', description: 'GPT-3.5 Turbo 16k (June 13 version)' },
      { value: 'gpt-3.5-turbo-instruct', description: 'GPT-3.5 Turbo Instruct' },
      { value: 'gpt-3.5-turbo-16k', description: 'GPT-3.5 Turbo 16k' },
      { value: 'gpt-3.5-turbo-0613', description: 'GPT-3.5 Turbo (June 13 version)' },
      { value: 'gpt-3.5-turbo-instruct-0914', description: 'GPT-3.5 Turbo Instruct (September 14 version)' },
      { value: 'gpt-3.5-turbo-1106', description: 'GPT-3.5 Turbo (November 6 version)' },

      // GPT-4 models
      { value: 'gpt-4-0613', description: 'GPT-4 (June 13 version)' },
      { value: 'gpt-4-1106-preview', description: 'GPT-4 1106 Preview' },
      { value: 'gpt-4', description: 'GPT-4' },
      { value: 'gpt-4-0314', description: 'GPT-4 (March 14 version)' },

      // Specialized models
      { value: 'gpt-4-vision-preview', description: 'GPT-4 Vision Preview' },
    ],
    order: 2,
  },
  CustomInstructions : {
    title: 'ChatGPT Custom Instructions',
    description: 'Custom instructions that tell ChatGPT how to behave.',
    type: 'string',
    default: 'You are a helpful assistant',
    order: 3,
  },
};

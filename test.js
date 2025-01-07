const { Configuration, OpenAIApi } = require('openai');

const config = new Configuration({ apiKey: 'sk-test-1234' });
const openai = new OpenAIApi(config);

console.log('Fungerar utan "Configuration is not a constructor"?');


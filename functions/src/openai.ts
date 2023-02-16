import axios from 'axios';
import moment = require('moment');
import * as dotenv from 'dotenv';

dotenv.config();

import {i18n} from './i18n';

const COMPLETION_API_URL = 'https://api.openai.com/v1/completions';

const config = {
  apiKey: process.env.API_KEY,
  language: process.env.LANGUAGE,
};
const prompt = i18n[config.language as string];
const now = moment().subtract(3, 'hours').format('YYYY-MM-DD HH:mm');

const getPrompt = (
    message: string,
    lastMessages: string[],
    allNotes: string[]
) => [
  `${prompt.available_actions}: ${
    Object.keys(prompt.actionDescriptions).map(
        (action) => action).join(', ')
  }`,
  ...Object.keys(prompt.actionDescriptions).map(
      (action) => prompt.actionDescriptions[action],
  ),
  prompt.date_parameter,
  prompt.message,
  prompt.tasks,
  prompt.routines,
  ...allNotes,
  ...prompt.examples,
  lastMessages.length ?
      lastMessages
          .splice(lastMessages.length - 4, lastMessages.length)
          .map((m) => `"${m}"`).join('\n') :
      '',
  `- ${now} [user] ${message}\n- ${now} [you] `,
].join('\n\n');

export const sendPrompt = async (
    message: string,
    lastMessages: string[],
    allNotes: string[]
) => {
  if (!config.apiKey) {
    throw new Error('OpenAI API Key is required for this operation');
  }
  const response = await axios.post<{
    choices: {
      text: string
    }[]
  }>(
      COMPLETION_API_URL,
      {
        model: 'text-davinci-003',
        prompt: getPrompt(message, lastMessages, allNotes),
        max_tokens: 256,
        temperature: 0.5,
      }, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

  return response.data.choices[0]?.text;
};

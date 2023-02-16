import * as functions from 'firebase-functions';
import moment = require('moment');

import {sendPrompt} from './openai';
import {createBatch, createDocument, getCollectionReference} from './firestore';

type RequestBody = {
  message: string;
  commit?: boolean;
  reset?: boolean;
};

type ResponseBody = {
  message?: string | null;
  tasks?: {
    action: string;
    parameters: string[];
    when: string;
  }[];
}

const clearDatabase = async (batch: FirebaseFirestore.WriteBatch) => {
  const docsArray = await Promise.all([
    getCollectionReference('bot_message').get(),
    getCollectionReference('bot_note').get(),
    getCollectionReference('bot_task').get(),
  ]);
  docsArray.map((doc) => {
    doc.forEach(({ref}) => batch.delete(ref));
  });
};

const getMessagesFromDb = async () => {
  const snapshot = await getCollectionReference('bot_message')
      .orderBy('created_at', 'desc')
      .limit(4)
      .get();
  return snapshot
      .docs
      .map((doc) => doc.data())
      .map(({from, message}) => `[${from}]: ${message}`)
      .reverse();
};

const getNotesFromDb = async () => {
  const snapshot = await getCollectionReference('bot_note')
      .orderBy('created_at', 'asc')
      .get();
  return snapshot
      .docs
      .map((doc) => (doc.data()).note);
};

const parseBotResponse = (response: string) => {
  const lowercasedResponse = response.toLocaleLowerCase();
  const message = lowercasedResponse
      .split('message: ')[1]
      ?.split('tasks: ')?.[0]
      ?.split('routines: ')?.[0]
      ?.trim();
  const tasks = lowercasedResponse
      .split('tasks: ')[1]
      ?.split('message:')?.[0]
      ?.split('routines:')?.[0]
      ?.split('; ')
      ?.map((intent) => {
        const action = intent.split('(')[0];
        const args = intent
            .split('("')[1]
            .split('")')[0]
            .split('", "');
        const parameters = args.slice(0, args.length - 1);
        const when = args[args.length - 1];
        return {action, parameters, when};
      }) || [];
  const routines = lowercasedResponse
      .split('routines: ')[1]
      ?.split('tasks: ')?.[0]
      ?.split('message: ')?.[0]
      ?.split(';')
      ?.map((routine) => routine.trim()) || [];
  return {
    message,
    tasks: tasks.filter((i) => i.when === 'now'),
    scheduledTasks: tasks.filter((i) => i.when !== 'now'),
    routines,
  };
};

export const sendBotMessage = functions.https.onRequest(
    async (request, response: functions.Response<ResponseBody>) => {
      const {
        message: userMessage,
        commit=true,
        reset,
      } = request.body as RequestBody;
      const userMessageDate = new Date();
      const batch = createBatch();

      // Reset
      if (reset) {
        await clearDatabase(batch);
        await batch.commit();
        response.send({});
        return;
      }

      // Get messages and notes from database
      const [messages, notes] = await Promise.all([
        getMessagesFromDb(),
        getNotesFromDb(),
      ]);

      // Send prompt to completions API
      const botResponse = await sendPrompt(userMessage, messages, notes);
      const botResponseDate = new Date();
      const {
        message,
        tasks,
        routines,
        scheduledTasks,
      } = parseBotResponse(botResponse);

      console.log(`[${botResponseDate}] ${botResponse}`);

      // Store messages on database
      createDocument(
          'bot_message',
          {from: 'user', message: userMessage, created_at: userMessageDate},
          batch
      );
      createDocument(
          'bot_message',
          {from: 'you', message: botResponse, created_at: botResponseDate},
          batch
      );
      // Store scheduled tasks on database
      scheduledTasks.forEach(({action, parameters, when}) =>
        createDocument(
            'bot_task',
            {
              action,
              parameters,
              // TODO: handle timezones better
              when: moment(when, 'YYYY-MM-DD HH:mm').add(3, 'hours').toDate(),
              created_at: userMessageDate,
            },
            batch
        )
      );
      // Store routines on database
      routines.forEach((routine) => {
        createDocument(
            'bot_note',
            {note: routine, created_at: userMessageDate},
            batch
        );
      });

      if (commit) {
        await batch.commit();
      }

      response.send({message, tasks});
    }
);

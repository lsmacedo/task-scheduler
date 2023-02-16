import {initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {v4} from 'uuid';

initializeApp();

export type BotMessage = {
  from: string;
  message: string;
  created_at: Date;
}

export type BotNote = {
  note: string;
  created_at: Date;
}

export type BotTask = {
  action: string;
  parameters: string[];
  when: Date;
  created_at: Date;
}

type CollectionType = {
  bot_message: BotMessage,
  bot_note: BotNote,
  bot_task: BotTask,
};


const db = getFirestore();

export const createBatch = () => db.batch();

export const createDocument = <T extends keyof CollectionType, >(
  collectionName: T,
  data: CollectionType[T],
  batch?: FirebaseFirestore.WriteBatch,
): void | Promise<FirebaseFirestore.WriteResult[]> => {
  const document = db.collection(collectionName).doc(v4());
  const b = batch ?? db.batch();
  b.create(document, data);
  if (!batch) {
    return b.commit();
  }
};

export const getCollectionReference = <T extends keyof CollectionType, >(
  collectionName: T
) => {
  return db.collection(
      collectionName
  ) as FirebaseFirestore.CollectionReference<CollectionType[T]>;
};

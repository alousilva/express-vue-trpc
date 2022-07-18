import * as trpc from '@trpc/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  id: string;
  user: string;
  message: string;
}

const messages: ChatMessage[] = [
  { id: uuidv4(), user: 'User1', message: 'This is my the first message!' },
  { id: uuidv4(), user: 'User2', message: 'Alright alright alright' },
];

export const appRouter = trpc
  .router()
  .query('greeting', {
    resolve() {
      return {
        message: 'Greetings from /trpc/hello :)',
      };
    },
  })
  .query('getMessages', {
    input: z.number().default(10),
    resolve({ input }) {
      return messages.slice(-input);
    },
  })
  .mutation('addMessage', {
    input: z.object({
      user: z.string(),
      message: z.string(),
    }),
    resolve({ input }) {
      const newMessage: ChatMessage = {
        id: uuidv4(),
        ...input,
      };
      messages.push(newMessage);
      return input;
    },
  });

export type AppRouter = typeof appRouter;

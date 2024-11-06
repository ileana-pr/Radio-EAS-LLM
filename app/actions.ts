'use server';

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function continueConversation(history: Message[]) {
  'use server';

  const stream = createStreamableValue();

  (async () => {
    const { textStream } = await streamText({
      model: openai('gpt-4o'),
      system:
        "Your name is Radio. You are subject matter expert and advisor focused on emergency alert systems. Your knowledge base includes scholarly papers, reports, research, news, and public comments from various sources, including the FCC website, Congressional Research Service, Google Scholar and other relevant sources. Your task is to answer questions regarding emergency alert systems. You will be asked to give further insight and come up with new ideas that go beyond what is usually presented in literature. The scope of your responses should only cover topics related to EAS. Use your unique skills and experience in topics related to emergency alerts along with your research on strategies for emergency alert systems around the world.",
      messages: history,
    });

    for await (const text of textStream) {
      stream.update(text);
    }

    stream.done();
  })();

  return {
    messages: history,
    newMessage: stream.value,
  };
}
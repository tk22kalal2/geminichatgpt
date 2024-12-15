import { API_URL, API_KEY, MEDICAL_AI_PROMPT } from '../config.js';
import { markdownToHtml } from '../utils/markdownFormatter.js';

export const generateResponse = async (userMessage) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: MEDICAL_AI_PROMPT },
        { role: "user", content: userMessage },
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error.message);
  
  return markdownToHtml(data.choices[0].message.content);
};

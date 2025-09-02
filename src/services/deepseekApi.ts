interface DeepseekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepseekResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export class DeepseekApi {
  private apiKey: string;
  private baseUrl = 'https://api.deepseek.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(messages: DeepseekMessage[]): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.7,
          max_tokens: 500,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: DeepseekResponse = await response.json();
      return data.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      console.error('Deepseek API error:', error);
      throw new Error('Failed to get AI response. Please check your API key and try again.');
    }
  }

  async chatStream(
    messages: DeepseekMessage[],
    onToken: (token: string) => void,
    signal?: AbortSignal
  ): Promise<string> {
    let fullText = '';
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.7,
          max_tokens: 500,
          stream: true,
        }),
        signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Streaming request failed: ${response.status} ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const raw of lines) {
          const line = raw.trim();
          if (!line) continue;
          if (line === 'data: [DONE]') {
            // End of stream
            return fullText;
          }
          if (!line.startsWith('data:')) continue;
          const json = line.replace(/^data:\s*/, '');
          try {
            const parsed = JSON.parse(json);
            // OpenAI-compatible delta format
            const delta = parsed?.choices?.[0]?.delta?.content ?? parsed?.choices?.[0]?.message?.content ?? '';
            if (delta) {
              fullText += delta;
              onToken(delta);
            }
          } catch (e) {
            // Ignore malformed chunks
            continue;
          }
        }
      }

      // Flush any remaining buffer (non-standard servers)
      try {
        const parsed = JSON.parse(buffer.replace(/^data:\s*/, ''));
        const last = parsed?.choices?.[0]?.delta?.content ?? parsed?.choices?.[0]?.message?.content ?? '';
        if (last) {
          fullText += last;
          onToken(last);
        }
      } catch { /* empty */ }

      return fullText;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        // Propagate abort so caller can handle gracefully
        throw error;
      }
      console.error('Deepseek API stream error:', error);
      throw new Error('Failed to stream AI response.');
    }
  }

  async evaluateScenario(
    scenarioType: string, 
    conversationHistory: Array<{ role: string; content: string }>,
    userGoal: string
  ): Promise<{ success: boolean; score: number; feedback: string; summary: string }> {
    const evaluationPrompt = `You are an AI evaluator for sexual health education scenarios. 

Scenario Type: ${scenarioType}
User Goal: ${userGoal}

Conversation History:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Please evaluate this conversation and provide:
1. Success: Did the user demonstrate good sexual health communication? (true/false)
2. Score: Rate the conversation from 1-100 based on:
   - Clear communication about boundaries and consent
   - Discussion of safety and protection
   - Respectful dialogue
   - Appropriate health considerations
3. Feedback: Specific areas where the user did well and areas for improvement
4. Summary: Brief overview of the conversation's key points

Respond in this exact JSON format:
{
  "success": boolean,
  "score": number,
  "feedback": "detailed feedback here",
  "summary": "conversation summary here"
}`;

    try {
      const response = await this.chat([
        { role: 'system', content: evaluationPrompt },
        { role: 'user', content: 'Please evaluate this conversation.' }
      ]);

      // Try to parse JSON response
      try {
        return JSON.parse(response);
      } catch {
        // Fallback if JSON parsing fails
        return {
          success: response.toLowerCase().includes('success') || response.toLowerCase().includes('good'),
          score: 75,
          feedback: response,
          summary: "Conversation completed with AI evaluation."
        };
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      return {
        success: false,
        score: 50,
        feedback: "Unable to evaluate conversation. Please try again.",
        summary: "Evaluation failed due to technical issues."
      };
    }
  }

  getScenarioSystemPrompt(scenarioId: string, npcName: string): string {
    const prompts = {
      'college-party': `You are ${npcName}, a college student at a party. You're friendly but may have had a drink or two. The user is someone you've just met. Your goal is to engage in realistic conversation while the user practices discussing safety, consent, and responsible decision-making. Be authentic but responsive to the user's approach to health and safety topics. If they bring up protection, testing, or boundaries, respond positively and realistically. Keep responses under 100 words.`,
      
      'travel-romance': `You are ${npcName}, a fellow traveler in a foreign country. You're adventurous and spontaneous, but may not always think about health precautions while traveling. The user should practice discussing travel safety, health precautions, and responsible decision-making in an international context. Respond naturally to their concerns about safety and health. Keep responses under 100 words.`,
      
      'relationship-milestone': `You are ${npcName}, someone in a developing romantic relationship. You care about your partner and want to take things to the next level physically. The user should practice discussing STI testing, birth control, and mutual comfort levels. Be loving and understanding, especially when they bring up health and safety topics. Keep responses under 100 words.`,
      
      'dating-app': `You are ${npcName}, someone the user matched with on a dating app and is now meeting in person. You're attracted to them and interested in possibly becoming intimate. The user should practice discussing safety, protection, and getting to know each other better first. Be realistic about modern dating while being receptive to safety discussions. Keep responses under 100 words.`
    };

    return prompts[scenarioId as keyof typeof prompts] || 
           `You are ${npcName}. Engage in realistic conversation while the user practices discussing sexual health and safety topics. Keep responses under 100 words.`;
  }
}

import OpenAI from 'openai';

interface DeepseekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class DeepseekApi {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      dangerouslyAllowBrowser: true,
      defaultHeaders: {
        'X-Title': 'SafeSpace Narratives',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : ''
      },
    });
  }

  async chat(messages: DeepseekMessage[]): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'z-ai/glm-4.5-air:free',
        messages,
        temperature: 0.7,
      });
      return completion.choices?.[0]?.message?.content ?? 'No response received';
    } catch (error) {
      console.error('OpenAI chat error:', error);
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
      const stream = await this.client.chat.completions.create(
        {
          model: 'openai/gpt-oss-120b',
          messages,
          temperature: 0.3,
          stream: true,
        },
        { signal }
      );

      for await (const part of stream) {
        const delta = part.choices?.[0]?.delta?.content ?? '';
        if (delta) {
          fullText += delta;
          onToken(delta);
        }
      }

      return fullText;
    } catch (error: unknown) {
      if ((error as { name?: string })?.name === 'AbortError') {
        throw error as Error;
      }
      console.error('OpenAI stream error:', error);
      throw new Error('Failed to stream AI response.');
    }
  }

  // Attempt to extract and parse a JSON object from arbitrary text
  private parseJsonFromText<T = any>(text: string): T | null {
    // 1) Try direct JSON
    try {
      return JSON.parse(text) as T;
    } catch {}

    // 2) Try fenced code block ```json ... ``` or ``` ... ```
    const fenceRe = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const fenceMatch = text.match(fenceRe);
    if (fenceMatch && fenceMatch[1]) {
      const candidate = fenceMatch[1].trim();
      try {
        return JSON.parse(candidate) as T;
      } catch {}
    }

    // 3) Try to find a JSON-like object by locating the first '{' and last '}'
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      const candidate = text.slice(first, last + 1);
      try {
        return JSON.parse(candidate) as T;
      } catch {}
    }

    return null;
  }

  async evaluateScenario(
    scenarioType: string,
    conversationHistory: Array<{ role: string; content: string }>,
    userGoal: string
  ): Promise<{ success: boolean; score: number | null; feedback: string; summary: string }> {
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

      // Robust JSON extraction
      const parsed = this.parseJsonFromText<{ success: boolean; score: number; feedback: string; summary: string }>(response);
      if (parsed && typeof parsed.score === 'number') {
        return {
          success: Boolean(parsed.success),
          score: Math.max(0, Math.min(100, parsed.score)),
          feedback: String(parsed.feedback ?? ''),
          summary: String(parsed.summary ?? '')
        };
      }

      // Fallback: textual heuristics
      return {
        success: response.toLowerCase().includes('success') || response.toLowerCase().includes('good'),
        score: null,
        feedback: response,
        summary: 'Evaluation returned unstructured text; JSON not found.'
      };
    } catch (error) {
      console.error('Evaluation error:', error);
      return {
        success: false,
        score: null,
        feedback: 'Unable to evaluate conversation. Please try again.',
        summary: 'Evaluation failed due to technical issues.'
      };
    }
  }

  async analyzeConversationScores(
    conversationHistory: Array<{ role: string; content: string }>,
    scenarioType: string
  ): Promise<{ trust: number; rapport: number; risk: number }> {
    console.count('[ScoreAnalysis] DeepseekApi.analyzeConversationScores calls');
    try { console.log('[ScoreAnalysis] DeepseekApi.analyzeConversationScores input', { scenarioType, historyLen: conversationHistory.length }); } catch {}
    const analysisPrompt = `You are an AI analyzer for sexual health education conversations. Analyze the conversation and provide three scores:

Scenario Type: ${scenarioType}

Conversation History:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Please analyze the user's messages and provide scores from 0-100 for:

1. TRUST SCORE (0-100): Based on how well the user demonstrates:
   - Discussion of consent and boundaries
   - Mention of protection methods (condoms, birth control)
   - STI testing and health considerations
   - Safe practices and responsible behavior
   - Clear communication about comfort levels

2. RAPPORT SCORE (0-100): Based on how well the user shows:
   - Empathy and understanding
   - Respectful communication
   - Active listening and acknowledgment
   - Appreciation and gratitude
   - Emotional intelligence and care

3. RISK SCORE (0-100): Based on risky behaviors or attitudes mentioned:
   - Substance use (alcohol, drugs)
   - Unprotected sexual activity
   - Unsafe environments or situations
   - Impulsive decision-making
   - Ignoring safety precautions
   (Higher score = MORE risk)

Respond in this exact JSON format:
{
  "trust": number,
  "rapport": number,
  "risk": number
}`;

    try {
      const response = await this.chat([
        { role: 'system', content: analysisPrompt },
        { role: 'user', content: 'Please analyze this conversation and provide the three scores.' }
      ]);

      const parsed = this.parseJsonFromText<{ trust?: number; rapport?: number; risk?: number }>(response);
      if (parsed) {
        const result = {
          trust: Math.max(0, Math.min(100, Number(parsed.trust ?? 0))),
          rapport: Math.max(0, Math.min(100, Number(parsed.rapport ?? 0))),
          risk: Math.max(0, Math.min(100, Number(parsed.risk ?? 0)))
        };
        try { console.log('[ScoreAnalysis] DeepseekApi parsed scores', result); } catch {}
        return result;
      }

      // Fallback to keyword-based analysis if JSON parsing fails
      const fb = this.fallbackScoreAnalysis(conversationHistory);
      try { console.warn('[ScoreAnalysis] DeepseekApi JSON parse failed, using fallback', fb); } catch {}
      return fb;
    } catch (error) {
      console.error('[ScoreAnalysis] Score analysis error:', error);
      // Fallback to keyword-based analysis if API fails
      const fb = this.fallbackScoreAnalysis(conversationHistory);
      try { console.warn('[ScoreAnalysis] DeepseekApi API failed, using fallback', fb); } catch {}
      return fb;
    }
  }

  private fallbackScoreAnalysis(
    conversationHistory: Array<{ role: string; content: string }>
  ): { trust: number; rapport: number; risk: number } {
    const userTexts = conversationHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content.toLowerCase())
      .join(' ');
    
    const allTexts = conversationHistory
      .map(msg => msg.content.toLowerCase())
      .join(' ');

    // Trust keywords
    const trustKeywords = ['consent', 'boundary', 'boundaries', 'protection', 'condom', 'sti', 'testing', 'safe', 'comfort', 'birth control'];
    const trustHits = trustKeywords.reduce((acc, k) => acc + (userTexts.includes(k) ? 1 : 0), 0);
    const trust = Math.min(100, Math.round((trustHits / Math.max(4, trustKeywords.length)) * 100));

    // Rapport keywords
    const rapportKeywords = ['thank', 'appreciate', 'understand', 'comfortable', 'respect', 'listen', 'care', 'feel', 'glad'];
    const rapportHits = rapportKeywords.reduce((acc, k) => acc + (allTexts.includes(k) ? 1 : 0), 0);
    const rapport = Math.min(100, Math.round((rapportHits / 6) * 100));

    // Risk keywords
    const riskKeywords = ['drunk', 'alcohol', 'drink', 'party', 'unprotected', 'no condom', 'unsafe', 'random', 'tonight'];
    const riskHits = riskKeywords.reduce((acc, k) => acc + (allTexts.includes(k) ? 1 : 0), 0);
    const risk = Math.min(100, Math.round((riskHits / 6) * 100));

    return { trust, rapport, risk };
  }

  getScenarioSystemPrompt(scenarioId: string, npcName: string): string {
    const prompts = {
      'college-party': `You are ${npcName}, a charismatic but reckless partygoer. You tend to downplay risks and use subtle social pressure (e.g., "don't be a buzzkill", "just go with the flow"). The user is practicing boundary-setting, consent, and sexual health communication under pressure. Safety rules: do not encourage or instruct unsafe sexual behavior; avoid explicit sexual content; when asked for risky actions, refuse to recommend them and acknowledge risks. Stay in-character, realistic, slightly manipulative, but never provide unsafe guidance. Keep responses under 100 words.`,

      'travel-romance': `You are ${npcName}, an adventurous fellow traveler abroad—spontaneous, thrill-seeking, and prone to minimizing health precautions. You may use charm and FOMO to nudge the user toward fast decisions. The user is practicing travel safety, consent, and protection conversations under social pressure. Safety rules: do not encourage or instruct unsafe sexual behavior; avoid explicit sexual content; when pressed for risky actions, refuse to recommend and acknowledge risks. Remain realistic and slightly manipulative without giving unsafe guidance. Keep responses under 100 words.`,

      'relationship-milestone': `You are ${npcName}, in a developing relationship, eager to move things faster and sometimes dismissive of caution (e.g., "we don't need all that if we trust each other"). You subtly push for intimacy and commitment sooner. The user is practicing discussions about STI testing, birth control, boundaries, and comfort levels under pressure. Safety rules: do not encourage or instruct unsafe sexual behavior; avoid explicit sexual content; when asked for risky actions, refuse to recommend and note risks. Stay in-character and persuasive without unsafe guidance. Keep responses under 100 words.`,

      'dating-app': `You are ${npcName}, a dating-app match meeting in person—confident, flirty, and inclined to brush off caution as unnecessary. You may apply light pressure to escalate quickly (e.g., "vibes are right, why wait?"). The user is practicing safety, consent, and protection conversations despite social pressure. Safety rules: do not encourage or instruct unsafe sexual behavior; avoid explicit sexual content; when pressed for risky actions, refuse to recommend and acknowledge risks. Stay realistic and slightly manipulative without giving unsafe guidance. Keep responses under 100 words.`
    } as const;

    return (
      prompts[scenarioId as keyof typeof prompts] ||
      `You are ${npcName}. Engage in realistic conversation while the user practices discussing sexual health and safety topics. Keep responses under 100 words.`
    );
  }
}

import OpenAI from 'openai';

import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

import type { ReviewRequest, ReviewComment as LocalReviewComment } from '../../types/index.js';

export interface OpenAIReviewResult {
  comments: LocalReviewComment[];
  summary: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  model: string;
}

/**
 * System prompt for code review.
 */
const SYSTEM_PROMPT = `You are an expert code reviewer. Analyze the provided code diff and provide actionable feedback.

Your review should:
1. Focus on bugs, security issues, and performance problems
2. Suggest improvements for code quality and maintainability
3. Be constructive and educational
4. Include specific line references when applicable

Respond with a JSON object containing:
- "summary": A brief 1-2 sentence summary of the review
- "comments": An array of comment objects with:
  - "file": The file path
  - "line": The line number (from the diff)
  - "severity": One of "critical", "major", "minor", "info"
  - "category": One of "bug", "security", "performance", "style", "suggestion", "praise"
  - "message": The review comment (be specific and helpful)
  - "suggestedFix": Optional code suggestion

Only respond with valid JSON. No markdown, no code blocks, just the JSON object.`;

/**
 * OpenAI provider for code review generation.
 */
export class OpenAIProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey?: string, model: string = 'gpt-4o') {
    this.client = new OpenAI({
      apiKey: apiKey ?? config.ai.openai.apiKey,
    });
    this.model = model;
  }

  /**
   * Generates a code review for the given diff.
   */
  async generateReview(request: ReviewRequest): Promise<OpenAIReviewResult> {
    const startTime = Date.now();

    const userPrompt = this.buildUserPrompt(request);

    logger.debug(
      {
        model: this.model,
        diffLength: request.diff.length,
        provider: request.provider,
      },
      'Generating OpenAI review'
    );

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3, // Lower temperature for more consistent reviews
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      const parsed = JSON.parse(content) as {
        summary: string;
        comments: LocalReviewComment[];
      };

      const result: OpenAIReviewResult = {
        comments: parsed.comments ?? [],
        summary: parsed.summary ?? 'Review completed',
        tokensUsed: {
          input: response.usage?.prompt_tokens ?? 0,
          output: response.usage?.completion_tokens ?? 0,
          total: response.usage?.total_tokens ?? 0,
        },
        model: this.model,
      };

      logger.info(
        {
          model: this.model,
          comments: result.comments.length,
          tokensUsed: result.tokensUsed.total,
          durationMs: Date.now() - startTime,
        },
        'OpenAI review generated'
      );

      return result;
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          model: this.model,
        },
        'OpenAI review generation failed'
      );
      throw error;
    }
  }

  /**
   * Generates a streaming review (returns async generator).
   */
  async *generateReviewStream(
    request: ReviewRequest
  ): AsyncGenerator<{ type: 'content' | 'done'; content?: string; result?: OpenAIReviewResult }> {
    const userPrompt = this.buildUserPrompt(request);
    let fullContent = '';

    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullContent += content;
        yield { type: 'content', content };
      }
    }

    // Parse the final result
    try {
      const parsed = JSON.parse(fullContent) as {
        summary: string;
        comments: LocalReviewComment[];
      };

      yield {
        type: 'done',
        result: {
          comments: parsed.comments ?? [],
          summary: parsed.summary ?? 'Review completed',
          tokensUsed: {
            input: 0, // Not available in streaming mode
            output: 0,
            total: 0,
          },
          model: this.model,
        },
      };
    } catch {
      throw new Error('Failed to parse streaming response');
    }
  }

  /**
   * Builds the user prompt for the review request.
   */
  private buildUserPrompt(request: ReviewRequest): string {
    let prompt = `Please review the following code changes:\n\n`;

    if (request.config?.guidelines?.length) {
      prompt += `## Review Guidelines\n`;
      for (const guideline of request.config.guidelines) {
        prompt += `- ${guideline}\n`;
      }
      prompt += '\n';
    }

    if (request.config?.language) {
      prompt += `Language: ${request.config.language}\n\n`;
    }

    prompt += `## Diff\n\`\`\`diff\n${request.diff}\n\`\`\``;

    return prompt;
  }

  /**
   * Estimates the cost of a review based on token usage.
   */
  static estimateCost(tokensUsed: { input: number; output: number }, model: string): number {
    // Pricing as of 2024 (in USD per 1K tokens)
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4o': { input: 0.005, output: 0.015 },
      'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    };

    const modelPricing = pricing[model] ?? pricing['gpt-4o'] ?? { input: 0.005, output: 0.015 };

    return (
      (tokensUsed.input / 1000) * modelPricing.input +
      (tokensUsed.output / 1000) * modelPricing.output
    );
  }
}

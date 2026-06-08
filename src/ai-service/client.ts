import Anthropic from '@anthropic-ai/sdk'

let _client: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

export const AI_MODEL = {
  primary: 'claude-haiku-4-5-20251001',
  fallback: 'claude-haiku-4-5-20251001',
} as const

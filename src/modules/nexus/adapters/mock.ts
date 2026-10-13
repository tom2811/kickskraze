import { AssistantProvider, AssistantQueryInput, AssistantResponse } from '../types';

export class MockNexusAdapter implements AssistantProvider {
  async query(input: AssistantQueryInput): Promise<AssistantResponse> {
    const q = input.message.toLowerCase();
    const ctx = input.productContext;

    if (q.includes('return') || q.includes('refund') || q.includes('exchange')) {
      return {
        answer: 'Kickskraze offers a 14-day return policy on unworn sneakers in original packaging with intact verification tags. Deadstock items must remain in brand new condition.',
        routeType: 'rag_only',
        ragUsed: true,
        toolsUsed: [],
        sources: [{ source: 'policies/returns_and_exchanges.md', chunk_id: 'returns-1' }],
      };
    }

    if (q.includes('legit') || q.includes('authentic') || q.includes('real')) {
      return {
        answer: 'Every sneaker on Kickskraze goes through a rigorous multi-point physical authentication check (stitching, box label typography, UV light scan, and RFID tag verification) before dispatch.',
        routeType: 'rag_only',
        ragUsed: true,
        toolsUsed: [],
        sources: [{ source: 'policies/authenticity_guarantee.md', chunk_id: 'auth-1' }],
      };
    }

    if (ctx) {
      if (input.size || q.includes('size') || q.includes('stock')) {
        const targetSize = input.size || (q.match(/\b\d+(\.\d+)?\b/)?.[0] ?? '');
        const available = targetSize
          ? ctx.availableSizes.includes(targetSize)
          : ctx.inStock;

        return {
          answer: targetSize
            ? available
              ? `Yes! Size ${targetSize} for the ${ctx.brand} ${ctx.name} is currently in stock at $${ctx.retailPrice.toFixed(2)}.`
              : `Size ${targetSize} for ${ctx.brand} ${ctx.name} is currently out of stock. Available sizes: ${ctx.availableSizes.join(', ') || 'None'}.`
            : `The ${ctx.brand} ${ctx.name} is priced at $${ctx.retailPrice.toFixed(2)}. Available sizes: ${ctx.availableSizes.join(', ') || 'Out of stock'}.`,
          routeType: 'tool_only',
          ragUsed: false,
          toolsUsed: ['catalog_inventory'],
          sources: [],
        };
      }

      return {
        answer: `The ${ctx.brand} ${ctx.name} (${ctx.colorway || 'Original colorway'}) retails for $${ctx.retailPrice.toFixed(2)}. In stock sizes: ${ctx.availableSizes.join(', ') || 'Out of stock'}. Need help with sizing or authenticity guarantee?`,
        routeType: 'hybrid',
        ragUsed: true,
        toolsUsed: ['catalog_inventory'],
        sources: [{ source: 'catalog/products.json' }],
      };
    }

    return {
      answer: `I am your Kickskraze Assistant powered by Nexus-bot. I can answer questions about shoe sizing, live inventory, shipping times, or authentication. How can I help you today?`,
      routeType: 'direct',
      ragUsed: false,
      toolsUsed: [],
      sources: [],
    };
  }
}

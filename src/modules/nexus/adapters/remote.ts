import { AssistantProvider, AssistantQueryInput, AssistantResponse } from '../types';

export class RemoteNexusAdapter implements AssistantProvider {
  constructor(
    private readonly baseUrl: string = process.env.NEXUS_BOT_URL || 'http://localhost:8000',
    private readonly apiKey?: string
  ) {
    this.apiKey = apiKey || process.env.NEXUS_BOT_API_KEY;
  }

  async query(input: AssistantQueryInput): Promise<AssistantResponse> {
    const url = `${this.baseUrl.replace(/\/+$/, '')}/api/v1/query`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
      headers['X-API-Key'] = this.apiKey;
    }

    const payload: Record<string, unknown> = {
      message: input.message,
      tenant_id: 'kickskraze',
    };

    if (input.productId) payload.product_id = input.productId;
    if (input.size) payload.size = input.size;
    if (input.productContext) payload.product_context = input.productContext;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Nexus Bot query failed with status ${res.status}: ${errText}`);
    }

    const data = await res.json();

    return {
      answer: data.answer || 'No response from assistant.',
      routeType: data.route_type || 'direct',
      ragUsed: Boolean(data.rag_used),
      toolsUsed: Array.isArray(data.tools_used) ? data.tools_used : [],
      sources: Array.isArray(data.sources) ? data.sources : [],
    };
  }
}

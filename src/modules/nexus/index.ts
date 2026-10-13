import { AssistantProvider, AssistantQueryInput, AssistantResponse } from './types';
import { RemoteNexusAdapter } from './adapters/remote';
import { MockNexusAdapter } from './adapters/mock';

export class NexusModule {
  constructor(private readonly provider: AssistantProvider) {}

  async query(input: AssistantQueryInput): Promise<AssistantResponse> {
    return this.provider.query(input);
  }
}

function createDefaultProvider(): AssistantProvider {
  if (process.env.NEXUS_BOT_URL) {
    return new RemoteNexusAdapter();
  }
  return new MockNexusAdapter();
}

export const nexus = new NexusModule(createDefaultProvider());

export * from './types';
export { RemoteNexusAdapter } from './adapters/remote';
export { MockNexusAdapter } from './adapters/mock';

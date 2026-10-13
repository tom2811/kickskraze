export type AssistantQueryInput = {
  message: string;
  productId?: string;
  size?: string;
  productContext?: {
    name: string;
    brand: string;
    colorway?: string;
    retailPrice: number;
    availableSizes: string[];
    inStock: boolean;
  };
};

export type AssistantSource = {
  source: string;
  chunk_id?: string;
};

export type AssistantResponse = {
  answer: string;
  routeType: 'rag_only' | 'tool_only' | 'hybrid' | 'direct';
  ragUsed: boolean;
  toolsUsed: string[];
  sources: AssistantSource[];
};

export interface AssistantProvider {
  query(input: AssistantQueryInput): Promise<AssistantResponse>;
}

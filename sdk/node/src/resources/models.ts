import type { Cloudach } from "../client";
import type { Model, ModelList } from "../types";

export class ModelsResource {
  constructor(private readonly client: Cloudach) {}

  /** Return the list of available models. */
  async list(): Promise<ModelList> {
    return this.client._get<ModelList>("/v1/models");
  }

  /**
   * Retrieve a single model by ID.
   * @param modelId - e.g. `"llama3-8b"`
   */
  async retrieve(modelId: string): Promise<Model> {
    return this.client._get<Model>(`/v1/models/${modelId}`);
  }
}

import { CompletionsResource } from "./completions";
import type { Cloudach } from "../../client";

export class ChatResource {
  readonly completions: CompletionsResource;

  constructor(client: Cloudach) {
    this.completions = new CompletionsResource(client);
  }
}

export { CompletionsResource };

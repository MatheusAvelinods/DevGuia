import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Fase 0: apenas a coleção de documentação do Starlight.
// Fase 1 adiciona a coleção `commands` (YAML validado com Zod).
export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};

import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { categoriaSchema, tecnologiaSchema } from './lib/schema-comandos';

export const collections = {
  // Tutoriais e páginas (Markdown/MDX) — Starlight.
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),

  // Comandos: um YAML por categoria, em src/content/commands/<tecnologia>/<categoria>.yaml.
  // O build falha se algum arquivo não passar no schema.
  commands: defineCollection({
    loader: glob({
      pattern: '*/*.yaml',
      base: './src/content/commands',
      // id = "<tecnologia>/<categoria>" (sem a extensão)
      generateId: ({ entry }) => entry.replace(/\.ya?ml$/, ''),
    }),
    schema: categoriaSchema,
  }),

  // Metadados de cada tecnologia (nome exibido, descrição, ordem).
  tecnologias: defineCollection({
    loader: file('./src/content/tecnologias.yaml'),
    schema: tecnologiaSchema,
  }),
};

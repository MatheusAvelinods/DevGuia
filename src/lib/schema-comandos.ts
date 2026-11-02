import { z } from 'astro/zod';

/** Níveis de dificuldade, do mais simples ao mais avançado. */
export const NIVEIS = ['basico', 'intermediario', 'avancado'] as const;
export type Nivel = (typeof NIVEIS)[number];

export const ROTULO_NIVEL: Record<Nivel, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'use só minúsculas, números e hífens (ex.: git-reset-soft)');

export const flagSchema = z.object({
  flag: z.string().min(1),
  descricao: z.string().min(1),
});

export const comandoSchema = z
  .object({
    /** Identificador único em todo o site; vira âncora na referência. */
    id: slug,
    /** Sintaxe principal, em uma linha. É o que o botão "copiar" copia. */
    comando: z.string().min(1),
    /** Descrição curta (uma frase). Também usada na cheat sheet. */
    descricao: z.string().min(10).max(200),
    /** Exemplo de uso, pode ter várias linhas e comentários. */
    exemplo: z.string().optional(),
    /** Flags/opções principais. */
    flags: z.array(flagSchema).default([]),
    nivel: z.enum(NIVEIS),
    /** true se o comando apaga dados ou reescreve histórico. */
    destrutivo: z.boolean().default(false),
    /** O que se perde e como evitar. Obrigatório quando destrutivo. */
    aviso: z.string().optional(),
    /** Entra na cheat sheet para download. */
    cheatsheet: z.boolean().default(true),
    tags: z.array(z.string()).default([]),
    /** ids de outros comandos (de qualquer categoria da mesma tecnologia ou não). */
    relacionados: z.array(slug).default([]),
  })
  .refine((c) => !c.destrutivo || (c.aviso && c.aviso.trim().length > 0), {
    message: 'comando destrutivo precisa de um "aviso" explicando o que se perde e como evitar',
    path: ['aviso'],
  });

/** Um arquivo YAML = uma categoria de uma tecnologia. */
export const categoriaSchema = z.object({
  categoria: z.string().min(1),
  /** Posição da categoria na página de referência. */
  ordem: z.number().int().positive(),
  descricao: z.string().optional(),
  comandos: z.array(comandoSchema).min(1),
});

export const tecnologiaSchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().min(1),
  ordem: z.number().int().positive(),
});

export type Comando = z.output<typeof comandoSchema>;
export type CategoriaDados = z.output<typeof categoriaSchema>;

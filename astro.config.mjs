// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Publicado no GitHub Pages como "project site":
// https://matheusavelinods.github.io/DevGuia/
// `base` precisa bater com o nome do repositório.
const site = 'https://matheusavelinods.github.io';
const base = '/DevGuia';
const repo = 'https://github.com/MatheusAvelinods/DevGuia';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'DevGuia',
      logo: { src: './src/assets/logo.svg', alt: '' },
      customCss: ['./src/styles/tema.css'],
      components: {
        PageFrame: './src/components/overrides/PageFrame.astro',
        Hero: './src/components/overrides/Hero.astro',
        Footer: './src/components/overrides/Footer.astro',
      },
      expressiveCode: {
        styleOverrides: {
          borderRadius: '0.55rem',
        },
      },
      description:
        'Guia em PT-BR de comandos Git, Docker e mais: tutoriais, referência rápida e cheat sheet.',
      defaultLocale: 'root',
      locales: {
        root: { label: 'Português', lang: 'pt-BR' },
      },
      social: [{ icon: 'github', label: 'GitHub', href: repo }],
      editLink: {
        baseUrl: `${repo}/edit/main/`,
      },
      lastUpdated: true,
      sidebar: [
        {
          label: 'Git',
          items: [
            { label: 'Tutorial', items: [{ autogenerate: { directory: 'git/tutorial' } }] },
            { label: 'Referência', link: '/git/referencia/' },
          ],
        },
        {
          label: 'Docker',
          items: [
            { label: 'Tutorial', items: [{ autogenerate: { directory: 'docker/tutorial' } }] },
            { label: 'Referência', link: '/docker/referencia/' },
          ],
        },
        { label: '🎮 Modo Treino', link: '/treino/' },
        { label: 'Sobre', link: '/sobre/' },
      ],
    }),
  ],
});

import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: "en-US",
  title: "Chess",
  description: "A feature rich chess website with online play, bot and local play",

  srcDir: "./src",
  base: "/docs/",
  cleanUrls: true,
  lastUpdated: true,

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Docs Home', link: '/' },
    ],

    editLink: {
      pattern: "https://github.com/Amaan-Kazi/Chess/tree/main/docs/:path",
      text: "Edit this page on GitHub"
    },

    search: {
      provider: "local"
    },

    sidebar: [
      {
        items: [
          { text: 'Overview', link: '/overview' },
          { text: 'Build Instructions', link: '/build-instructions' },
          { text: 'Hosting', link: '/hosting' }
        ]
      },
      {
        text: 'Frontend',
        collapsed: false,
        items: [
          { text: 'Game & Board Classes', link: '/' },
          { text: 'Chess Board', link: '/' },
          { text: 'Minimax Algorithm', link: '/' }
        ]
      },
      {
        text: 'Backend',
        collapsed: false,
        items: [
          { text: 'Web Sockets', link: '/' }
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Amaan-Kazi/Chess' },
      {
        icon: {
          svg: '<?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 121.17 122.88" style="enable-background:new 0 0 121.17 122.88" xml:space="preserve"><g><path d="M7.23,0h106.7c1.98,0,3.78,0.81,5.1,2.12l0.02,0.02c1.31,1.31,2.12,3.12,2.12,5.09v108.41c0,1.98-0.81,3.78-2.12,5.1 l-0.02,0.02c-1.32,1.31-3.12,2.11-5.09,2.11H7.23c-1.98,0-3.78-0.81-5.1-2.12l-0.02-0.02C0.81,119.42,0,117.62,0,115.64V7.24 c0-1.98,0.81-3.78,2.12-5.1l0.02-0.02C3.46,0.81,5.26,0,7.23,0L7.23,0z M113.53,7.64H87.65v26.69l-27.09,0V7.64H33.47v26.68h27.04 v27.09H33.47h0V88.5H7.64v26.74h25.88V88.5h27.04l0,0V61.41h27.09V88.5H60.61v26.74H87.7V88.5h25.83V61.41H87.7l0,0V34.33h25.83 V7.64L113.53,7.64z M7.64,34.33v27.09h25.79V34.33L7.64,34.33L7.64,34.33z"/></g></svg>'
        },
        link: 'https://chess.amaankazi.is-a.dev'
      }
    ]
  }
})

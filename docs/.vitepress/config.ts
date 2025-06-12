import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'tai-mcp',
  description: 'Emailing with your agent - Model Context Protocol server for AI email interaction',
  base: '/',
  cleanUrls: true,
  ignoreDeadLinks: true,
  
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/docs/assets/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'tai-mcp | Emailing with your agent' }],
    ['meta', { property: 'og:site_name', content: 'tai-mcp' }],
    ['meta', { property: 'og:url', content: 'https://docs.tai.chat/' }],
  ],

  themeConfig: {
    logo: '/assets/logo.svg',
    
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Development', link: '/development/' },
      {
        text: 'Links',
        items: [
          { text: 'NPM Package', link: 'https://www.npmjs.com/package/tai-mcp' },
          { text: 'GitHub', link: 'https://github.com/BMPixel/tai-mcp' },
          { text: 'MCP Specification', link: 'https://spec.modelcontextprotocol.io/' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Usage', link: '/guide/usage' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'MCP Tools', link: '/api/tools' },
            { text: 'Authentication', link: '/api/authentication' }
          ]
        }
      ],
      '/development/': [
        {
          text: 'Development',
          items: [
            { text: 'Overview', link: '/development/' },
            { text: 'Architecture', link: '/development/architecture' },
            { text: 'Implementation Guide', link: '/development/implementation-guide' },
            { text: 'Testing', link: '/development/testing' }
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/BMPixel/tai-mcp' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 tai-mcp'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/BMPixel/tai-mcp/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    codeTransformers: [
      {
        postprocess(code) {
          return code.replace(/\[!!code/g, '[!code')
        }
      }
    ]
  }
})

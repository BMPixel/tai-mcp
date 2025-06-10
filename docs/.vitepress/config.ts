import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'TAI MCP Email Server',
  description: 'Model Context Protocol server for AI email interaction',
  base: '/docs/',
  cleanUrls: true,
  ignoreDeadLinks: true,
  
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/docs/assets/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'TAI MCP Email Server | AI Email Interaction' }],
    ['meta', { property: 'og:site_name', content: 'TAI MCP Email Server' }],
    ['meta', { property: 'og:url', content: 'https://tai.chat/docs/' }],
  ],

  themeConfig: {
    logo: '/assets/logo.svg',
    
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Development', link: '/development/' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'Links',
        items: [
          { text: 'CF Mail Bridge', link: 'https://tai.chat' },
          { text: 'GitHub', link: 'https://github.com/anthropics/tai-mcp' },
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
            { text: 'CF Mail Bridge API', link: '/api/cf-mail-bridge' },
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
      '/deployment/': [
        {
          text: 'Deployment',
          items: [
            { text: 'Overview', link: '/deployment/' },
            { text: 'Cloudflare Pages', link: '/deployment/cloudflare-pages' },
            { text: 'Live Mode', link: '/deployment/live-mode' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Basic Usage', link: '/examples/basic-usage' },
            { text: 'Advanced Scenarios', link: '/examples/advanced-scenarios' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/anthropics/tai-mcp' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 TAI MCP Email Server'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/anthropics/tai-mcp/edit/main/tai-mcp/docs/:path',
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
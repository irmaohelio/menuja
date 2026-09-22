import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://menuja.app.br',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://menuja.app.br/cadastro',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://menuja.app.br/login',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}

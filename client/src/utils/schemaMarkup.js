/**
 * Structured Data Generator (JSON-LD)
 * Generates schema.org markup for better search engine understanding
 */

import { SEO_CONFIG } from '../config/seoConfig';

/**
 * Organization Schema
 * Used on homepage and global pages
 */
export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Open Source Nepal',
  url: SEO_CONFIG.siteUrl,
  logo: `${SEO_CONFIG.siteUrl}/logo.png`,
  description: SEO_CONFIG.description,
  sameAs: [
    'https://www.twitter.com/Open Source Nepal',
    'https://www.linkedin.com/company/os-nepal',
    'https://www.facebook.com/os-nepal',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'support@opensourcenepal.org',
    url: SEO_CONFIG.siteUrl,
  },
});

/**
 * WebSite Schema
 * Helps search engines understand site navigation and search functionality
 */
export const getWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Open Source Nepal',
  url: SEO_CONFIG.siteUrl,
  description: SEO_CONFIG.description,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SEO_CONFIG.siteUrl}/discover?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

/**
 * Breadcrumb Schema
 * Improves navigation understanding
 */
export const getBreadcrumbSchema = (breadcrumbs = []) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((breadcrumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: breadcrumb.name,
    item: `${SEO_CONFIG.siteUrl}${breadcrumb.url}`,
  })),
});

/**
 * Product Schema
 * For individual startup/product pages
 */
export const getProductSchema = (product) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description || product.tagline,
  image: product.logo || `${SEO_CONFIG.siteUrl}/default-product.png`,
  url: `${SEO_CONFIG.siteUrl}/products/${product.id}`,
  ...(product.totalVotes && {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: Math.min(5, (product.totalVotes / 10) + 1), // Simplified rating
      reviewCount: product.totalComments || 0,
    },
  }),
  brand: {
    '@type': 'Brand',
    name: product.founder?.name || 'Open Source Nepal',
  },
  creator: {
    '@type': 'Person',
    name: product.founder?.name,
    url: `${SEO_CONFIG.siteUrl}/profile/${product.founder?.id}`,
    image: product.founder?.avatar,
  },
});

/**
 * Person Schema (Founder/Creator)
 * For founder profile pages
 */
export const getPersonSchema = (person) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: person.name,
  url: `${SEO_CONFIG.siteUrl}/profile/${person.id}`,
  image: person.avatar || `${SEO_CONFIG.siteUrl}/default-avatar.png`,
  ...(person.headline && { jobTitle: person.headline }),
  ...(person.description && { description: person.description }),
  ...(person.websiteUrl && { sameAs: [person.websiteUrl] }),
});

/**
 * Collection Page Schema
 * For products listing and similar collection pages
 */
export const getCollectionPageSchema = (collection) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: collection.name || 'Products',
  description: collection.description || 'Explore our collection of products',
  url: `${SEO_CONFIG.siteUrl}${collection.url}`,
  mainEntity: {
    '@type': 'ItemList',
    name: collection.name,
    numberOfItems: collection.itemCount || 0,
  },
});

/**
 * FAQ Schema
 * For FAQ sections
 */
export const getFaqSchema = (faqs = []) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

/**
 * LocalBusiness Schema
 * If Open Source Nepal has physical locations
 */
export const getLocalBusinessSchema = (business) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Open Source Nepal',
  image: `${SEO_CONFIG.siteUrl}/logo.png`,
  description: SEO_CONFIG.description,
  url: SEO_CONFIG.siteUrl,
  telephone: business.phone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: business.address?.street,
    addressLocality: business.address?.city,
    addressRegion: business.address?.state,
    postalCode: business.address?.zip,
    addressCountry: business.address?.country,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: business.geo?.latitude,
    longitude: business.geo?.longitude,
  },
  openingHoursSpecification: business.hours?.map((hour) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: hour.day,
    opens: hour.opens,
    closes: hour.closes,
  })),
});

/**
 * NewsArticle Schema
 * For blog posts and announcements
 */
export const getNewsArticleSchema = (article) => ({
  '@context': 'https://schema.org',
  '@type': 'NewsArticle',
  headline: article.title,
  description: article.description,
  image: article.image || `${SEO_CONFIG.siteUrl}/default-article.png`,
  datePublished: article.publishedDate,
  dateModified: article.modifiedDate || article.publishedDate,
  author: {
    '@type': 'Person',
    name: article.author?.name,
    url: article.author?.url,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Open Source Nepal',
    logo: {
      '@type': 'ImageObject',
      url: `${SEO_CONFIG.siteUrl}/logo.png`,
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': article.url,
  },
});

export default {
  getOrganizationSchema,
  getWebsiteSchema,
  getBreadcrumbSchema,
  getProductSchema,
  getPersonSchema,
  getCollectionPageSchema,
  getFaqSchema,
  getLocalBusinessSchema,
  getNewsArticleSchema,
};

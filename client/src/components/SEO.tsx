import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { SEO_CONFIG } from '../config/seoConfig';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  canonical?: string;
  author?: string;
  type?: string;
  locale?: string;
  noindex?: boolean;
  structuredData?: object | string;
  children?: ReactNode;
}

// The one place that writes page meta tags. Absolute URLs matter because
// crawlers and link previews can't resolve relative ones.
const absolute = (value: string) =>
  value.startsWith('http') ? value : `${SEO_CONFIG.siteUrl}${value}`;

export const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  canonical,
  author,
  type = 'website',
  locale = SEO_CONFIG.defaultLocale,
  noindex = false,
  structuredData,
  children,
}: SEOProps) => {
  const fullTitle = !title
    ? SEO_CONFIG.siteName
    : title.includes(SEO_CONFIG.siteName)
      ? title
      : `${title} | ${SEO_CONFIG.siteName}`;
  const fullDescription = description || SEO_CONFIG.description;
  const fullImage = absolute(image || SEO_CONFIG.socialImage);
  const fullUrl = absolute(url || '/');

  return (
    <Helmet>
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author || SEO_CONFIG.author} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonical ? absolute(canonical) : fullUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />
      <meta property="og:locale" content={locale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content={SEO_CONFIG.twitterHandle} />

      {structuredData && (
        <script type="application/ld+json">{typeof structuredData === 'string' ? structuredData : JSON.stringify(structuredData)}</script>
      )}
      {children}
    </Helmet>
  );
};

export default SEO;

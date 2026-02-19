import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string;
  ogImage?: string;
  jsonLd?: object;
}

const DEFAULT_OG_IMAGE = 'https://poetryeditor.com/og-image.png';
const SITE_NAME = 'Poetry Editor';

export function SEOHead({
  title,
  description,
  canonicalPath,
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  jsonLd
}: SEOHeadProps) {
  const fullTitle = title.includes('Poetry Editor') ? title : `${title} | Poetry Editor`;
  const canonicalUrl = canonicalPath ? `https://poetryeditor.com${canonicalPath}` : 'https://poetryeditor.com';

  const sanitizeJsonLd = (value: any): any => {
    if (!value || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map(sanitizeJsonLd);
    const cloned: Record<string, any> = { ...value };
    delete cloned.aggregateRating;
    delete cloned.review;
    Object.keys(cloned).forEach((key) => {
      cloned[key] = sanitizeJsonLd(cloned[key]);
    });
    return cloned;
  };

  const sanitizedJsonLd = jsonLd ? sanitizeJsonLd(jsonLd) : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:alt" content={fullTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* JSON-LD Structured Data */}
      {sanitizedJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(sanitizedJsonLd)}
        </script>
      )}
    </Helmet>
  );
}

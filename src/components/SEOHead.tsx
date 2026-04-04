import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  type?: string;
  image?: string;
  product?: {
    price: string;
    currency: string;
    availability: "in stock" | "out of stock";
  };
}

const SITE_URL = "https://bossqueenscollection.com";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

export const SEOHead = ({
  title,
  description,
  path,
  type = "website",
  image = DEFAULT_IMAGE,
  product,
}: SEOHeadProps) => {
  const fullTitle = `${title} | Boss Queens Collection`;
  const url = `${SITE_URL}${path}`;

  const canonicalUrl = url.endsWith("/") ? url : `${url}/`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1" />
      <meta name="publisher" content="Boss Queens Collection" />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Boss Queens Collection" />
      <meta property="og:locale" content="en_US" />

      {/* Product-specific OG tags */}
      {product && (
        <>
          <meta property="product:price:amount" content={product.price} />
          <meta property="product:price:currency" content={product.currency} />
          <meta property="product:availability" content={product.availability} />
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@bossqueenscollection" />

      {/* Pinterest */}
      <meta name="pinterest-rich-pin" content="true" />
    </Helmet>
  );
};

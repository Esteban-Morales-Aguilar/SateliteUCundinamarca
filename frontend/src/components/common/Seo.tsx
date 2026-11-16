import { Helmet } from 'react-helmet-async';

export function Seo({ title, description }: { title: string; description?: string }) {
  const full = `${title} · SpaceNet Lab`;
  return (
    <Helmet>
      <title>{full}</title>
      <meta name="google-site-verification" content="qU9-sQnvcmBsX47kvMZ6CrE2DhN-wc8OdyDJ21cQiVI" />
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={full} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content="website" />
    </Helmet>
  );
}

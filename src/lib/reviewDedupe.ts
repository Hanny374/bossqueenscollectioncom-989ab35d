type ReviewLike = {
  reviewer_name?: string | null;
  body?: string | null;
  photos?: string[] | null;
  product_handle?: string | null;
};

export const normalizeReviewText = (value?: string | null) =>
  (value || "")
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const normalizeReviewPhoto = (value?: string | null) => {
  if (!value) return "";
  try {
    const url = new URL(value);
    const path = url.pathname.replace(/\/+$/, "").toLowerCase();
    return `${url.host.toLowerCase()}${path}`;
  } catch {
    return value.split("?")[0].split("#")[0].trim().toLowerCase();
  }
};

export function dedupeReviews<T extends ReviewLike>(
  reviews: T[],
  options: { ignorePhotos?: boolean } = {},
) {
  const seenBodies = new Set<string>();
  const seenReviewerBodies = new Set<string>();
  const seenPhotos = new Set<string>();

  return reviews.filter((review) => {
    const bodyKey = normalizeReviewText(review.body).slice(0, 180);
    const reviewerKey = normalizeReviewText(review.reviewer_name || "shopper");
    const reviewerBodyKey = `${reviewerKey}|${bodyKey}`;
    const photoKeys = options.ignorePhotos
      ? []
      : (review.photos || []).map(normalizeReviewPhoto).filter(Boolean);

    if (photoKeys.some((photoKey) => seenPhotos.has(photoKey))) return false;
    if (bodyKey && seenBodies.has(bodyKey)) return false;
    if (bodyKey && seenReviewerBodies.has(reviewerBodyKey)) return false;

    photoKeys.forEach((photoKey) => seenPhotos.add(photoKey));
    if (bodyKey) {
      seenBodies.add(bodyKey);
      seenReviewerBodies.add(reviewerBodyKey);
    }

    return true;
  });
}
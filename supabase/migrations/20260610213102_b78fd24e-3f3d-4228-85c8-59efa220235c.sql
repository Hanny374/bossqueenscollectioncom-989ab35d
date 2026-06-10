-- Re-point reviews saved under stale product handles to the live store handles
UPDATE public.reviews
SET product_handle = '300-density-30-40-50-inch-613-hd-lace-frontal-human-hair-wig-13x6-colored-blonde-raw-body-wave-lace-front-100-human-hair-wigs-1'
WHERE product_handle IN (
  '250-30-36-inch-613-hd-frontal-wigs-13x4-blonde-body-wave-front-wig-transparent-pre-plucked-brazilian-glueless-human-hair-wigs',
  '300-density-30-40-50-inch-613-hd-lace-frontal-human-hair-wig-13x6-colored-blonde-raw-body-wave-lace-front-100-human-hair-wigs-2'
);

UPDATE public.reviews
SET product_handle = 'highlight-wig-human-hair-deep-wave-frontal-wig-hd-lace-wig-13x6-human-hair-13x4-water-wave-wigs-curly-lace-front-human-hair-wig'
WHERE product_handle = '30-inch-300-density-highlight-honey-brown-curly-lace-front-human-hair-wigs-13x4-ombre-colored-deep-wave-lace-frontal-wig';

UPDATE public.reviews
SET product_handle = 'highlight-burmese-curly-half-glueless-wigs-human-hair-with-drawstring-colored-3-in-1-half-wigs-flip-over-burmese-curly-half-wigs'
WHERE product_handle = 'highlight-burmese-curly-half-glueless-wigs-human-hair-with-drawstring-colored-3-in-1-half-wigs-flip-over-burmese-curly-half-wigs-1';
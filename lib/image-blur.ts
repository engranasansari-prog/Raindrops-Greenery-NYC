// Shared blur-placeholder for product card images.
//
// A tiny 4×4 base64 SVG tinted with --rd-paper-soft so cards never flash
// to a black void while their CDN image streams in. Use as
//   placeholder="blur" blurDataURL={PRODUCT_BLUR_DATA_URL}
// on every <Image> that points at a Dutchie / remote product asset.
//
// Why a constant string and not generated per-product: we don't have a
// pre-computed LQIP for each Dutchie URL, and a uniform soft-cream tone
// matches the card's interior background exactly — the transition from
// blur → image is therefore invisible.

export const PRODUCT_BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNFQkU1RDYiLz48L3N2Zz4=';

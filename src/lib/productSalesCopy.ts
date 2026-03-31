/**
 * Generates conversion-optimized product descriptions and benefit highlights
 * based on product attributes (title, type, tags, options).
 */

interface ProductAttributes {
  title: string;
  productType?: string;
  tags?: string[];
  description?: string;
  options?: Array<{ name: string; values: string[] }>;
}

export interface SalesCopy {
  headline: string;
  shortDescription: string;
  benefits: string[];
  whyChoose: string[];
}

function detectAttributes(product: ProductAttributes) {
  const title = product.title?.toLowerCase() || "";
  const type = product.productType?.toLowerCase() || "";
  const tags = (product.tags || []).map(t => t.toLowerCase());
  const allText = `${title} ${type} ${tags.join(" ")}`;

  return {
    isWig: allText.includes("wig") || allText.includes("bob") || allText.includes("closure") || allText.includes("frontal"),
    isBundle: allText.includes("bundle") || allText.includes("weave"),
    isStraight: allText.includes("straight") || allText.includes("bone straight"),
    isCurly: allText.includes("curly") || allText.includes("deep wave") || allText.includes("water wave") || allText.includes("loose wave"),
    isBodyWave: allText.includes("body wave"),
    isBlonde: allText.includes("blonde") || allText.includes("613") || allText.includes("honey"),
    isColored: allText.includes("highlight") || allText.includes("colored") || allText.includes("ombre") || allText.includes("burgundy") || allText.includes("brown"),
    isBob: allText.includes("bob") || allText.includes("short"),
    isLong: allText.includes("30 inch") || allText.includes("34") || allText.includes("36") || allText.includes("38") || allText.includes("40") || allText.includes("42"),
    isHD: allText.includes("hd") || allText.includes("transparent"),
    isPrePlucked: allText.includes("pre plucked") || allText.includes("preplucked"),
    isGlueless: allText.includes("glueless"),
    is360: allText.includes("360"),
    is13x6: allText.includes("13x6"),
    is13x4: allText.includes("13x4"),
    isPixie: allText.includes("pixie"),
    hasLengths: product.options?.some(o => o.name.toLowerCase() === "length"),
    hasColors: product.options?.some(o => o.name.toLowerCase() === "color"),
  };
}

export function generateSalesCopy(product: ProductAttributes): SalesCopy {
  const attrs = detectAttributes(product);

  // Build headline
  let headline = "";
  if (attrs.isWig) {
    if (attrs.isBob) headline = "Effortless Glam, Instant Confidence";
    else if (attrs.isLong) headline = "Head-Turning Length That Slays";
    else if (attrs.isBlonde) headline = "Blonde Bombshell Energy";
    else if (attrs.isCurly) headline = "Curls That Command Attention";
    else if (attrs.isBodyWave) headline = "The Perfect Wave, Every Time";
    else if (attrs.isStraight) headline = "Sleek & Flawless — Zero Effort";
    else headline = "Your Dream Hair, Delivered";
  } else if (attrs.isBundle) {
    headline = "Luxe Bundles for a Flawless Install";
  } else {
    headline = "Premium Quality You Can Feel";
  }

  // Short description for cards
  let shortDescription = "";
  const descriptors: string[] = [];

  if (attrs.isHD) descriptors.push("invisible HD lace");
  if (attrs.isPrePlucked) descriptors.push("pre-plucked natural hairline");
  if (attrs.isGlueless) descriptors.push("glueless install");

  if (attrs.isWig) {
    if (attrs.isBob) {
      shortDescription = `Chic bob wig with ${descriptors.length ? descriptors.join(" & ") : "a natural-looking hairline"}. Ready to wear in minutes — no salon needed.`;
    } else if (attrs.isCurly) {
      shortDescription = `Gorgeous curly texture with ${descriptors.length ? descriptors.join(" & ") : "realistic movement"}. Bouncy, defined curls that last wash after wash.`;
    } else if (attrs.isBodyWave) {
      shortDescription = `Luxurious body wave with ${descriptors.length ? descriptors.join(" & ") : "effortless bounce"}. The #1 choice for a glamorous, natural look.`;
    } else if (attrs.isStraight) {
      shortDescription = `Silky-smooth straight hair with ${descriptors.length ? descriptors.join(" & ") : "mirror-like shine"}. Perfectly sleek from root to tip.`;
    } else if (attrs.isBlonde) {
      shortDescription = `Stunning blonde shade with ${descriptors.length ? descriptors.join(" & ") : "zero brassiness"}. Salon-quality color without the damage.`;
    } else {
      shortDescription = `Premium 100% human hair wig with ${descriptors.length ? descriptors.join(" & ") : "a natural, undetectable finish"}. Style it your way — curl, straighten, or dye.`;
    }
  } else {
    shortDescription = "100% virgin human hair — soft, tangle-free, and built to last. Style, color, and heat-style with confidence.";
  }

  // Benefits list
  const benefits: string[] = [
    "100% virgin human hair — soft, silky, no shedding",
    "Can be dyed, bleached & heat-styled up to 400°F",
  ];

  if (attrs.isHD) benefits.push("HD transparent lace melts into your skin for an undetectable look");
  if (attrs.isPrePlucked) benefits.push("Pre-plucked hairline — looks like it's growing from your scalp");
  if (attrs.isGlueless) benefits.push("Glueless cap design — protect your edges, easy on & off");
  if (attrs.is360) benefits.push("360° lace for ponytails, updos & any parting direction");
  if (attrs.is13x6) benefits.push("13x6 deep part frontal — versatile styling with a deep side part");
  if (attrs.isBob) benefits.push("Low-maintenance bob length — perfect for busy queens");
  if (attrs.isLong) benefits.push("Extra-long length for maximum drama & versatility");

  benefits.push("Adjustable straps & combs for a secure, comfy fit");
  benefits.push("Lasts 12+ months with proper care");

  // Why choose section
  const whyChoose: string[] = [
    "Trusted by 10,000+ queens worldwide",
    "Premium 10A grade — the highest quality available",
    "30-day money-back guarantee, no questions asked",
    "Free shipping on orders over $100",
    "Fast processing — ships within 1-3 business days",
  ];

  return { headline, shortDescription, benefits, whyChoose };
}

/** Generates a short (1-2 line) card description */
export function getCardDescription(product: ProductAttributes): string {
  const copy = generateSalesCopy(product);
  let desc = copy.shortDescription;

  // Append available colors for colored/blonde wigs
  const attrs = detectAttributes(product);
  if ((attrs.isColored || attrs.isBlonde) && product.options) {
    const colorOption = product.options.find(o => o.name.toLowerCase() === "color");
    if (colorOption && colorOption.values.length > 0) {
      const colors = colorOption.values.slice(0, 4).join(", ");
      const extra = colorOption.values.length > 4 ? ` +${colorOption.values.length - 4} more` : "";
      desc += ` Available in: ${colors}${extra}.`;
    }
  }

  return desc;
}

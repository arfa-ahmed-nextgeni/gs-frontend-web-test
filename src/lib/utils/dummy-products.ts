import { WishlistState } from "@/lib/constants/product/product-card";
import { OptionChoice } from "@/lib/models/product-card-model";
import { ContentfulProductData } from "@/lib/types/contentful/page-landing";

const NAMES = [
  "Giorgio Armani",
  "Mont Blanc",
  "Roberto Cavalli",
  "Narciso Rodriguez",
  "Versace",
  "Yves Saint Laurent",
] as const;

const DESCRIPTIONS = [
  "SÌ Passione Eau de Parfum a chypre scent reinvented...",
  "Emblem For Men – Eau de Parfum",
  "Eau de Parfum Roberto Cavalli",
  "For Her – Eau de Parfum",
  "Eros for Men – Eau de Parfum",
  "Libre – Libre Eau de Parfum",
] as const;

const IMAGE_URLS = [
  "https://assets.goldenscent.com/catalog/product/cache/1/small_image/750x750/9df78eab33525d08d6e5fb8d27136e95/3/5/3508440251749-creed-creed-absolu-aventus-for-men-eau-de_parfum_75ml.png",
  "https://assets.goldenscent.com/catalog/product/7/0/701666263005_-_amouage_-_amouage_blossom_love_for_for_women_eau_de_parfum_100ml_-_100ml_-_sd.png",
  "https://assets.goldenscent.com/catalog/product/3/7/3700578506740_-_parfums_de_marly_-_parfums_de_marly_valaya_exclusif_edp_30_ml_-_30_ml_-_sd.png",
  "https://assets.goldenscent.com/catalog/product/cache/1/small_image/750x750/9df78eab33525d08d6e5fb8d27136e95/6/2/6281056379522_-_m.s_elizabeth_helen_-_-.png",
  "https://assets.goldenscent.com/catalog/product/3/6/3605521932105-maison-margiela-maison-margiela-replica-jazz-club-_m_-edt-100-ml_2.png",
  "https://assets.goldenscent.com/catalog/product/g/o/golden_scent_perfume_creed_perfumes_aventus_for_men_eau_de_parfum_100ml_second.jpg",
] as const;

const BADGE_TYPES = [
  "sale_ends_in",
  "hour_delivery",
  "use_code",
  "trending",
  "influencers_picks",
  "hot_seller",
] as const;

// simple generators
const randItem = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number, dec = 1): number =>
  parseFloat((Math.random() * (max - min) + min).toFixed(dec));

/**
 * Generate an array of dummy ContentfulProductData
 */
export function generateDummyProducts(count: number): ContentfulProductData[] {
  const records: ContentfulProductData[] = [];

  for (let i = 0; i < count; i++) {
    const price = randItem([190, 329, 330, 420, 438, 550]);
    const oldPrice = Math.random() < 0.3 ? price + randInt(10, 200) : undefined;
    const discountPercent =
      Math.random() < 0.5 ? randItem([-8, -20, -33, -65]) : undefined;

    // badges
    const badgeCount = randInt(0, 1);
    const badges = Array.from({ length: badgeCount }).map(() => {
      const type = randItem(BADGE_TYPES);
      let value: string | undefined;
      if (type === "sale_ends_in") {
        value = new Date(Date.now() + Math.random() * 1e10).toISOString();
      } else if (type === "hour_delivery") {
        value = String(randInt(1, 5));
      } else if (type === "use_code") {
        value = randItem(["BLVD", "SAVE20", "SUMMER"]);
      }
      return { type, value };
    });

    // options (every 3rd => size, every 5th => color)
    let options:
      | { choices: OptionChoice[]; type: "color" }
      | { choices: OptionChoice[]; type: "size_new" }
      | undefined;

    if (i % 3 === 0) {
      options = {
        choices: ["100ml", "150ml", "200ml"].map((s) => ({
          inStock: true,
          label: s,
          value: s,
        })),
        type: "size_new",
      };
    } else if (i % 5 === 0) {
      options = {
        choices: ["#FF889E", "#CE775F", "#C54E2D"].map((c) => ({
          inStock: true,
          label: c,
          value: c,
        })),
        type: "color",
      };
    }

    records.push({
      badges: badges.length ? badges : undefined,
      currency: "SAR",
      description: randItem(DESCRIPTIONS),
      discountPercent,
      id: String(i + 1),
      imageUrl: randItem(IMAGE_URLS),
      name: randItem(NAMES),
      oldPrice,
      options,
      price,
      ratingSummary: randFloat(20, 100, 1),
      savedAmount: randInt(1000, 2000),
      savedCurrency: "SAR",
      stockStatus: "IN_STOCK",
      wishlistState: randItem([WishlistState.None, WishlistState.Wishlisted]),
    });
  }

  return records;
}

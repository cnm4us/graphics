import type { AppearanceCategory } from './types.js';

export const clothingDefaultsCategory: AppearanceCategory = {
  key: "clothing_defaults",
  label: "Clothing Defaults",
  order: 7,
  description:
    "Go-to clothing and color cues that describe how the character normally presents themselves.",
  properties: [
    {
      key: "casual_preference",
      label: "Casual preference",
      type: "tags",
      options: [
        { value: "jeans", label: "Jeans" }, // denim, fitted or relaxed
        { value: "athleisure", label: "Athleisure" }, // leggings, joggers, sporty tops
        { value: "dresses", label: "Dresses" }, // casual day dresses
        { value: "cocktail_dress", label: "Black spaghetti strap cocktail dress" }, // evening wear
        { value: "uniforms", label: "Uniforms" }, // work or themed uniforms
        { value: "coats", label: "Coats" }, // outerwear-centered looks

        // NEW — clearly distinguishable casual categories
        { value: "tshirts", label: "T-Shirts & Tops" }, // simple tops; universal casual look
        { value: "hoodies", label: "Hoodies & Sweatshirts" }, // relaxed, cozy silhouette
        { value: "button_ups", label: "Casual Button-Ups" }, // flannels, chambray, casual shirts
        { value: "skirts", label: "Casual Skirts" }, // denim, cotton, flowy skirts
        { value: "shorts", label: "Shorts" }, // denim, athletic, lounge
        { value: "layered", label: "Layered Casual Looks" }, // tees under jackets, etc.
        { value: "streetwear", label: "Streetwear" }, // oversized fits, graphic tees, hype fashion
        { value: "bohemian", label: "Bohemian Casual" }, // flowy fabrics, earthy patterns
        { value: "preppy", label: "Preppy Casual" }, // polos, sweaters, chinos
        { value: "minimalist", label: "Minimalist Casual" }, // clean lines, neutral palette
        { value: "vintage", label: "Vintage Casual" }, // retro denim, tees, patterns
        { value: "loungewear", label: "Loungewear" }, // soft, at-home comfy outfits
        { value: "graphic_teeshirt", label: "Graphic Tee Style" }, // bold prints; visually distinct
      ],
      allowCustom: true,
    },
    {
      key: "color_palette",
      label: "Color palette",
      type: "enum",
      options: [
        { value: "earthy", label: "Earthy" }, // browns, olives, terra tones
        { value: "monochrome", label: "Monochrome" }, // black, white, grayscale
        { value: "bright", label: "Bright" }, // bold saturated colors
        { value: "muted", label: "Muted" }, // desaturated, soft tones
        { value: "pastel", label: "Pastel" }, // light pinks, blues, mints

        // NEW — strongly differentiated palettes models understand well
        { value: "jewel_tones", label: "Jewel Tones" }, // emerald, ruby, sapphire
        { value: "neutrals", label: "Neutrals" }, // beige, cream, taupe, black
        { value: "warm_tones", label: "Warm Tones" }, // reds, oranges, warm browns
        { value: "cool_tones", label: "Cool Tones" }, // blues, greens, violets
        { value: "high_contrast", label: "High Contrast" }, // stark black/white or bold color contrasts
        { value: "soft_blend", label: "Soft Blend" }, // gentle gradients; smooth transitions
        { value: "vintage_palette", label: "Vintage Palette" }, // retro oranges, mustard, teal
        { value: "futuristic", label: "Futuristic Palette" }, // silvers, neon accents, metallics
        { value: "dark_accented", label: "Dark with Accents" }, // blacks/charcoals + a single pop color
        { value: "seasonal_autumn", label: "Autumnal" }, // rust, pumpkin, olive, gold
        { value: "seasonal_spring", label: "Spring Light" }, // lavender, mint, peach, sky blue
        { value: "seasonal_summer", label: "Summer Vibrant" }, // turquoise, coral, lemon, bright greens
        { value: "seasonal_winter", label: "Winter Cool" }, // icy blues, deep plums, crisp whites
      ],
      allowCustom: true,
    },
    {
      key: "accessories",
      label: "Accessories",
      type: "tags",
      options: [
        { value: "glasses", label: "Glasses" }, // any eyewear style
        { value: "earrings", label: "Earrings" }, // studs, hoops, dangly
        { value: "necklace", label: "Necklace" }, // pendants, chains
        { value: "watch", label: "Watch" }, // wrist accessory
        { value: "none", label: "None" }, // clean, accessory-free look

        // NEW — distinctive, easy-for-AI accessories
        { value: "bracelets", label: "Bracelets" }, // bangles, cuffs, beads
        { value: "rings", label: "Rings" }, // fingers adorned
        { value: "hat", label: "Hat" }, // beanies, caps, wide-brim
        { value: "hair_clip", label: "Hair Clip / Barrette" }, // decorative hair pieces
        { value: "scarf", label: "Scarf" }, // fabric wrap; clear silhouette
        { value: "belt", label: "Belt" }, // waist accent
        { value: "bag", label: "Bag" }, // crossbody, purse, satchel
        { value: "sunglasses", label: "Sunglasses" }, // highly recognizable shape
        { value: "headband", label: "Headband" }, // fabric or styled hairband
        { value: "hair_ties_visible", label: "Visible Hair Ties" }, // ponytail/bun ties clearly seen
        { value: "brooch", label: "Brooch / Pin" }, // small decorative accent
        { value: "gloves", label: "Gloves" }, // fashion or utility
        { value: "ear_cuffs", label: "Ear Cuffs" }, // distinct from earrings
        { value: "anklet", label: "Anklet" }, // subtle but unique
        { value: "tattoo_small", label: "Small Tattoo" }, // one visible symbol, nonintrusive
        { value: "piercing_extra", label: "Extra Piercing" }, // nose, brow, or multiple ear piercings
      ],
      allowCustom: true,
    },
  ],
};


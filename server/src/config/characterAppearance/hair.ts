import type { AppearanceCategory } from './types.js';

export const hairCategory: AppearanceCategory = {
  key: "hair",
  label: "Hair",
  order: 3,
  description:
    "Hair traits are strong continuity anchors for character recognition.",
  properties: [
    {
      key: "hair_color",
      label: "Hair color",
      type: "enum",
      options: [
        // Natural Browns
        { value: "dark_brown", label: "Dark Brown" },
        { value: "brown", label: "Brown" },
        { value: "light_brown", label: "Light Brown" },
        { value: "chestnut", label: "Chestnut Brown" },
        { value: "auburn", label: "Auburn" },

        // Natural Blondes
        { value: "blonde", label: "Blonde" },
        { value: "golden_blonde", label: "Golden Blonde" },
        { value: "platinum_blonde", label: "Platinum Blonde" },
        { value: "dirty_blonde", label: "Dirty Blonde" },

        // Natural Blacks
        { value: "black", label: "Black" },
        { value: "soft_black", label: "Soft Black" },

        // Reds
        { value: "red", label: "Red" },
        { value: "copper_red", label: "Copper Red" },
        { value: "strawberry_blonde", label: "Strawberry Blonde" },

        // Grays / Silvers (AI distinguishes these beautifully)
        { value: "grey", label: "Grey" },
        { value: "silver", label: "Silver" },
        { value: "white", label: "White" },

        // Stylized / Fantasy Colors (VERY stable in NB)
        { value: "blue", label: "Blue" },
        { value: "dark_blue", label: "Dark Blue" },

        { value: "green", label: "Green" },
        { value: "emerald_green", label: "Emerald Green" },

        { value: "purple", label: "Purple" },
        { value: "lavender", label: "Lavender" },

        { value: "pink", label: "Pink" },
        { value: "magenta", label: "Magenta" },

        // High-impact stylized
        { value: "teal", label: "Teal" },
        { value: "turquoise", label: "Turquoise" },
        { value: "fiery_orange", label: "Fiery Orange" },

        // Special effects (AI interprets these cleanly)
        { value: "ombre", label: "Ombre" },
        { value: "two_tone", label: "Two-Tone" },

        // Supernatural / Sci-Fi
        { value: "glowing_white", label: "Glowing White" },
        { value: "glowing_blue", label: "Glowing Blue" },
        { value: "glowing_gold", label: "Glowing Gold" },
      ],
      allowCustom: true,
    },
    {
      key: "hair_texture",
      label: "Hair texture",
      type: "enum",
      options: [
        // Core textures
        { value: "straight", label: "Straight" },
        { value: "wavy", label: "Wavy" },
        { value: "curly", label: "Curly" },
        { value: "coily", label: "Coily" },

        // Degree-of-texture variants
        { value: "loose_waves", label: "Loose Waves" },
        { value: "tight_curls", label: "Tight Curls" },
        { value: "kinky_coily", label: "Kinky Coily" },

        // Texture-state descriptors (AI handles these very well)
        { value: "sleek", label: "Sleek" },
        { value: "voluminous", label: "Voluminous" },
        { value: "frizzy", label: "Frizzy" }, // safe, purely descriptive
        { value: "textured", label: "Textured" },
      ],
      allowCustom: true,
    },
    {
      key: "hair_length",
      label: "Hair length",
      type: "enum",
      options: [
        { value: "buzzed", label: "Buzzed" }, // very short, visible scalp
        { value: "short", label: "Short" }, // above ears / jaw
        { value: "medium", label: "Medium" }, // shoulders or collarbone
        { value: "long", label: "Long" }, // mid-back or flowing
        { value: "very_long", label: "Very Long" }, // waist-length or longer
        { value: "bald", label: "Bald / Shaved" }, // completely hair-free
      ],
      allowCustom: true,
    },
    {
      key: "hair_parting",
      label: "Parting",
      type: "enum",
      options: [
        { value: "center", label: "Center Part" },
        { value: "side_left", label: "Side Part (Left)" },
        { value: "side_right", label: "Side Part (Right)" },
        { value: "zigzag", label: "Zigzag Part" },
        { value: "none", label: "No Visible Part" },
      ],
      allowCustom: true,
    },
    {
      key: "hair_volume",
      label: "Volume",
      type: "enum",
      options: [
        { value: "flat", label: "Flat / Sleek" },
        { value: "low_volume", label: "Low Volume" },

        { value: "moderate", label: "Moderate Volume" },

        { value: "voluminous", label: "Voluminous" },
        { value: "extra_voluminous", label: "Extra Voluminous" },

        // Style-independent descriptors (AI interprets these well)
        { value: "thick_hair", label: "Thick Hair" },
        { value: "fine_hair", label: "Fine Hair" },
      ],
      allowCustom: true,
    },
    {
      key: "hair_silhouette",
      label: "Hair silhouette",
      type: "enum",
      options: [
        // Short silhouettes
        { value: "pixie", label: "Pixie Cut" },
        { value: "short_bob", label: "Short Bob" },
        { value: "bob", label: "Bob" },
        { value: "lob", label: "Lob (Long Bob)" },

        // Long down styles
        { value: "long_straight", label: "Long Straight" },
        { value: "long_wavy", label: "Long Wavy" },
        { value: "long_layers", label: "Long Layers" },

        // Pulled-back silhouettes
        { value: "tied_back", label: "Tied Back" },
        { value: "ponytail", label: "Ponytail" },
        { value: "high_ponytail", label: "High Ponytail" },
        { value: "low_ponytail", label: "Low Ponytail" },

        // Braids and plaits
        { value: "braids", label: "Braids" },
        { value: "single_braid", label: "Single Braid" },
        { value: "double_braids", label: "Double Braids" },

        // Updos
        { value: "bun", label: "Bun" },
        { value: "messy_bun", label: "Messy Bun" },
        { value: "formal_updo", label: "Formal Updo" },

        // Volumetric silhouettes
        { value: "afro", label: "Afro" }, // AI interprets this as a large rounded silhouette, purely structural
        { value: "curly_volume", label: "Curly Volume" }, // full curly silhouette

        // Specialty silhouettes (distinct, safe)
        { value: "shaved_sides", label: "Shaved Sides" },
        { value: "mohawk", label: "Mohawk" },
        { value: "half_up", label: "Half-Up Style" },
        { value: "loose_curls", label: "Loose Curls" },
      ],
      allowCustom: true,
    },
    {
      key: "facial_hair",
      label: "Facial hair",
      type: "enum",
      options: [
        // No facial hair
        { value: "none", label: "None" },

        // Light facial hair
        { value: "stubble", label: "Stubble" },
        { value: "light_beard", label: "Light Beard" },

        // Full facial hair
        { value: "beard", label: "Beard" },
        { value: "full_beard", label: "Full Beard" },

        // Styles AI recognizes VERY reliably
        { value: "mustache", label: "Mustache" },
        { value: "goatee", label: "Goatee" },
        { value: "van_dyke", label: "Van Dyke" }, // mustache + pointed goatee
        { value: "chin_strap", label: "Chin Strap" }, // well-defined silhouette

        // Specialty / stylized options
        { value: "mutton_chops", label: "Mutton Chops" }, // distinctive, consistent
        { value: "soul_patch", label: "Soul Patch" },
        { value: "five_oclock_shadow", label: "Five O'Clock Shadow" },
      ],
      allowCustom: true,
    },
  ],
};


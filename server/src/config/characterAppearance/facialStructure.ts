import type { AppearanceCategory } from './types.js';

export const facialStructureCategory: AppearanceCategory = {
  key: "facial_structure",
  label: "Facial Structure",
  order: 2,
  description:
    "Face and head traits that help keep identity consistent across generations.",
  properties: [
    {
      key: "face_shape",
      label: "Face shape",
      type: "enum",
      options: [
        { value: "oval", label: "Oval" },
        { value: "heart", label: "Heart" },
        { value: "square", label: "Square" },
        { value: "round", label: "Round" },
        { value: "diamond", label: "Diamond" },
        { value: "long", label: "Long / Oblong" },

        // Additional shapes AI handles well
        { value: "triangle", label: "Triangle (Narrow Forehead, Wider Jaw)" },
        {
          value: "inverted_triangle",
          label: "Inverted Triangle (Wider Forehead, Narrow Jaw)",
        },
      ],
      allowCustom: true,
    },
    {
      key: "jawline",
      label: "Jawline",
      type: "enum",
      options: [
        // Soft / Rounded Variants
        { value: "soft", label: "Soft" },
        { value: "rounded", label: "Rounded" },

        // Defined / Angular Variants
        { value: "angular", label: "Angular" },
        { value: "sharp", label: "Sharp" },
        { value: "chiseled", label: "Chiseled" },

        // Width Variants (AI reads these very clearly)
        { value: "wide", label: "Wide" },
        { value: "narrow", label: "Narrow" },

        // Length Variants (optional but highly distinguishable)
        { value: "short", label: "Short Jawline" },
        { value: "long", label: "Long Jawline" },
      ],
      allowCustom: true,
    },
    {
      key: "cheek_structure",
      label: "Cheek structure",
      type: "enum",
      options: [
        // Prominence / Height
        { value: "high", label: "High Cheekbones" },
        { value: "low", label: "Low Cheekbones" },

        // Contour / Definition
        { value: "defined", label: "Defined Contours" },
        { value: "soft", label: "Soft Cheeks" },
        { value: "full", label: "Full Cheeks" },

        // Angularity / Shape Influence
        { value: "sculpted", label: "Sculpted" }, // sharp, model-like
        { value: "rounded", label: "Rounded" }, // gentle fullness

        // Subtle Distinguishers
        { value: "prominent", label: "Prominent Cheeks" },
        { value: "delicate", label: "Delicate Cheeks" },
      ],
      allowCustom: true,
    },
    {
      key: "forehead_proportion",
      label: "Forehead proportion",
      type: "enum",
      options: [
        { value: "high", label: "High Forehead" }, // taller upper third
        { value: "low", label: "Low Forehead" }, // shorter upper third
        { value: "balanced", label: "Balanced Proportion" }, // even facial thirds

        // Additional distinctions AI reliably understands:
        { value: "broad", label: "Broad Forehead" }, // wider horizontal span
        { value: "narrow", label: "Narrow Forehead" }, // tighter horizontal span

        { value: "sloping", label: "Slightly Sloping Forehead" }, // angled backward a bit
        { value: "straight", label: "Straight Forehead" }, // more vertical profile
      ],
      allowCustom: true,
    },
    {
      key: "eye_shape",
      label: "Eye shape",
      type: "enum",
      options: [
        // Common universal shapes
        { value: "almond", label: "Almond" },
        { value: "round", label: "Round" },
        { value: "hooded", label: "Hooded" },
        { value: "monolid", label: "Monolid" }, // very reliably interpreted, safe
        { value: "upturned", label: "Upturned" },
        { value: "downturned", label: "Downturned" }, // equally important counterpart
        { value: "deep_set", label: "Deep-set" },

        // Additional AI-distinguishable shapes
        { value: "wide_set", label: "Wide-set Eyes" }, // spacing, but treated as shape
        { value: "close_set", label: "Close-set Eyes" },
        { value: "narrow", label: "Narrow Eyes" }, // elongated horizontally
      ],
      allowCustom: true,
    },
    {
      key: "eye_size",
      label: "Eye size",
      type: "enum",
      options: [
        { value: "small", label: "Small Eyes" },
        { value: "average", label: "Average Size Eyes" },
        { value: "large", label: "Large Eyes" },

        // Additional AI-stable descriptors
        { value: "wide", label: "Wide Eyes" }, // horizontally larger, expressive
        { value: "narrow", label: "Narrow Eyes" }, // horizontally slender, elegant
      ],
      allowCustom: true,
    },
    {
      key: "eye_color",
      label: "Eye color",
      type: "enum",
      options: [
        // Natural ranges
        { value: "brown", label: "Brown" },
        { value: "dark_brown", label: "Dark Brown" },
        { value: "light_brown", label: "Light Brown" },

        { value: "hazel", label: "Hazel" },
        { value: "amber", label: "Amber" },

        { value: "green", label: "Green" },
        { value: "olive_green", label: "Olive Green" },

        { value: "blue", label: "Blue" },
        { value: "light_blue", label: "Light Blue" },
        { value: "grey_blue", label: "Grey-Blue" },

        { value: "grey", label: "Grey" },
        { value: "steel_grey", label: "Steel Grey" },

        // Stylized / Fantasy (AI handles these beautifully)
        { value: "violet", label: "Violet" },
        { value: "gold", label: "Gold" },
        { value: "silver", label: "Silver" },

        // Sci-fi / Supernatural (still safe)
        { value: "glowing_blue", label: "Glowing Blue" },
        { value: "glowing_green", label: "Glowing Green" },
        { value: "glowing_gold", label: "Glowing Gold" },
      ],
      allowCustom: true,
    },
    {
      key: "eyebrow_shape",
      label: "Eyebrow shape",
      type: "enum",
      options: [
        // Shape curve
        { value: "arched", label: "Arched" }, // upward curve, expressive
        { value: "straight", label: "Straight" }, // flat line, calm expression
        { value: "soft_arched", label: "Soft Arched" }, // subtle curve, balanced
        { value: "rounded", label: "Rounded" }, // gentle semicircle

        // Angle / intensity
        { value: "angled", label: "Angled" }, // sharp angle, intense
        { value: "s_shaped", label: "S-Shaped" }, // AI interprets this reliably

        // Thickness / fullness
        { value: "thick", label: "Thick" },
        { value: "medium", label: "Medium" },
        { value: "thin", label: "Thin" },

        // Special safe categories
        { value: "soft", label: "Soft Brows" }, // delicate, gentle
        { value: "defined", label: "Defined Brows" }, // sharp edges, crisp look
      ],
      allowCustom: true,
    },
    {
      key: "nose_shape",
      label: "Nose shape",
      type: "enum",
      options: [
        // Common universal shapes
        { value: "straight", label: "Straight Nose" },
        { value: "button", label: "Button Nose" },
        { value: "aquiline", label: "Aquiline Nose" }, // prominent, gently curved bridge
        { value: "upturned", label: "Upturned Nose" }, // (AI reliably recognizes this)
        { value: "downturned", label: "Downturned Nose" }, // gentle slope down
        { value: "petite", label: "Petite Nose" },

        // Width-based distinctions
        { value: "wide", label: "Wide Nose" },
        { value: "narrow", label: "Narrow Nose" },

        // Profile / structure
        { value: "flat_bridge", label: "Flat Bridge" }, // AI interprets very well
        { value: "high_bridge", label: "High Bridge" },

        // Tip structure
        { value: "rounded_tip", label: "Rounded Tip" },
        { value: "defined_tip", label: "Defined Tip" },
      ],
      allowCustom: true,
    },
    {
      key: "mouth_shape",
      label: "Mouth shape",
      type: "enum",
      options: [
        // Lip fullness
        { value: "full_lips", label: "Full Lips" },
        { value: "medium_lips", label: "Medium Lips" },
        { value: "thin_lips", label: "Thin Lips" },

        // Mouth width / form
        { value: "wide_smile", label: "Wide Smile" },
        { value: "narrow_smile", label: "Narrow Smile" },

        // Corner expression shapes
        { value: "downturned_corners", label: "Downturned Corners" },
        { value: "upturned_corners", label: "Upturned Corners" }, // subtle, but AI does differentiate

        // Structure / contour
        { value: "defined_cupid_bow", label: "Defined Cupid’s Bow" },
        { value: "rounded_lips", label: "Rounded Lips" },

        // Neutral variations
        { value: "neutral_expression", label: "Neutral Expression" },
      ],
      allowCustom: true,
    },
    {
      key: "chin_shape",
      label: "Chin",
      type: "enum",
      options: [
        // Soft & Rounded
        { value: "rounded", label: "Rounded Chin" },
        { value: "soft", label: "Soft Chin" }, // gentler, subtle variation

        // Pointed / Tapered
        { value: "pointed", label: "Pointed Chin" },
        { value: "tapered", label: "Tapered Chin" }, // slightly elongated version

        // Strong / Angular
        { value: "square", label: "Square Chin" },
        { value: "broad", label: "Broad Chin" }, // distinct silhouette
        { value: "cleft", label: "Cleft Chin" }, // AI reliably renders this as a geometric contour, safe

        // Length Variants (AI-perfect)
        { value: "short", label: "Short Chin" },
        { value: "long", label: "Long Chin" },
      ],
      allowCustom: true,
    },
  ],
};


import type { AppearanceCategory } from './types.js';

export const skinCategory: AppearanceCategory = {
  key: "skin",
  label: "Skin",
  order: 4,
  description: "Neutral skin descriptors for tone, undertone, and texture.",
  properties: [
    {
      key: "skin_tone",
      label: "Skin tone",
      type: "enum",
      options: [
        // LIGHT RANGE
        { value: "pale", label: "Pale" }, // very light, minimal melanin
        { value: "fair", label: "Fair" }, // slightly warmer than pale
        { value: "light", label: "Light" }, // soft ivory/beige tones

        // MEDIUM RANGE
        { value: "medium", label: "Medium" }, // balanced beige–tan range
        { value: "tan", label: "Tan" }, // clearly sun-bronzed
        { value: "golden", label: "Golden" }, // warm yellow-gold undertone
        { value: "olive", label: "Olive" }, // green-neutral undertone (very distinct)

        // BROWN RANGE
        { value: "light_brown", label: "Light Brown" }, // light cocoa, soft warmth
        { value: "medium_brown", label: "Medium Brown" }, // mid-depth browns
        { value: "deep_brown", label: "Deep Brown" }, // rich, dark brown tones

        // DARK RANGE
        { value: "ebony", label: "Ebony" }, // very dark, cool undertone
        { value: "mahogany", label: "Mahogany" }, // dark with warm red undertone
      ],
      allowCustom: true,
    },
    {
      key: "undertone",
      label: "Undertone",
      type: "enum",
      options: [
        { value: "warm", label: "Warm" }, // yellow/gold/red cast
        { value: "cool", label: "Cool" }, // pink/blue cast
        { value: "neutral", label: "Neutral" }, // balanced, no strong cast
        { value: "olive", label: "Olive" }, // green-neutral undertone

        // NEW DISTINCT OPTIONS
        { value: "peach", label: "Peach" }, // warm pink with slight orange hue
        { value: "rosy", label: "Rosy" }, // pronounced pink undertone
        { value: "golden", label: "Golden" }, // strong yellow-gold warmth
        { value: "amber", label: "Amber" }, // rich warm undertone with red/orange tint
        { value: "ashen", label: "Ashen" }, // cool grayish undertone (AI handles this surprisingly well)
        { value: "red", label: "Red" }, // visible red warmth distinct from peach/amber
      ],
      allowCustom: true,
    },
    {
      key: "complexion",
      label: "Complexion",
      type: "enum",
      options: [
        { value: "smooth", label: "Smooth" }, // even texture, no bumps
        { value: "freckled", label: "Freckled" }, // scattered small pigment dots
        { value: "weathered", label: "Weathered" }, // lines, sun-wear, rugged texture
        { value: "glowing", label: "Glowing" }, // luminous, dewy, soft radiance
        { value: "matte", label: "Matte" }, // non-reflective, velvety texture

        // NEW — all clearly distinguishable in generation
        { value: "porcelain", label: "Porcelain" }, // pale, smooth, light-reflective clarity
        { value: "ruddy", label: "Ruddy" }, // warm red undertones, healthy flush
        { value: "sallow", label: "Sallow" }, // slightly yellow/ashen tone
        { value: "sun_kissed", label: "Sun-kissed" }, // subtle warm bronzing, light sun marks
        { value: "olive", label: "Olive" }, // greenish/neutral undertone, distinct
        { value: "ashy", label: "Ashy" }, // desaturated, cool-gray undertone
        { value: "rosy", label: "Rosy" }, // noticeable pink undertone
        { value: "blemished", label: "Blemished" }, // visible acne marks or mild texture
        { value: "scarred", label: "Scarred" }, // clear, intentional scarring patterns
        { value: "radiant_oily", label: "Radiant (Oily)" }, // shine on forehead/cheeks/nose
        { value: "dry_flaky", label: "Dry / Flaky" }, // subtle dryness or flake patterns
      ],
      allowCustom: true,
    },
    {
      key: "distinctive_marks",
      label: "Distinctive marks",
      type: "enum",
      options: [
        // COMMON, HIGHLY RECOGNIZABLE
        { value: "beauty_mark", label: "Beauty Mark" }, // small mole, stable placement
        { value: "mole_cluster", label: "Mole Cluster" }, // 2–4 grouped moles, very distinct
        { value: "scar_thin", label: "Thin Scar" }, // fine line, subtle
        { value: "scar_wide", label: "Wide Scar" }, // thicker or indenting
        { value: "freckle_cluster", label: "Freckle Cluster" }, // focused freckles in one region
        { value: "birthmark", label: "Birthmark" }, // clear pigment patch

        // MID-LEVEL DISTINCTIVE FEATURES
        { value: "dimple_single", label: "Dimple (Single)" }, // left or right cheek
        { value: "dimples_both", label: "Dimples (Both Cheeks)" }, // bilateral dimples
        { value: "cleft_chin", label: "Cleft Chin" }, // central chin divide
        { value: "eyebrow_slit", label: "Eyebrow Slit" }, // shaved or natural gap in brow
        { value: "heterochromia_partial", label: "Partial Heterochromia" }, // small color segment
        { value: "heterochromia_full", label: "Full Heterochromia" }, // each eye fully different color

        // UNIQUE BUT MODEL-STABLE OPTIONS
        { value: "nose_bridge_freckle", label: "Nose-Bridge Freckle" }, // single centered freckle
        { value: "cheek_scuff_scar", label: "Cheek Scuff Scar" }, // shallow diagonal line
        { value: "jawline_scar", label: "Jawline Scar" }, // vertical or angled
        { value: "lip_mole", label: "Lip Mole" }, // above/side of lip, Marilyn-style
        { value: "temple_mark", label: "Temple Mark" }, // mark near the temple
        { value: "faint_under_eye_mark", label: "Under-Eye Mark" }, // subtle but consistent

        // BODY MARKS THAT STILL REGISTER WELL IN PORTRAITS
        { value: "shoulder_freckle", label: "Shoulder Freckle" }, // single dot or cluster
        { value: "collarbone_scar", label: "Collarbone Scar" }, // thin short line
        { value: "hand_scar", label: "Hand Scar" }, // visible on fingers/back of hand
      ],
      allowCustom: true,
    },
  ],
};


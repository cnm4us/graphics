import type { AppearanceCategory } from './types.js';

export const physiqueCategory: AppearanceCategory = {
  key: "physique",
  label: "Physique",
  order: 5,
  description:
    "Silhouette-defining traits (shape and proportions), not sexualized detail.",
  properties: [
    {
      key: "overall_body_shape",
      label: "Overall body shape",
      type: "enum",
      options: [
        { value: "hourglass", label: "Hourglass" }, // defined waist, balanced bust/hips
        { value: "rectangle", label: "Rectangle" }, // straight sides, minimal waist taper
        { value: "pear", label: "Pear" }, // wider hips, narrower shoulders
        { value: "inverted_triangle", label: "Inverted Triangle" }, // broad shoulders, narrower hips
        { value: "v_shape", label: "V-Shape" }, // athletic upper body tapering downward

        // NEW — All highly distinguishable by image models
        { value: "apple", label: "Apple" }, // fuller midsection, slimmer legs
        { value: "diamond", label: "Diamond" }, // narrow shoulders/hips, fullness at waist
        { value: "oval", label: "Oval" }, // rounded overall shape, soft curves
        { value: "athletic", label: "Athletic" }, // muscular, defined lines
        { value: "slender", label: "Slender" }, // long, lean proportions
        { value: "petite", label: "Petite" }, // smaller overall frame
        { value: "full_figured", label: "Full-Figured" }, // larger curves throughout body
        { value: "stocky", label: "Stocky" }, // compact, broad, strong frame
        { value: "lanky", label: "Lanky" }, // tall, thin, elongated limbs
        { value: "curvy", label: "Curvy" }, // softly rounded, multiple curve points
        { value: "muscular", label: "Muscular" }, // prominent muscle definition
      ],
      allowCustom: true,
    },
    {
      key: "shoulder_width",
      label: "Shoulder width",
      type: "enum",
      options: [
        { value: "narrow", label: "Narrow" }, // visibly slimmer than hips
        { value: "average", label: "Average" }, // proportional to torso
        { value: "broad", label: "Broad" }, // wider than hips; strong line

        // NEW — additional distinct, model-stable values
        { value: "sloped_narrow", label: "Sloped & Narrow" }, // narrow with downward angle
        { value: "square_narrow", label: "Square & Narrow" }, // narrow but straight horizontal
        { value: "square_broad", label: "Square & Broad" }, // broad + pronounced straight line
        { value: "rounded_broad", label: "Rounded & Broad" }, // broad but softened curvature
        { value: "sloped_wide", label: "Sloped Wide" }, // wide span + angled downward
        { value: "angular", label: "Angular" }, // sharp angles, athletic look
        { value: "petite_shoulders", label: "Petite Shoulders" }, // small frame, delicate width
      ],
      allowCustom: true,
    },
    {
      key: "waist_definition",
      label: "Waist definition",
      type: "enum",
      options: [
        { value: "low", label: "Low" }, // minimal taper; straight torso
        { value: "moderate", label: "Moderate" }, // gentle inward curve
        { value: "high", label: "High" }, // strong contrast between ribs/hips

        // NEW — additional, AI-distinguishable shapes
        { value: "very_low", label: "Very Low" }, // almost no indentation; column-like
        { value: "very_high", label: "Very High" }, // dramatic cinch; pronounced hourglass
        { value: "tapered", label: "Tapered" }, // steady narrowing toward the waist
        { value: "straight", label: "Straight" }, // uniform width with near-zero curvature
        { value: "rounded", label: "Rounded" }, // soft curve without sharp taper
        { value: "athletic_taper", label: "Athletic Taper" }, // V→waist shape with muscle contour influence
        { value: "soft_defined", label: "Soft but Defined" }, // gentle taper with soft transitions
      ],
      allowCustom: true,
    },
    {
      key: "torso_length",
      label: "Torso length",
      type: "enum",
      options: [
        { value: "short", label: "Short" }, // torso noticeably shorter than legs
        { value: "average", label: "Average" }, // balanced proportions
        { value: "long", label: "Long" }, // extended torso relative to leg length

        // NEW — well-distinguished proportional variants
        { value: "very_short", label: "Very Short" }, // extremely compact torso
        { value: "very_long", label: "Very Long" }, // extended torso with extra space from ribs to hips
        { value: "high_waisted", label: "High-Waisted Look" }, // shorter lower torso; long legs effect
        { value: "low_waisted", label: "Low-Waisted Look" }, // longer lower torso; lower hip line
        { value: "compact_upper", label: "Compact Upper Torso" }, // short ribcage+chest, normal abdomen
        { value: "elongated_upper", label: "Elongated Upper Torso" }, // long ribcage; tall chest area
        { value: "compact_lower", label: "Compact Lower Torso" }, // short waist/abdomen region
        { value: "elongated_lower", label: "Elongated Lower Torso" }, // long waist region; distinct silhouette
      ],
      allowCustom: true,
    },
    {
      key: "leg_length",
      label: "Leg length",
      type: "enum",
      options: [
        { value: "short", label: "Short" }, // legs shorter relative to torso
        { value: "average", label: "Average" }, // balanced torso-to-leg ratio
        { value: "long", label: "Long" }, // legs noticeably longer

        // NEW — strong visual distinctions
        { value: "very_short", label: "Very Short" }, // dramatically shorter; low leg line
        { value: "very_long", label: "Very Long" }, // strikingly elongated legs
        { value: "long_thighs", label: "Long Thighs" }, // upper legs dominate proportion
        { value: "long_calves", label: "Long Calves" }, // lower legs elongated; distinct silhouette
        { value: "balanced_long", label: "Balanced Long" }, // both segments long but proportional
        { value: "balanced_short", label: "Balanced Short" }, // both segments short but proportional
        { value: "high_leg_line", label: "High Leg Line" }, // hips positioned visually higher
        { value: "low_leg_line", label: "Low Leg Line" }, // hips positioned visually lower
      ],
      allowCustom: true,
    },
    {
      key: "musculature",
      label: "Musculature",
      type: "enum",
      options: [
        { value: "soft", label: "Soft" }, // minimal muscle definition
        { value: "toned", label: "Toned" }, // light definition, lean silhouette
        { value: "athletic", label: "Athletic" }, // visible muscle lines; proportional
        { value: "muscular", label: "Muscular" }, // strong definition across body
        { value: "bulky", label: "Bulky" }, // large muscle mass; thick frame
        { value: "delicate", label: "Delicate" }, // fine, subtle, low muscle presence

        // NEW — highly distinguishable, model-stable musculature types
        { value: "slim_fit", label: "Slim-Fit" }, // lean with slight definition
        { value: "cut", label: "Cut" }, // sharp definition; low body fat look
        { value: "ripped", label: "Ripped" }, // highly defined muscles, deep striations
        { value: "powerlifter", label: "Powerlifter Build" }, // compact + powerful; thick limbs
        { value: "swimmer", label: "Swimmer Build" }, // broad shoulders, streamlined muscles
        { value: "runner", label: "Runner Build" }, // lean lower body, defined legs
        { value: "balanced", label: "Balanced" }, // moderate, symmetrical definition
        { value: "soft_athletic", label: "Soft Athletic" }, // athletic outline with gentle softness
        { value: "stocky_muscular", label: "Stocky Muscular" }, // short, broad, densely muscled
        { value: "slender_muscular", label: "Slender Muscular" }, // long lines + toned definition
      ],
      allowCustom: true,
    },
  ],
};


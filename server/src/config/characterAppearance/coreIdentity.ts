import type { AppearanceCategory } from './types.js';

export const coreIdentityCategory: AppearanceCategory = {
  key: "core_identity",
  label: "Core Identity",
  order: 1,
  description:
    "High-level identity traits that help the AI maintain who this character is.",
  properties: [
    {
      key: "name",
      label: "Name",
      type: "string",
    },
    {
      key: "age_range",
      label: "Age / apparent age range",
      type: "enum",
      options: [
        { value: "early_20s", label: "Early 20s" },
        { value: "mid_20s", label: "Mid 20s" },
        { value: "late_20s", label: "Late 20s" },

        { value: "early_30s", label: "Early 30s" },
        { value: "mid_30s", label: "Mid 30s" },
        { value: "late_30s", label: "Late 30s" },

        { value: "early_40s", label: "Early 40s" },
        { value: "mid_40s", label: "Mid 40s" },
        { value: "late_40s", label: "Late 40s" },

        { value: "50s", label: "50s" },
        { value: "60s", label: "60s" },

        { value: "ageless", label: "Ageless / Timeless" },
      ],
      allowCustom: true,
    },
    {
      key: "gender_identity",
      label: "Gender identity or presentation",
      type: "enum",
      options: [
        { value: "woman", label: "Woman" },
        { value: "man", label: "Man" },

        { value: "non_binary", label: "Non-binary" },
        { value: "androgynous", label: "Androgynous" },
        { value: "genderfluid", label: "Gender-fluid" },

        { value: "agender", label: "Agender" },
        { value: "trans_woman", label: "Trans Woman" },
        { value: "trans_man", label: "Trans Man" },
      ],
      allowCustom: true,
    },
    {
      key: "pronouns",
      label: "Pronouns",
      type: "enum",
      options: [
        { value: "she_her", label: "she/her" },
        { value: "he_him", label: "he/him" },
        { value: "they_them", label: "they/them" },
        { value: "she_they", label: "she/they" },
        { value: "he_they", label: "he/they" },
      ],
      allowCustom: true,
    },
    {
      key: "species",
      label: "Species / race",
      type: "enum",
      options: [
        { value: "human", label: "Human" },
        { value: "enhanced_human", label: "Enhanced Human" },
        { value: "synthetic_human", label: "Synthetic Human" },

        { value: "elf", label: "Elf" },
        { value: "dwarf", label: "Dwarf" },
        { value: "orc", label: "Orc" },
        { value: "fae", label: "Fae / Fairy" },
        { value: "giant", label: "Giant" },
        { value: "halfling", label: "Halfling" },

        { value: "android", label: "Android" },
        { value: "cyborg", label: "Cyborg" },
        { value: "synthetic", label: "Synthetic Humanoid" },
        { value: "robotic_humanoid", label: "Robotic Humanoid" },
        { value: "biotech_hybrid", label: "Biotech Hybrid" },

        { value: "alien_humanoid", label: "Alien (Humanoid)" },
        { value: "alien_exotic", label: "Alien (Exotic Humanoid)" },
        { value: "alien_reptilian", label: "Alien (Reptilian Humanoid)" },
        { value: "alien_feline", label: "Alien (Feline Humanoid)" },
        { value: "alien_aquatic", label: "Alien (Aquatic Humanoid)" },

        { value: "anthro_feline", label: "Anthro Feline (Humanoid)" },
        { value: "anthro_canine", label: "Anthro Canine (Humanoid)" },
        { value: "anthro_reptile", label: "Anthro Reptilian (Humanoid)" },

        { value: "angelic", label: "Angelic Humanoid" },
        { value: "demonic", label: "Demonic Humanoid" },
        { value: "vampire", label: "Vampire (Humanoid)" },
        { value: "shapeshifter_default", label: "Shapeshifter (Default Form)" },
      ],
      allowCustom: true,
    },
    {
      key: "ethnicity_cues",
      label: "Ethnicity / cultural cues",
      type: "enum",
      options: [
        // East Asia
        { value: "east_asian_features", label: "East Asian Features" },
        {
          value: "southeast_asian_features",
          label: "Southeast Asian Features",
        },

        // South Asia
        { value: "south_asian_features", label: "South Asian Features" },

        // Middle East & North Africa
        {
          value: "mena_features",
          label: "Middle Eastern / North African Features",
        },

        // Europe
        {
          value: "northern_european_features",
          label: "Northern European Features",
        },
        {
          value: "eastern_european_features",
          label: "Eastern European Features",
        },
        { value: "mediterranean_features", label: "Mediterranean Features" },

        // Africa & African Diaspora
        {
          value: "sub_saharan_african_features",
          label: "Sub-Saharan African Features",
        },
        {
          value: "african_diaspora_features",
          label: "African Diaspora Features",
        },

        // Indigenous Groups (visually understood, safely phrased)
        {
          value: "indigenous_american_features",
          label: "Indigenous American Features",
        },
        { value: "polynesian_features", label: "Polynesian Features" },

        // Latin America (visually diverse, culturally broad)
        { value: "latinx_features", label: "Latinx Features" },

        // Mixed / Ambiguous
        { value: "mixed_heritage_features", label: "Mixed-Heritage Features" },
        {
          value: "ambiguous_global_features",
          label: "Ambiguous Global Features",
        },
      ],
      allowCustom: true,
    },
    {
      key: "height_category",
      label: "Height category",
      type: "enum",
      options: [
        { value: "very_short", label: "Very Short" }, // noticeably below average adult height
        { value: "short", label: "Short" }, // slightly below average

        { value: "average", label: "Average Height" }, // baseline adult silhouette

        { value: "above_average", label: "Above Average" }, // distinct but not exaggerated
        { value: "tall", label: "Tall" }, // clearly taller than typical
        { value: "very_tall", label: "Very Tall" }, // rare, dramatic height difference
      ],
      allowCustom: true,
    },
    {
      key: "body_type",
      label: "Body type",
      type: "enum",
      options: [
        // Lean / Slim Variants
        { value: "slender", label: "Slender" },
        { value: "lean", label: "Lean" },

        // Average / Balanced
        { value: "average", label: "Average Build" },
        { value: "toned", label: "Toned" }, // lightly athletic, subtly defined

        // Athletic / Muscular Variants
        { value: "athletic", label: "Athletic" },
        { value: "muscular", label: "Muscular" },
        { value: "powerful", label: "Powerful Build" }, // broader, stronger silhouette

        // Curvy / Soft Builds
        { value: "curvy", label: "Curvy" }, // feminine-coded or soft proportions
        { value: "full_figured", label: "Full-Figured" }, // neutral, non-sexual, visually distinct
        { value: "soft_build", label: "Soft Build" }, // gentle contours

        // Broad / Solid Variants
        { value: "stocky", label: "Stocky" }, // shorter + solid
        { value: "solid", label: "Solid Build" }, // heavier but not necessarily fat
        { value: "heavyset", label: "Heavyset" }, // broad silhouette, stable for AI
      ],
      allowCustom: true,
    },
    {
      key: "personality_keywords",
      label: "Personality keywords (3–7)",
      type: "tags",
      options: [
        // Warm / Calm
        { value: "calm", label: "Calm" },
        { value: "kind", label: "Kind" },
        { value: "gentle", label: "Gentle" },
        { value: "patient", label: "Patient" },
        { value: "thoughtful", label: "Thoughtful" },
        { value: "warm", label: "Warm" },

        // Energetic / Curious
        { value: "optimistic", label: "Optimistic" },
        { value: "energetic", label: "Energetic" },
        { value: "enthusiastic", label: "Enthusiastic" },
        { value: "playful", label: "Playful" },
        { value: "curious", label: "Curious" },

        // Intense / Bold
        { value: "impulsive", label: "Impulsive" },
        { value: "bold", label: "Bold" },
        { value: "fierce", label: "Fierce" },
        { value: "ruthless", label: "Ruthless" },
        { value: "intense", label: "Intense" },

        // Reserved / Controlled
        { value: "stoic", label: "Stoic" },
        { value: "serious", label: "Serious" },
        { value: "reserved", label: "Reserved" },
        { value: "disciplined", label: "Disciplined" },

        // Skeptical / Hardened
        { value: "cynical", label: "Cynical" },
        { value: "skeptical", label: "Skeptical" },
        { value: "guarded", label: "Guarded" },
        { value: "pragmatic", label: "Pragmatic" },
      ],
      allowCustom: true,
    },
    {
      key: "archetype",
      label: "Archetype",
      type: "enum",
      options: [
        // Classic Heroic Archetypes
        { value: "hero", label: "Hero" },
        { value: "guardian", label: "Guardian" },
        { value: "leader", label: "Leader" },

        // Wise / Supportive
        { value: "mentor", label: "Mentor" },
        { value: "sage", label: "Sage" },
        { value: "caretaker", label: "Caretaker" },

        // Intellectual / Strategic
        { value: "scholar", label: "Scholar" },
        { value: "strategist", label: "Strategist" },
        { value: "inventor", label: "Inventor" },
        { value: "analyst", label: "Analyst" },

        // Rebels / Rogues / Free Spirits
        { value: "rebel", label: "Rebel" },
        { value: "trickster", label: "Trickster" },
        { value: "rogue", label: "Rogue" },
        { value: "maverick", label: "Maverick" },

        // Mystic / Otherworldly (very useful for fantasy & sci-fi species)
        { value: "mystic", label: "Mystic" },
        { value: "oracle", label: "Oracle" },
        { value: "seer", label: "Seer" },

        // Darker-but-safe archetypes
        { value: "antihero", label: "Antihero" },
        { value: "enigma", label: "Enigma" }, // mysterious vibe, good for ageless characters
      ],
      allowCustom: true,
    },
  ],
};


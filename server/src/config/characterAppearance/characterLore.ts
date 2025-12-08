import type { AppearanceCategory } from './types.js';

export const characterLoreCategory: AppearanceCategory = {
  key: "character_lore",
  label: "Character Lore / Narrative Identity",
  order: 8,
  description:
    "Narrative cues (backstory, motivations, strengths, flaws) that help AI keep the character coherent.",
  properties: [
    {
      key: "backstory_summary",
      label: "Backstory summary",
      type: "string",
      description: "1–2 lines describing key background details.",
    },
    {
      key: "motivations",
      label: "Motivations",
      type: "enum",
      options: [
        { value: "justice", label: "Justice / Fairness" },
        { value: "revenge", label: "Revenge" },
        { value: "redemption", label: "Redemption" },
        { value: "curiosity", label: "Curiosity / Discovery" },
        { value: "ambition", label: "Ambition / Power" },
        { value: "protection", label: "Protection (of others)" },
        { value: "self_preservation", label: "Self-Preservation" },
        { value: "loyalty", label: "Loyalty / Duty" },
        { value: "love", label: "Love / Affection" },
        { value: "freedom", label: "Freedom / Independence" },
        { value: "belonging", label: "Belonging / Acceptance" },
        { value: "order", label: "Order / Stability" },
        { value: "chaos", label: "Chaos / Disruption" },
        { value: "knowledge", label: "Knowledge / Mastery" },
        { value: "survival", label: "Survival" },
        { value: "adventure", label: "Adventure / Thrill-Seeking" },
        { value: "justice_reform", label: "Reform / Changing the System" },
        { value: "ideology", label: "Ideological Belief" },
        { value: "greed", label: "Greed / Material Gain" },
        { value: "legacy", label: "Legacy / Leaving a Mark" },
        { value: "healing", label: "Healing (Self or Others)" },
        { value: "vengeance_for_others", label: "Avenging Others" },
        { value: "honor", label: "Honor / Integrity" },
        { value: "responsibility", label: "Responsibility / Obligation" },
        { value: "escape", label: "Escape (from past or present)" },
        { value: "restore_balance", label: "Restore Balance" },
      ],
      allowCustom: true,
    },
    {
      key: "strengths",
      label: "Strengths",
      type: "tags",
      options: [
        { value: "brave", label: "Brave" },
        { value: "loyal", label: "Loyal" },
        { value: "clever", label: "Clever" },
        { value: "kind", label: "Kind" },
        { value: "resilient", label: "Resilient" },
        { value: "resourceful", label: "Resourceful" },
        { value: "strategic", label: "Strategic" },
        { value: "empathetic", label: "Empathetic" },
        { value: "honest", label: "Honest" },
        { value: "disciplined", label: "Disciplined" },

        // NEW — Personality strengths
        { value: "charismatic", label: "Charismatic" }, // persuasive charm
        { value: "calm_under_pressure", label: "Calm Under Pressure" },
        { value: "optimistic", label: "Optimistic" },
        { value: "patient", label: "Patient" },
        { value: "diplomatic", label: "Diplomatic" }, // conflict-resolution

        // NEW — Cognitive / skill-based strengths
        { value: "analytical", label: "Analytical" },
        { value: "observant", label: "Observant" },
        { value: "creative", label: "Creative" },
        { value: "quick_learner", label: "Quick Learner" },
        { value: "problem_solver", label: "Problem Solver" },

        // NEW — Leadership & social strengths
        { value: "inspiring", label: "Inspiring" },
        { value: "protective", label: "Protective" },
        { value: "team_oriented", label: "Team-Oriented" },
        { value: "responsible", label: "Responsible" },
        { value: "assertive", label: "Assertive" },

        // NEW — Moral / character strengths
        { value: "principled", label: "Principled" },
        { value: "selfless", label: "Selfless" },
        { value: "forgiving", label: "Forgiving" },

        // NEW — Physical or action-oriented strengths (non-body-type)
        { value: "agile", label: "Agile" },
        { value: "enduring", label: "Enduring" }, // stamina without implying body size
        { value: "dexterous", label: "Dexterous" },
      ],
      allowCustom: true,
    },
    {
      key: "flaws",
      label: "Flaws",
      type: "tags",
      options: [
        { value: "stubborn", label: "Stubborn" },
        { value: "impulsive", label: "Impulsive" },
        { value: "naive", label: "Naive" },
        { value: "arrogant", label: "Arrogant" },
        { value: "secretive", label: "Secretive" },
        { value: "jealous", label: "Jealous" },
        { value: "impatient", label: "Impatient" },
        { value: "overconfident", label: "Overconfident" },

        // Emotional / interpersonal flaws
        { value: "aloof", label: "Aloof" },
        { value: "overly_trusting", label: "Overly Trusting" },
        { value: "defensive", label: "Defensive" },
        { value: "blunt", label: "Blunt" },
        { value: "people_pleaser", label: "People-Pleaser" },
        { value: "clingy", label: "Clingy" },
        { value: "temperamental", label: "Temperamental" },

        // Cognitive / situational flaws
        { value: "distractible", label: "Distractible" },
        { value: "indecisive", label: "Indecisive" },
        { value: "risk_averse", label: "Risk-Averse" },
        { value: "idealistic", label: "Overly Idealistic" },
        { value: "pessimistic", label: "Pessimistic" },

        // Social or role-based flaws
        { value: "workaholic", label: "Workaholic" },
        { value: "controlling", label: "Controlling" },
        { value: "competitive", label: "Too Competitive" },
        { value: "isolating", label: "Self-Isolating" },
        { value: "unreliable", label: "Unreliable" },

        // Moral / situational flaws (AI-safe formulations)
        { value: "selfish", label: "Selfish" },
        { value: "spiteful", label: "Spiteful" },
        { value: "vengeful", label: "Vengeful" },
        { value: "dishonest", label: "Dishonest" },

        // Mild flaws / quirks (great for subtle characters)
        { value: "awkward", label: "Awkward" },
        { value: "perfectionist", label: "Perfectionist" },
        { value: "sarcastic", label: "Sarcastic" },
        { value: "overthinking", label: "Overthinks" },
        { value: "messy", label: "Messy / Disorganized" },
      ],
      allowCustom: true,
    },
    {
      key: "role_in_story",
      label: "Role in story",
      type: "enum",
      options: [
        { value: "protagonist", label: "Protagonist" },
        { value: "antagonist", label: "Antagonist" },
        { value: "deuteragonist", label: "Deuteragonist (Secondary Lead)" },
        { value: "tritagonist", label: "Tritagonist (Tertiary Lead)" },

        // SUPPORTING ARCHETYPES
        { value: "mentor", label: "Mentor / Guide" },
        { value: "guardian", label: "Guardian / Protector" },
        { value: "navigator", label: "Navigator / Strategist" },
        { value: "healer", label: "Healer / Support" },
        { value: "trickster", label: "Trickster / Wild Card" },
        { value: "comic_relief", label: "Comic Relief" },

        // RELATIONAL ROLES
        { value: "love_interest", label: "Love Interest" },
        { value: "rival", label: "Rival" },
        { value: "confidante", label: "Confidante" },
        { value: "outsider", label: "Outsider / Stranger" },

        // OPPOSITION + TENSION ROLES
        { value: "foil", label: "Foil (Contrast Character)" },
        { value: "traitor", label: "Traitor / Turncoat" },
        { value: "instigator", label: "Instigator / Catalyst" },
        { value: "saboteur", label: "Saboteur" },

        // LEADERSHIP ROLES
        { value: "leader", label: "Leader / Commander" },
        { value: "advisor", label: "Advisor / Counselor" },
        { value: "figurehead", label: "Figurehead / Symbolic Leader" },

        // WORLD/LORE ROLES
        { value: "scholar", label: "Scholar / Lore Keeper" },
        { value: "seeker", label: "Seeker / Explorer" },
        { value: "visionary", label: "Visionary / Innovator" },
        { value: "survivor", label: "Survivor" },

        // PLOT-INFLECTION ROLES
        { value: "catalyst", label: "Catalyst (Plot-Mover)" },
        { value: "observer", label: "Observer (Non-Interfering)" },
        { value: "redeemer", label: "Redeemer" },
        { value: "villain_redeemed", label: "Redeemed Villain" },
      ],
      allowCustom: true,
    },
    {
      key: "relationships",
      label: "Relationships",
      type: "string",
      description:
        "Links to other characters or entities (IDs or short labels).",
    },
  ],
};

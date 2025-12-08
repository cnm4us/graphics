import type { AppearanceCategory } from './types.js';

export const distinctiveMarkersCategory: AppearanceCategory = {
  key: "distinctive_markers",
  label: "Distinctive Character Markers",
  order: 6,
  description:
    "Behavioral and visual markers that make the character instantly recognizable.",
  properties: [
    {
      key: "signature_expression",
      label: "Signature expression",
      type: "enum",
      options: [
        { value: "soft_smile", label: "Soft Smile" }, // gentle uplift, relaxed eyes
        { value: "intense_gaze", label: "Intense Gaze" }, // focused eyes, firm mouth
        { value: "resting_scowl", label: "Resting Scowl" }, // downward brows, tight lips
        { value: "neutral", label: "Neutral" }, // relaxed, minimal expression

        // NEW — visually distinct, model-stable expressions
        { value: "cheerful_grin", label: "Cheerful Grin" }, // wide smile, bright eyes
        { value: "smirk", label: "Smirk" }, // one-sided smile, playful
        { value: "serene", label: "Serene" }, // calm, softened features
        { value: "thoughtful", label: "Thoughtful" }, // slightly furrowed brow, soft mouth
        { value: "surprised_soft", label: "Soft Surprise" }, // widened eyes, parted lips
        { value: "stern", label: "Stern" }, // firm jaw, tight expression
        { value: "mischievous", label: "Mischievous" }, // raised eyebrow, sly smile
        { value: "dreamy", label: "Dreamy" }, // distant gaze, softened eyes
        { value: "focused", label: "Focused" }, // brows drawn slightly inward
        { value: "warm_smile", label: "Warm Smile" }, // bright eyes + gentle warmth
        { value: "deadpan", label: "Deadpan" }, // flat affect, still gaze
        { value: "wistful", label: "Wistful" }, // soft sadness + distant eyes
        { value: "playful_pout", label: "Playful Pout" }, // rounded lips, teasing eyes
        { value: "raised_brow", label: "Raised Brow" }, // single lifted eyebrow expression
      ],
      allowCustom: true,
    },
    {
      key: "signature_posture",
      label: "Signature posture",
      type: "enum",
      options: [
        { value: "confident", label: "Confident" }, // upright spine, open chest
        { value: "relaxed", label: "Relaxed" }, // loose shoulders, casual stance
        { value: "rigid", label: "Rigid" }, // stiff posture, tension visible
        { value: "graceful", label: "Graceful" }, // fluid lines, soft movement

        // NEW — distinct, highly AI-recognizable posture archetypes
        { value: "casual_slouch", label: "Casual Slouch" }, // slight forward lean, relaxed frame
        { value: "upright_poised", label: "Upright & Poised" }, // refined, composed, elegant
        { value: "athletic_ready", label: "Athletic Ready" }, // weight forward, alert stance
        { value: "playful_tilt", label: "Playful Tilt" }, // slight hip/shoulder tilt; lively
        { value: "stoic_stance", label: "Stoic Stance" }, // stillness, firm grounding
        { value: "open_friendly", label: "Open & Friendly" }, // open arms/shoulders, welcoming
        { value: "shy_closed", label: "Shy & Closed" }, // slightly inward shoulders, soft frame
        { value: "commanding", label: "Commanding" }, // dominating presence, broadened stance
        { value: "elegant_sway", label: "Elegant Sway" }, // gentle curve in posture; soft balance
        { value: "balanced_neutral", label: "Balanced Neutral" }, // controlled, textbook posture
        { value: "energetic_forward", label: "Energetic Forward" }, // leaning slightly forward with intent
        { value: "leaning_back_relaxed", label: "Leaning Back" }, // weight on heels, open torso
      ],
      allowCustom: true,
    },
    {
      key: "gestures",
      label: "Gestures",
      type: "tags",
      options: [
        { value: "talks_with_hands", label: "Talks with Hands" }, // animated hand movement
        { value: "tilts_head", label: "Tilts Head" }, // frequent head angle changes
        { value: "stands_tall", label: "Stands Tall" }, // upright, confident stance

        // NEW — distinct, model-recognizable gestures
        { value: "hands_in_pockets", label: "Hands in Pockets" }, // casual, relaxed pose
        { value: "crossed_arms", label: "Arms Crossed" }, // defensive or confident closure
        { value: "one_hand_on_hip", label: "One Hand on Hip" }, // sass, confidence, readiness
        { value: "steepled_fingers", label: "Steepled Fingers" }, // contemplative gesture
        { value: "hand_through_hair", label: "Hand Through Hair" }, // expressive, slightly dramatic
        { value: "hands_clasped", label: "Hands Clasped" }, // gentle or polite posture
        { value: "finger_pointing", label: "Finger Pointing" }, // emphasis in speech
        { value: "chin_touch", label: "Touching Chin" }, // thinking pose
        { value: "hand_wave", label: "Hand Wave" }, // greeting or attention-catching
        { value: "open_palm_gesture", label: "Open Palm Gesture" }, // welcoming, explanatory
        { value: "hands_behind_back", label: "Hands Behind Back" }, // reserved, formal, or shy
        { value: "arms_spread", label: "Arms Spread" }, // expressive or inviting
        { value: "fingers_tapping", label: "Fingers Tapping" }, // impatient or rhythmic gesture
        { value: "hand_on_chest", label: "Hand on Chest" }, // sincerity or emotion
        { value: "hand_on_neck", label: "Hand on Neck" }, // thoughtful or bashful
      ],
      allowCustom: true,
    },
    {
      key: "voice_quality",
      label: "Voice quality (optional)",
      type: "enum",
      options: [
        { value: "soft", label: "Soft" }, // gentle, light volume
        { value: "raspy", label: "Raspy" }, // textured, gravelly edges
        { value: "warm", label: "Warm" }, // cozy, rounded tone
        { value: "bright", label: "Bright" }, // energetic, crisp resonance
        { value: "deadpan", label: "Deadpan" }, // flat, emotion-minimal delivery

        // NEW — crisp, character-defining voice qualities
        { value: "smooth", label: "Smooth" }, // silky, effortless flow
        { value: "airy", label: "Airy" }, // breathy, light airflow
        { value: "deep", label: "Deep" }, // low resonance, rich bass
        { value: "clear", label: "Clear" }, // articulated, precise diction
        { value: "gravelly", label: "Gravelly" }, // rough texture, more intense than raspy
        { value: "monotone", label: "Monotone" }, // even pitch, minimal variation
        { value: "melodic", label: "Melodic" }, // musical rise/fall to speech
        { value: "nasal", label: "Nasal" }, // resonance forward in the nose
        { value: "breathy", label: "Breathy" }, // audible breath on consonants/vowels
        { value: "crisp", label: "Crisp" }, // sharp consonants, tight delivery
        { value: "rounded", label: "Rounded" }, // soft edges, mellow articulation
        { value: "gruff", label: "Gruff" }, // rough, firm, gravelly + low
        { value: "light", label: "Light" }, // gentle, upper-range delivery
      ],
      allowCustom: true,
    },
  ],
};


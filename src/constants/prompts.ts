/**
 * Centralized Prompts Configuration
 *
 * This file contains all prompts, placeholders, and examples used across AI features.
 * Edit this file to customize the AI behavior and user experience.
 */

// ============================================================================
// IMAGE GENERATION
// ============================================================================

export const IMAGE_PROMPTS = {
  /**
   * Placeholder text shown in the prompt input field
   */
  placeholder: "Describe the image you want to create...",

  /**
   * Default negative prompt to improve image quality
   * Used to exclude unwanted elements from generated images
   */
  negativePrompt:
    "blurry, low quality, distorted, deformed, ugly, bad anatomy, watermark, signature, text, logo",

  /**
   * Example prompts users can select from
   * These help users understand what kind of prompts work well
   */
  examples: [
    {
      title: "Portrait",
      prompt:
        "A professional portrait photo of a person with soft natural lighting, shallow depth of field, warm tones",
    },
    {
      title: "Landscape",
      prompt:
        "A breathtaking mountain landscape at golden hour with dramatic clouds and a serene lake reflection",
    },
    {
      title: "Abstract Art",
      prompt:
        "Abstract digital art with vibrant colors, geometric shapes, and flowing gradients, modern design",
    },
    {
      title: "Product Shot",
      prompt:
        "Professional product photography on a clean white background with soft shadows and studio lighting",
    },
    {
      title: "Fantasy",
      prompt:
        "A magical fantasy forest with glowing mushrooms, fairy lights, mystical atmosphere, ethereal lighting",
    },
    {
      title: "Minimalist",
      prompt:
        "Minimalist design with clean lines, negative space, simple geometric shapes, modern aesthetic",
    },
  ],

  /**
   * Style modifiers that can be appended to prompts
   */
  styleModifiers: [
    { label: "Photorealistic", value: ", photorealistic, 8k, highly detailed" },
    {
      label: "Artistic",
      value: ", artistic, painterly, expressive brushstrokes",
    },
    { label: "Cinematic", value: ", cinematic lighting, film grain, dramatic" },
    { label: "Anime", value: ", anime style, vibrant colors, detailed" },
    {
      label: "3D Render",
      value: ", 3d render, octane render, highly detailed",
    },
    { label: "Vintage", value: ", vintage aesthetic, retro, film photography" },
  ],
};

// ============================================================================
// VIDEO GENERATION
// ============================================================================

export const VIDEO_PROMPTS = {
  /**
   * Placeholder text shown in the prompt input field
   */
  placeholder: "Describe the video you want to create...",

  /**
   * Example prompts for video generation
   */
  examples: [
    {
      title: "Nature",
      prompt:
        "A serene forest scene with sunlight filtering through the trees, gentle breeze moving the leaves",
    },
    {
      title: "Ocean",
      prompt:
        "Waves gently crashing on a sandy beach at sunset, warm golden light reflecting on the water",
    },
    {
      title: "City",
      prompt: "Time-lapse of a bustling city street at night with car lights creating light trails",
    },
    {
      title: "Abstract",
      prompt:
        "Colorful liquid paint swirling and mixing together in slow motion, mesmerizing patterns",
    },
    {
      title: "Space",
      prompt:
        "A journey through space passing colorful nebulas and distant galaxies, cinematic camera movement",
    },
    {
      title: "Underwater",
      prompt: "Crystal clear underwater scene with tropical fish swimming around a coral reef",
    },
  ],

  /**
   * Motion modifiers that can enhance video prompts
   */
  motionModifiers: [
    { label: "Slow Motion", value: ", slow motion, smooth" },
    { label: "Time-lapse", value: ", time-lapse, accelerated" },
    { label: "Cinematic", value: ", cinematic camera movement, professional" },
    { label: "Steady", value: ", steady shot, stable camera" },
    { label: "Dynamic", value: ", dynamic movement, action" },
  ],
};

// ============================================================================
// TEXT TO SPEECH
// ============================================================================

export const SPEECH_PROMPTS = {
  /**
   * Placeholder text shown in the text input field
   */
  placeholder: "Enter the text you want to convert to speech...",

  /**
   * Example texts users can try
   */
  examples: [
    {
      title: "Greeting",
      text: "Hello! Welcome to our application. We're excited to have you here.",
    },
    {
      title: "Announcement",
      text: "Attention please. This is an important announcement for all users.",
    },
    {
      title: "Story Opening",
      text: "Once upon a time, in a land far, far away, there lived a curious young explorer.",
    },
    {
      title: "Instructions",
      text: "To get started, simply tap the button below and follow the on-screen instructions.",
    },
    {
      title: "Quote",
      text: "The only way to do great work is to love what you do. - Steve Jobs",
    },
    {
      title: "Podcast Intro",
      text: "Welcome back to another episode! Today we're diving deep into an exciting topic.",
    },
  ],
};

// ============================================================================
// AUDIO TRANSCRIPTION
// ============================================================================

export const TRANSCRIPTION_PROMPTS = {
  /**
   * Language options for transcription
   * Using ISO 639-1 language codes
   */
  languages: [
    { label: "Auto-detect", value: undefined },
    { label: "English", value: "en" },
    { label: "Spanish", value: "es" },
    { label: "French", value: "fr" },
    { label: "German", value: "de" },
    { label: "Italian", value: "it" },
    { label: "Portuguese", value: "pt" },
    { label: "Dutch", value: "nl" },
    { label: "Polish", value: "pl" },
    { label: "Japanese", value: "ja" },
    { label: "Chinese", value: "zh" },
    { label: "Korean", value: "ko" },
    { label: "Arabic", value: "ar" },
    { label: "Hindi", value: "hi" },
    { label: "Russian", value: "ru" },
  ],

  /**
   * Supported audio formats
   */
  supportedFormats: ["mp3", "mp4", "mpeg", "mpga", "m4a", "wav", "webm", "flac", "ogg"],

  /**
   * Maximum file size in MB
   */
  maxFileSizeMB: 25,
};

// ============================================================================
// IMAGE ANALYSIS / VISION
// ============================================================================

export const VISION_PROMPTS = {
  /**
   * Default prompt for general image analysis
   */
  defaultAnalysis:
    "Analyze this image in detail. Describe what you see, identify any objects, people, text, or notable features. Provide a comprehensive description.",

  /**
   * Prompt for object identification
   */
  objectIdentification:
    "Identify and list all objects, items, and entities visible in this image. For each item, provide a brief description and approximate location in the image.",

  /**
   * Prompt for text extraction (OCR)
   */
  textExtraction:
    "Extract and transcribe all visible text from this image. Maintain the original formatting and structure as much as possible. If no text is visible, indicate that.",

  /**
   * Prompt for accessibility descriptions
   */
  accessibilityDescription:
    "Provide a detailed, accessible description of this image suitable for someone who cannot see it. Include information about the scene, subjects, colors, mood, and any important details.",

  /**
   * Custom analysis prompts users can select from
   */
  analysisOptions: [
    {
      id: "general",
      label: "General Analysis",
      prompt:
        "Analyze this image in detail. Describe what you see, identify any objects, people, text, or notable features. Provide a comprehensive description.",
    },
    {
      id: "objects",
      label: "Identify Objects",
      prompt:
        "Identify and list all objects, items, and entities visible in this image. For each item, provide a brief description and approximate location in the image.",
    },
    {
      id: "text",
      label: "Extract Text (OCR)",
      prompt:
        "Extract and transcribe all visible text from this image. Maintain the original formatting and structure as much as possible. If no text is visible, indicate that.",
    },
    {
      id: "accessibility",
      label: "Accessibility Description",
      prompt:
        "Provide a detailed, accessible description of this image suitable for someone who cannot see it. Include information about the scene, subjects, colors, mood, and any important details.",
    },
    {
      id: "mood",
      label: "Mood & Atmosphere",
      prompt:
        "Describe the mood, atmosphere, and emotional tone of this image. What feelings does it evoke? What visual elements contribute to this mood?",
    },
    {
      id: "technical",
      label: "Technical Analysis",
      prompt:
        "Analyze the technical aspects of this image: composition, lighting, color palette, perspective, and any notable photographic or artistic techniques used.",
    },
    {
      id: "compare",
      label: "Detailed Breakdown",
      prompt:
        "Provide a structured breakdown of this image including: 1) Main subject, 2) Background elements, 3) Colors used, 4) Lighting conditions, 5) Overall composition, 6) Any text or symbols present.",
    },
  ],

  /**
   * Placeholder for custom prompt input
   */
  customPromptPlaceholder: "Enter your custom question about this image...",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a random example prompt for a given feature
 */
export const getRandomExample = (
  feature: "image" | "video" | "speech"
): { title: string; prompt?: string; text?: string } => {
  const examples =
    feature === "image"
      ? IMAGE_PROMPTS.examples
      : feature === "video"
        ? VIDEO_PROMPTS.examples
        : SPEECH_PROMPTS.examples;

  return examples[Math.floor(Math.random() * examples.length)];
};

/**
 * Enhance a prompt with a style modifier
 */
export const enhanceImagePrompt = (prompt: string, styleIndex: number): string => {
  const style = IMAGE_PROMPTS.styleModifiers[styleIndex];
  return style ? prompt + style.value : prompt;
};

/**
 * Enhance a video prompt with a motion modifier
 */
export const enhanceVideoPrompt = (prompt: string, motionIndex: number): string => {
  const motion = VIDEO_PROMPTS.motionModifiers[motionIndex];
  return motion ? prompt + motion.value : prompt;
};

/**
 * Get vision prompt by analysis type
 */
export const getVisionPrompt = (analysisId: string): string => {
  const option = VISION_PROMPTS.analysisOptions.find((opt) => opt.id === analysisId);
  return option?.prompt || VISION_PROMPTS.defaultAnalysis;
};

// ============================================================================
// PROMPT TEMPLATES
// ============================================================================

/**
 * Templates that can be filled with user input
 * Use {{variable}} syntax for replaceable parts
 */
export const PROMPT_TEMPLATES = {
  image: {
    productShot:
      "Professional product photography of {{product}} on a {{background}} background with studio lighting",
    portrait: "A {{style}} portrait of {{subject}} with {{lighting}} lighting",
    landscape: "A {{mood}} {{location}} landscape at {{timeOfDay}}",
    logo: "A modern {{style}} logo design for {{company}}, clean and professional",
  },
  video: {
    transition: "Smooth transition from {{sceneA}} to {{sceneB}} with {{effect}} effect",
    timelapse: "Time-lapse of {{subject}} over {{duration}}, showing {{change}}",
  },
};

/**
 * Fill a template with provided values
 */
export const fillTemplate = (template: string, values: Record<string, string>): string => {
  let result = template;
  Object.entries(values).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
  });
  return result;
};

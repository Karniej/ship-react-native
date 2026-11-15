import { apiCall } from "@/constants/api";

export type ElevenLabsVoice =
  | "rachel"
  | "drew"
  | "clyde"
  | "paul"
  | "domi"
  | "dave"
  | "fin"
  | "sarah"
  | "antoni"
  | "thomas"
  | "charlie"
  | "george"
  | "emily"
  | "elli"
  | "callum"
  | "patrick"
  | "harry"
  | "liam"
  | "dorothy"
  | "josh"
  | "arnold"
  | "charlotte"
  | "matilda"
  | "matthew"
  | "james"
  | "joseph"
  | "jeremy"
  | "michael"
  | "ethan"
  | "gigi"
  | "freya"
  | "grace"
  | "daniel"
  | "serena"
  | "adam"
  | "nicole"
  | "jessie"
  | "ryan"
  | "sam"
  | "glinda"
  | "giovanni"
  | "mimi"
  | string;

export interface TextToSpeechOptions {
  voice?: ElevenLabsVoice;
  model_id?: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  output_format?:
    | "mp3_44100_128"
    | "mp3_22050_32"
    | "pcm_16000"
    | "pcm_22050"
    | "pcm_24000"
    | "pcm_44100";
}

export interface TextToSpeechResult {
  success: boolean;
  url?: string;
  audio_base64?: string;
  content_type?: string;
  voice?: string;
  model?: string;
  error?: string;
}

export const AVAILABLE_VOICES: {
  id: ElevenLabsVoice;
  name: string;
  gender: "male" | "female";
}[] = [
  { id: "rachel", name: "Rachel", gender: "female" },
  { id: "drew", name: "Drew", gender: "male" },
  { id: "clyde", name: "Clyde", gender: "male" },
  { id: "paul", name: "Paul", gender: "male" },
  { id: "domi", name: "Domi", gender: "female" },
  { id: "dave", name: "Dave", gender: "male" },
  { id: "fin", name: "Fin", gender: "male" },
  { id: "sarah", name: "Sarah", gender: "female" },
  { id: "antoni", name: "Antoni", gender: "male" },
  { id: "thomas", name: "Thomas", gender: "male" },
  { id: "charlie", name: "Charlie", gender: "male" },
  { id: "george", name: "George", gender: "male" },
  { id: "emily", name: "Emily", gender: "female" },
  { id: "elli", name: "Elli", gender: "female" },
  { id: "callum", name: "Callum", gender: "male" },
  { id: "charlotte", name: "Charlotte", gender: "female" },
  { id: "matilda", name: "Matilda", gender: "female" },
  { id: "matthew", name: "Matthew", gender: "male" },
  { id: "james", name: "James", gender: "male" },
  { id: "adam", name: "Adam", gender: "male" },
  { id: "nicole", name: "Nicole", gender: "female" },
];

export const elevenlabsService = {
  async textToSpeech(text: string, options: TextToSpeechOptions = {}): Promise<TextToSpeechResult> {
    try {
      const response = await apiCall("text-to-speech", {
        method: "POST",
        body: JSON.stringify({
          text,
          voice: options.voice || "rachel",
          model_id: options.model_id || "eleven_multilingual_v2",
          voice_settings: options.voice_settings || {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0,
            use_speaker_boost: true,
          },
          output_format: options.output_format || "mp3_44100_128",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Text-to-speech failed");
      }

      return data as TextToSpeechResult;
    } catch (error) {
      console.error("ElevenLabs textToSpeech error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate speech",
      };
    }
  },

  getAvailableVoices() {
    return AVAILABLE_VOICES;
  },

  getVoicesByGender(gender: "male" | "female") {
    return AVAILABLE_VOICES.filter((v) => v.gender === gender);
  },
};

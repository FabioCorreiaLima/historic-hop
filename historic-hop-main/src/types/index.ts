export type ActivityType = "quiz" | "chronological" | "true_false" | "fill_blank" | "matching";

export interface BaseActivity {
  id: string;
  type: ActivityType;
  level: number;
  period: string;
  topic: string;
  difficulty: string;
}

export interface QuizActivity extends BaseActivity {
  type: "quiz";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  videoUrl?: string | null;
  mediaType?: "text" | "image" | "audio" | "video";
}

export interface ChronologicalActivity extends BaseActivity {
  type: "chronological";
  instruction: string;
  events: { text: string; year: number }[];
  explanation: string;
}

export interface TrueFalseActivity extends BaseActivity {
  type: "true_false";
  statement: string;
  isTrue: boolean;
  explanation: string;
}

export interface FillBlankActivity extends BaseActivity {
  type: "fill_blank";
  textWithBlanks: string; // use __BLANK__ as placeholder
  blanks: string[]; // correct answers in order
  options: string[]; // shuffled options including distractors
  explanation: string;
}

export interface MatchingActivity extends BaseActivity {
  type: "matching";
  instruction: string;
  pairs: { left: string; right: string }[];
  explanation: string;
  imageUrl?: string | null;
}

export type Activity = QuizActivity | ChronologicalActivity | TrueFalseActivity | FillBlankActivity | MatchingActivity;

export interface HistoricalPeriod {
  id: string;
  name: string;
  emoji: string;
  years: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  characterName: string;
  characterEmoji: string;
  image_url?: string | null;
  imageUrl?: string | null;
}

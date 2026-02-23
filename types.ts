export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ASSESSMENT = 'ASSESSMENT',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE'
}

export enum IntentType {
  DIET = 'Diet',
  SLEEP = 'Sleep',
  STRESS = 'Stress',
  ACTIVITY = 'Activity',
  SYMPTOM = 'Symptom',
  GENERAL = 'General',
  UNKNOWN = 'Processing...'
}

export enum SentimentType {
  POSITIVE = 'Positive',
  NEUTRAL = 'Neutral',
  NEGATIVE = 'Negative/Stressed'
}

export interface User {
  name: string;
  email: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  metadata?: {
    intent?: IntentType;
    sentiment?: SentimentType;
    confidence?: number;
  };
}

export interface HealthMetrics {
  sleepScore: number;
  stressScore: number;
  dietScore: number;
  activityScore: number;
  overallScore: number;
  lastUpdated: Date;
}

export interface AssessmentAnswers {
  sleepHours: number;
  stressLevel: number; // 1-10
  fruitsVeggies: number; // servings
  exerciseMinutes: number;
  energyLevel: number; // 1-10
}
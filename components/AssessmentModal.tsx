import React, { useState } from 'react';
import { AssessmentAnswers, HealthMetrics } from '../types';
import { X, ChevronRight, Activity, Moon, Apple, Zap } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (metrics: HealthMetrics) => void;
}

const AssessmentModal: React.FC<Props> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>({
    sleepHours: 7,
    stressLevel: 5,
    fruitsVeggies: 3,
    exerciseMinutes: 30,
    energyLevel: 5
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      calculateAndSubmit();
    }
  };

  const calculateAndSubmit = () => {
    // Simple Rule-Based Logic (as per Blueprint)
    // Normalize everything to 0-100 scale

    const sleepScore = Math.min(100, (answers.sleepHours / 8) * 100);
    const stressScore = Math.max(0, 100 - (answers.stressLevel * 10)); // Lower stress is better
    const dietScore = Math.min(100, (answers.fruitsVeggies / 5) * 100);
    const activityScore = Math.min(100, (answers.exerciseMinutes / 60) * 100);

    const overall = (sleepScore + stressScore + dietScore + activityScore) / 4;

    const metrics: HealthMetrics = {
      sleepScore: Math.round(sleepScore),
      stressScore: Math.round(stressScore),
      dietScore: Math.round(dietScore),
      activityScore: Math.round(activityScore),
      overallScore: Math.round(overall),
      lastUpdated: new Date()
    };

    onComplete(metrics);
    onClose();
    setStep(0); // Reset for next time
  };

  const steps = [
    {
      title: "Sleep Habits",
      icon: <Moon className="w-6 h-6 text-indigo-500" />,
      description: "How many hours do you sleep on average?",
      input: (
        <div className="flex flex-col gap-4">
          <input 
            type="range" min="0" max="12" step="0.5" 
            value={answers.sleepHours} 
            onChange={(e) => setAnswers({...answers, sleepHours: parseFloat(e.target.value)})}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="text-center text-2xl font-bold text-indigo-600 dark:text-indigo-400">{answers.sleepHours} Hours</div>
        </div>
      )
    },
    {
      title: "Stress Levels",
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      description: "How stressed do you feel lately? (1=Low, 10=High)",
      input: (
        <div className="flex flex-col gap-4">
          <input 
            type="range" min="1" max="10" 
            value={answers.stressLevel} 
            onChange={(e) => setAnswers({...answers, stressLevel: parseInt(e.target.value)})}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-600"
          />
          <div className="text-center text-2xl font-bold text-yellow-600 dark:text-yellow-400">{answers.stressLevel}/10</div>
        </div>
      )
    },
    {
      title: "Diet & Nutrition",
      icon: <Apple className="w-6 h-6 text-green-500" />,
      description: "Daily servings of fruits & vegetables?",
      input: (
        <div className="flex flex-col gap-4">
          <input 
            type="range" min="0" max="10" 
            value={answers.fruitsVeggies} 
            onChange={(e) => setAnswers({...answers, fruitsVeggies: parseInt(e.target.value)})}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <div className="text-center text-2xl font-bold text-green-600 dark:text-green-400">{answers.fruitsVeggies} Servings</div>
        </div>
      )
    },
    {
      title: "Physical Activity",
      icon: <Activity className="w-6 h-6 text-red-500" />,
      description: "Minutes of exercise per day?",
      input: (
        <div className="flex flex-col gap-4">
          <input 
            type="range" min="0" max="120" step="5"
            value={answers.exerciseMinutes} 
            onChange={(e) => setAnswers({...answers, exerciseMinutes: parseInt(e.target.value)})}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
          <div className="text-center text-2xl font-bold text-red-600 dark:text-red-400">{answers.exerciseMinutes} Mins</div>
        </div>
      )
    },
    {
      title: "General Energy",
      icon: <Zap className="w-6 h-6 text-orange-500" />,
      description: "How energetic do you feel today? (1=Low, 10=High)",
      input: (
        <div className="flex flex-col gap-4">
          <input 
            type="range" min="1" max="10" 
            value={answers.energyLevel} 
            onChange={(e) => setAnswers({...answers, energyLevel: parseInt(e.target.value)})}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
          />
          <div className="text-center text-2xl font-bold text-orange-600 dark:text-orange-400">{answers.energyLevel}/10</div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-colors">
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" /> Health Assessment
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>Step {step + 1} of {steps.length}</span>
              <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="bg-gray-50 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              {steps[step].icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{steps[step].title}</h3>
            <p className="text-gray-500 dark:text-gray-400">{steps[step].description}</p>
          </div>

          <div className="mb-8">
            {steps[step].input}
          </div>

          <button 
            onClick={handleNext}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95"
          >
            {step === steps.length - 1 ? 'Finish Assessment' : 'Next Step'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentModal;
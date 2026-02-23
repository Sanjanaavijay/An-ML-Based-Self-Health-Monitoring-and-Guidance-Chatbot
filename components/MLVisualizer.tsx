import React from 'react';
import { IntentType, SentimentType } from '../types';
import { Brain, FileText, CheckCircle } from 'lucide-react';

interface Props {
  isProcessing: boolean;
  lastAnalysis?: {
    intent: IntentType;
    sentiment: SentimentType;
    confidence: number;
  };
}

const MLVisualizer: React.FC<Props> = ({ isProcessing, lastAnalysis }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-4 h-full flex flex-col transition-colors duration-200">
      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Brain className="w-4 h-4" /> ML Inference Engine
      </h3>

      <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {/* Step 1: Input Processing */}
        <div className={`flex items-start gap-3 transition-opacity duration-300 ${isProcessing ? 'opacity-100' : 'opacity-50'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isProcessing ? 'bg-blue-100 text-blue-600 animate-pulse dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'}`}>
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Tokenization</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Cleaning & Vectorization (TF-IDF)</div>
          </div>
        </div>

        {/* Arrow */}
        <div className="pl-3.5">
          <div className="h-4 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* Step 2: Classification */}
        <div className={`flex items-start gap-3 transition-opacity duration-300 ${isProcessing || lastAnalysis ? 'opacity-100' : 'opacity-50'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isProcessing ? 'bg-purple-100 text-purple-600 animate-spin dark:bg-purple-900/30 dark:text-purple-400' : (lastAnalysis ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600')}`}>
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Classification</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Intent & Sentiment Analysis</div>
          </div>
        </div>

        {/* Arrow */}
        <div className="pl-3.5">
          <div className="h-4 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* Step 3: Result */}
        <div className={`flex items-start gap-3 transition-all duration-500 ${lastAnalysis && !isProcessing ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-2'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${lastAnalysis ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'}`}>
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="w-full">
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Inference Result</div>
            {lastAnalysis && !isProcessing && (
              <div className="mt-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 border border-gray-100 dark:border-gray-700 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Intent:</span>
                  <span className="font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-1.5 py-0.5 rounded">{lastAnalysis.intent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Sentiment:</span>
                  <span className={`font-semibold px-1.5 py-0.5 rounded ${
                    lastAnalysis.sentiment === SentimentType.NEGATIVE ? 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400' :
                    lastAnalysis.sentiment === SentimentType.POSITIVE ? 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400' :
                    'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {lastAnalysis.sentiment}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Confidence:</span>
                  <span className="font-mono text-gray-700 dark:text-gray-300">{(lastAnalysis.confidence * 100).toFixed(1)}%</span>
                </div>
                
                {/* Confidence Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                   <div 
                    className="bg-green-500 h-1 rounded-full" 
                    style={{ width: `${lastAnalysis.confidence * 100}%`}}
                   ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLVisualizer;
import React from 'react';
import { X, Download, Share2, Activity, Moon, Zap, Apple, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { HealthMetrics, User } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  metrics: HealthMetrics;
  user: User | null;
}

const HealthReportModal: React.FC<Props> = ({ isOpen, onClose, metrics, user }) => {
  if (!isOpen) return null;

  // Prepare data for Radar Chart
  const radarData = [
    { subject: 'Sleep', A: metrics.sleepScore, fullMark: 100 },
    { subject: 'Diet', A: metrics.dietScore, fullMark: 100 },
    { subject: 'Activity', A: metrics.activityScore, fullMark: 100 },
    { subject: 'Stress Mgt', A: metrics.stressScore, fullMark: 100 },
  ];

  const getGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  };

  const getFeedback = (metricName: string, score: number) => {
    if (score >= 80) return { status: 'Excellent', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, msg: `Your ${metricName} is optimal.` };
    if (score >= 50) return { status: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: TrendingUp, msg: `Room for improvement in ${metricName}.` };
    return { status: 'Action Needed', color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle, msg: `Critical: Improve your ${metricName}.` };
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm print:bg-white print:p-0">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col print:shadow-none print:w-full print:h-full print:max-w-none print:rounded-none">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10 print:static">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
               <Activity className="w-6 h-6" />
             </div>
             <div>
               <h2 className="text-xl font-bold text-gray-900 dark:text-white">Health Analysis Report</h2>
               <p className="text-sm text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
             </div>
          </div>
          <div className="flex gap-2 print:hidden">
            <button onClick={handlePrint} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition" title="Print Report">
              <Download className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-8 print:p-0">
          
          {/* User Summary */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
                <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                  Health Score: {metrics.overallScore}/100
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
                {getGrade(metrics.overallScore)}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Overall Grade</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 text-center">Wellness Balance</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="User"
                      dataKey="A"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      fill="#0ea5e9"
                      fillOpacity={0.5}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Detailed Breakdown</h4>
               
               {[
                 { label: 'Sleep Quality', score: metrics.sleepScore, icon: Moon, color: 'text-indigo-500' },
                 { label: 'Stress Management', score: metrics.stressScore, icon: Zap, color: 'text-amber-500' },
                 { label: 'Diet & Nutrition', score: metrics.dietScore, icon: Apple, color: 'text-green-500' },
                 { label: 'Physical Activity', score: metrics.activityScore, icon: Activity, color: 'text-red-500' },
               ].map((item, idx) => {
                 const feedback = getFeedback(item.label, item.score);
                 const FeedbackIcon = feedback.icon;
                 
                 return (
                   <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start gap-4">
                     <div className={`p-3 rounded-full bg-gray-50 dark:bg-gray-700 ${item.color}`}>
                       <item.icon className="w-5 h-5" />
                     </div>
                     <div className="flex-1">
                       <div className="flex justify-between items-center mb-1">
                         <h5 className="font-semibold text-gray-900 dark:text-white">{item.label}</h5>
                         <span className={`text-sm font-bold ${feedback.color}`}>{item.score}%</span>
                       </div>
                       <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mb-2">
                         <div className={`h-1.5 rounded-full transition-all duration-500 ${
                           item.score >= 80 ? 'bg-green-500' : item.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                         }`} style={{ width: `${item.score}%` }}></div>
                       </div>
                       <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                         <FeedbackIcon className={`w-3 h-3 ${feedback.color}`} />
                         {feedback.msg}
                       </p>
                     </div>
                   </div>
                 );
               })}
            </div>
          </div>

          {/* AI Recommendations (Mocked/Static based on logic) */}
          <div className="bg-primary-50 dark:bg-primary-900/10 rounded-xl p-6 border border-primary-100 dark:border-primary-900/20">
            <h3 className="text-lg font-bold text-primary-800 dark:text-primary-300 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" /> Recommended Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {metrics.sleepScore < 70 && (
                 <div className="flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                   <Moon className="w-5 h-5 text-indigo-500 shrink-0" />
                   <p className="text-sm text-gray-700 dark:text-gray-300">Stick to a consistent sleep schedule. Avoid screens 1 hour before bed.</p>
                 </div>
               )}
               {metrics.stressScore < 70 && (
                 <div className="flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                   <Zap className="w-5 h-5 text-amber-500 shrink-0" />
                   <p className="text-sm text-gray-700 dark:text-gray-300">Practice 4-7-8 breathing exercises daily. Take short breaks during work.</p>
                 </div>
               )}
               {metrics.dietScore < 70 && (
                 <div className="flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                   <Apple className="w-5 h-5 text-green-500 shrink-0" />
                   <p className="text-sm text-gray-700 dark:text-gray-300">Increase water intake and add one fruit portion to your breakfast.</p>
                 </div>
               )}
               {metrics.activityScore < 70 && (
                 <div className="flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                   <Activity className="w-5 h-5 text-red-500 shrink-0" />
                   <p className="text-sm text-gray-700 dark:text-gray-300">Aim for at least 20 minutes of brisk walking today.</p>
                 </div>
               )}
               {metrics.overallScore >= 80 && (
                 <div className="flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm col-span-full">
                   <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                   <p className="text-sm text-gray-700 dark:text-gray-300">You are doing great! Maintain your current routine and listen to your body.</p>
                 </div>
               )}
            </div>
          </div>
          
          <div className="mt-8 text-center print:hidden">
            <p className="text-xs text-gray-400">
              This report is generated based on your self-reported data. It is not a medical diagnosis.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HealthReportModal;
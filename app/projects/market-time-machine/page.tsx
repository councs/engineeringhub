'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, RefreshCw, BarChart2 } from 'lucide-react';
import scenariosData from '../../data/scenarios.json';
import ChartDisplay from '@/components/market-time-machine/ChartDisplay';
import NewsFeed from '@/components/market-time-machine/NewsFeed';
import GameControls from '@/components/market-time-machine/GameControls';
import RevealModal from '@/components/market-time-machine/RevealModal';

interface Scenario {
  id: string;
  actualCompany: string;
  actualTicker: string;
  obfuscatedName: string;
  dateRangeText: string;
  eventSummary: string;
  historicalData: { day: number; price: number }[];
  futureData: { day: number; price: number }[];
  headlines: string[];
}

const scenarios = scenariosData as Scenario[];

export default function MarketTimeMachine() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<'UP' | 'DOWN' | null>(null);
  const [correctGuesses, setCorrectGuesses] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Hydration safety: ensure client-only runs for localStorage
  useEffect(() => {
    setIsClient(true);
    const storedScore = localStorage.getItem('mtm_score');
    const storedStreak = localStorage.getItem('mtm_streak');
    const storedHighScore = localStorage.getItem('mtm_highScore');
    
    if (storedScore) setScore(parseInt(storedScore, 10));
    if (storedStreak) setStreak(parseInt(storedStreak, 10));
    if (storedHighScore) setHighScore(parseInt(storedHighScore, 10));
  }, []);

  const scenario = scenarios[currentIdx];

  // Calculate return details
  const startPrice = scenario ? scenario.historicalData[scenario.historicalData.length - 1].price : 0;
  const endPrice = scenario ? scenario.futureData[scenario.futureData.length - 1].price : 0;
  const percentChange = startPrice ? ((endPrice - startPrice) / startPrice) * 100 : 0;
  const actualOutcome: 'UP' | 'DOWN' = percentChange > 0 ? 'UP' : 'DOWN';

  const isCorrect = currentPrediction === actualOutcome;

  const handlePredict = (prediction: 'UP' | 'DOWN') => {
    setCurrentPrediction(prediction);
    setHasGuessed(true);

    const isPredictionCorrect = prediction === actualOutcome;
    let nextScore = score;
    let nextStreak = streak;
    let nextHighScore = highScore;

    if (isPredictionCorrect) {
      setCorrectGuesses((prev) => prev + 1);
      nextScore += 100 + (streak * 10); // Bonus points for streak
      nextStreak += 1;
      if (nextStreak > nextHighScore) {
        nextHighScore = nextStreak;
      }
    } else {
      nextStreak = 0;
    }

    setScore(nextScore);
    setStreak(nextStreak);
    setHighScore(nextHighScore);

    localStorage.setItem('mtm_score', nextScore.toString());
    localStorage.setItem('mtm_streak', nextStreak.toString());
    localStorage.setItem('mtm_highScore', nextHighScore.toString());
  };

  const handleNextScenario = () => {
    setHasGuessed(false);
    setCurrentPrediction(null);
    if (currentIdx === scenarios.length - 1) {
      setIsGameOver(true);
    } else {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handleResetGame = () => {
    setScore(0);
    setStreak(0);
    setCorrectGuesses(0);
    setIsGameOver(false);
    setHasGuessed(false);
    setCurrentPrediction(null);
    setCurrentIdx(0);
    localStorage.setItem('mtm_score', '0');
    localStorage.setItem('mtm_streak', '0');
  };

  // Grade computing helper
  const getGradeInfo = () => {
    const ratio = correctGuesses / scenarios.length;
    if (ratio === 1.0) {
      return {
        grade: 'S-Tier: Market Prophet',
        icon: '🔮',
        color: 'text-purple-400 border-purple-500/30 bg-purple-500/5',
        desc: 'You see the future. Wall Street firms are calling your phone.',
      };
    } else if (ratio >= 0.75) {
      return {
        grade: 'A-Tier: Hedge Fund Titan',
        icon: '💼',
        color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
        desc: 'Outstanding analytical instinct. You beat the index with ease.',
      };
    } else if (ratio >= 0.55) {
      return {
        grade: 'B-Tier: Day Trader',
        icon: '📈',
        color: 'text-blue-400 border-blue-500/30 bg-blue-500/5',
        desc: 'Solid performance. You are profitable but watch out for volatility.',
      };
    } else if (ratio >= 0.35) {
      return {
        grade: 'C-Tier: Index Fund HODLer',
        icon: '🏦',
        color: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
        desc: 'Passive investing is probably your best bet. Keep holding.',
      };
    } else {
      return {
        grade: 'D-Tier: Bag Holder',
        icon: '🎒',
        color: 'text-rose-400 border-rose-500/30 bg-rose-500/5',
        desc: 'Buy high, sell low. Better luck next time!',
      };
    }
  };

  const gradeInfo = getGradeInfo();

  if (!isClient) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400">CONNECTING TO BLOOMBERG CORE...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Bloomberg Terminal Header */}
      <header className="bg-slate-900/40 backdrop-blur border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-500" />
              <h1 className="text-base md:text-lg font-black text-slate-100 uppercase tracking-wider font-mono">
                MarketTimeMachine
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase font-mono hidden sm:block">
              Anonymized Stock Macro Event Simulator
            </p>
          </div>
        </div>

        {/* Global actions */}
        <button
          onClick={handleResetGame}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900 text-xs font-mono text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Scores</span>
        </button>
      </header>

      {/* Main Terminal Layout */}
      <div className="flex-1 p-6 max-w-[1400px] w-full mx-auto flex flex-col justify-center gap-6">
        
        {isGameOver ? (
          /* Game Over / Summary Dashboard Screen */
          <div className="max-w-xl w-full mx-auto bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-fade-in space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
            
            <div className="text-center space-y-2">
              <span className="text-[10px] font-mono text-slate-500 font-extrabold uppercase tracking-widest bg-slate-950 border border-slate-850 px-3 py-1 rounded-full">
                Simulation Finished
              </span>
              <h2 className="text-3xl font-black tracking-tight text-slate-100 mt-3">
                Your Trading Report Card
              </h2>
            </div>

            {/* Earned Grade Badge */}
            <div className={`border rounded-2xl p-6 text-center space-y-3 ${gradeInfo.color}`}>
              <span className="text-5xl block">{gradeInfo.icon}</span>
              <h3 className="text-xl font-black uppercase tracking-wide">
                {gradeInfo.grade}
              </h3>
              <p className="text-slate-300 text-xs font-medium max-w-sm mx-auto leading-relaxed">
                {gradeInfo.desc}
              </p>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                  Win Rate
                </span>
                <span className="text-2xl font-black text-slate-100 font-mono mt-1">
                  {correctGuesses} / {scenarios.length}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold font-mono mt-0.5">
                  {((correctGuesses / scenarios.length) * 100).toFixed(0)}% Accuracy
                </span>
              </div>

              <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                  Total Profit
                </span>
                <span className="text-2xl font-black text-slate-100 font-mono mt-1">
                  {score}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold font-mono mt-0.5">
                  Simulated Credits
                </span>
              </div>
            </div>

            {/* Call to action */}
            <button
              onClick={handleResetGame}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 hover:bg-blue-500 text-slate-100 font-extrabold text-sm rounded-xl tracking-wider uppercase transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-blue-600/10 cursor-pointer animate-pulse"
            >
              <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
              Restart Simulation
            </button>
          </div>
        ) : (
          /* Core Game Arena */
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Chart View (Spans 8/12) */}
              <div className="lg:col-span-8">
                <ChartDisplay
                  historicalData={scenario.historicalData}
                  futureData={scenario.futureData}
                  reveal={hasGuessed}
                  netUp={percentChange > 0}
                />
              </div>

              {/* Headlines Card Feed (Spans 4/12) */}
              <div className="lg:col-span-4">
                <NewsFeed
                  headlines={scenario.headlines}
                  obfuscatedName={scenario.obfuscatedName}
                  dateRangeText={scenario.dateRangeText}
                />
              </div>
            </div>

            {/* Controls Console or Reveal Modal */}
            <div className="w-full">
              {!hasGuessed ? (
                <GameControls
                  onPredict={handlePredict}
                  streak={streak}
                  highScore={highScore}
                  score={score}
                  hasGuessed={hasGuessed}
                  currentPrediction={currentPrediction}
                />
              ) : (
                <RevealModal
                  companyName={scenario.actualCompany}
                  ticker={scenario.actualTicker}
                  dateRangeText={scenario.dateRangeText}
                  eventSummary={scenario.eventSummary}
                  percentChange={percentChange}
                  isCorrect={isCorrect}
                  onNext={handleNextScenario}
                  onReset={handleResetGame}
                />
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

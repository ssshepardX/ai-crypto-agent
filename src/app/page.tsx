"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity, Zap, ShieldAlert } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- TİPLER ---
type CoinSignal = {
  id: number;
  coin: string;
  price: number;
  change_24h: number;
  ai_score: number;
  ai_sentiment: "bullish" | "bearish" | "neutral";
  ai_comment: string;
  timestamp: string;
};

// --- MOCK DATA ---
const MOCK_DATA: CoinSignal[] = [
  {
    id: 1,
    coin: "SOL",
    price: 145.20,
    change_24h: 5.4,
    ai_score: 88,
    ai_sentiment: "bullish",
    ai_comment: "Ağ aktivitesi ATH seviyesinde. RSI 30 altından güçlü tepki verdi. Kısa vadeli $155 hedefli momentum var.",
    timestamp: "15 min ago"
  },
  {
    id: 2,
    coin: "PEPE",
    price: 0.0000084,
    change_24h: -2.1,
    ai_score: 65,
    ai_sentiment: "neutral",
    ai_comment: "Hacim düşüyor ancak balina cüzdanlarında birikim var. 0.0000080 desteği kırılmadığı sürece izlenmeli.",
    timestamp: "20 min ago"
  },
  {
    id: 3,
    coin: "ETH",
    price: 3350.00,
    change_24h: -0.5,
    ai_score: 42,
    ai_sentiment: "bearish",
    ai_comment: "ETF haberleri fiyatlandı. Teknik göstergeler yorgunluk sinyali veriyor. $3200 seviyesine düzeltme ihtimali yüksek.",
    timestamp: "45 min ago"
  }
];

// --- SKOR BAR COMPONENT ---
function ScoreBar({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 75) return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
    if (s >= 40) return "bg-yellow-500";
    return "bg-rose-500";
  };

  return (
    <div className="w-full bg-zinc-800 h-2 rounded-full mt-2 overflow-hidden">
      <div 
        className={twMerge("h-full rounded-full transition-all duration-500", getColor(score))} 
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

// --- ANA COMPONENT ---
export default function Dashboard() {
  const [signals, setSignals] = useState<CoinSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const { data, error } = await (await import('@/lib/supabaseClient')).supabase
          .from('signals')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);
        
        if (error) {
          console.error('Supabase error:', error);
          return;
        }
        
        if (data) {
          const formattedData = data.map((item: any) => ({
            id: item.id,
            coin: item.coin,
            price: item.price,
            change_24h: item.change_24h || 0,
            ai_score: item.ai_score,
            ai_sentiment: item.ai_sentiment,
            ai_comment: item.ai_comment,
            timestamp: new Date(item.created_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })
          }));
          setSignals(formattedData);
        }
      } catch (err) {
        console.error('Error fetching signals:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSignals();
    
    // Optional: Poll for new data every 5 minutes
    const interval = setInterval(fetchSignals, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-zinc-100 p-6 md:p-12 font-sans selection:bg-emerald-500/30">
      {/* HEADER */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-white" fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            AI <span className="text-zinc-500">Trader Agent</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium animate-pulse">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          Live Analysis
        </div>
      </header>

      {/* HERO / INTRO */}
      <div className="max-w-6xl mx-auto mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
          Piyasa Fırsatları
        </h2>
        <p className="text-zinc-400 max-w-xl">
          Yapay zeka motorumuz 12.000+ coini taradı, filtrelerden geçirdi ve 
          en yüksek potansiyele sahip olanları sizin için yorumladı.
        </p>
      </div>

      {/* GRID LAYOUT */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading Skeleton
          [1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-surface rounded-xl border border-zinc-800 animate-pulse" />
          ))
        ) : (
          signals.map((signal) => (
            <div 
              key={signal.id} 
              className="group relative bg-surface rounded-xl border border-zinc-800 hover:border-zinc-600 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/10 overflow-hidden flex flex-col"
            >
              {/* Glow Effect for High Score */}
              {signal.ai_score > 80 && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] -mr-10 -mt-10 rounded-full pointer-events-none" />
              )}

              {/* Card Header */}
              <div className="p-6 pb-4 flex justify-between items-start border-b border-zinc-800/50">
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-wide">{signal.coin}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-zinc-400 text-sm">${signal.price.toLocaleString()}</span>
                    <span className={clsx("text-xs font-bold px-1.5 py-0.5 rounded", 
                      signal.change_24h >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                    )}>
                      {signal.change_24h > 0 ? "+" : ""}{signal.change_24h}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500 mb-1">AI Score</div>
                  <div className={clsx("text-2xl font-black", 
                    signal.ai_score > 70 ? "text-emerald-400" : signal.ai_score < 40 ? "text-rose-400" : "text-yellow-400"
                  )}>
                    {signal.ai_score}
                  </div>
                </div>
              </div>

              {/* AI Analysis Body */}
              <div className="p-6 pt-4 flex-grow flex flex-col">
                <ScoreBar score={signal.ai_score} />
                
                <div className="mt-4 flex items-center gap-2 mb-3">
                   {signal.ai_sentiment === 'bullish' ? (
                     <TrendingUp size={16} className="text-emerald-400" />
                   ) : signal.ai_sentiment === 'bearish' ? (
                     <TrendingDown size={16} className="text-rose-400" />
                   ) : (
                     <Activity size={16} className="text-yellow-400" />
                   )}
                   <span className="text-sm font-medium text-zinc-300 uppercase tracking-wider">
                     {signal.ai_sentiment}
                   </span>
                </div>

                <p className="text-sm text-zinc-400 leading-relaxed flex-grow">
                  {signal.ai_comment}
                </p>
                
                <div className="mt-4 pt-4 border-t border-zinc-800/50 flex justify-between items-center text-xs text-zinc-600">
                   <span>Updated {signal.timestamp}</span>
                   <div className="flex items-center gap-1">
                     <ShieldAlert size={12} />
                     NFA
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

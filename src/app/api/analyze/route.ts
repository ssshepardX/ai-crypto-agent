import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

interface CoinData {
  symbol: string;
  price: number;
  volume_24h: number;
  rsi_14: number;
  ma_200: number;
  recent_news: string;
}

interface AnalysisResult {
  coin: string;
  price: number;
  change_24h: number;
  ai_score: number;
  ai_sentiment: 'bullish' | 'bearish' | 'neutral';
  ai_comment: string;
}

function fetchMockData(): CoinData[] {
  return [
    {
      symbol: 'BTC',
      price: 64000,
      volume_24h: 50000000,
      rsi_14: 75,
      ma_200: 60000,
      recent_news: 'ETF girişleri yavaşladı.',
    },
    {
      symbol: 'ETH',
      price: 3400,
      volume_24h: 20000000,
      rsi_14: 60,
      ma_200: 3000,
      recent_news: 'Vitalik yeni güncelleme paylaştı.',
    },
    {
      symbol: 'SOL',
      price: 145,
      volume_24h: 5000000,
      rsi_14: 25,
      ma_200: 150,
      recent_news: 'Ağ tıkanıklığı çözüldü, hız arttı.',
    },
    {
      symbol: 'PEPE',
      price: 0.000008,
      volume_24h: 2000000,
      rsi_14: 28,
      ma_200: 0.000009,
      recent_news: 'Balinalar yüklü alım yapıyor.',
    },
    {
      symbol: 'ARB',
      price: 1.1,
      volume_24h: 500000,
      rsi_14: 45,
      ma_200: 1.0,
      recent_news: 'Proje roadmap güncelledi.',
    },
    {
      symbol: 'DOGE',
      price: 0.15,
      volume_24h: 1000000,
      rsi_14: 80,
      ma_200: 0.1,
      recent_news: 'Elon Musk tweet attı.',
    },
  ];
}

function applyFilters(coins: CoinData[]): CoinData[] {
  return coins.filter(
    (coin) => coin.volume_24h > 1000000 && coin.rsi_14 < 30
  );
}

async function getAIAdvice(coin: CoinData): Promise<{
  sentiment: string;
  analysis: string;
  score: number;
}> {
  const prompt = `
    Sen uzman bir kripto para trader'ısın. Aşağıdaki verileri kullanarak kısa, vurucu bir analiz yap.
    
    COIN: ${coin.symbol}
    FİYAT: $${coin.price}
    TEKNİK GÖSTERGELER:
    - RSI (14): ${coin.rsi_14}
    - MA (200): ${coin.ma_200}
    
    SON HABER: "${coin.recent_news}"
    
    Çıktıyı JSON formatında ver: { "sentiment": "bullish|bearish|neutral", "analysis": "string", "score": 0-100 }
  `;

  try {
    const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('AI Error:', error);
    return {
      sentiment: 'neutral',
      analysis: 'Analiz yapılamadı',
      score: 0,
    };
  }
}

export async function GET() {
  try {
    // Fetch market data
    const marketData = fetchMockData();

    // Apply filters
    const targetCoins = applyFilters(marketData);

    if (targetCoins.length === 0) {
      return NextResponse.json({
        status: 'success',
        message: 'No coins matched criteria',
        signals: [],
      });
    }

    const results: AnalysisResult[] = [];

    // Analyze each coin
    for (const coin of targetCoins) {
      const analysis = await getAIAdvice(coin);

      const result: AnalysisResult = {
        coin: coin.symbol,
        price: coin.price,
        change_24h: 0,
        ai_score: analysis.score,
        ai_sentiment: analysis.sentiment.toLowerCase() as
          | 'bullish'
          | 'bearish'
          | 'neutral',
        ai_comment: analysis.analysis,
      };

      results.push(result);
    }

    // Save to Supabase
    if (results.length > 0) {
      const { error } = await supabase
        .from('signals')
        .insert(results);

      if (error) {
        console.error('Supabase error:', error);
      }
    }

    return NextResponse.json({
      status: 'success',
      signals_count: results.length,
      signals: results,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

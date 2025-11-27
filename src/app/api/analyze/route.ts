import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data for now
    const mockResults = [
      {
        coin: 'SOL',
        price: 145.20,
        change_24h: 5.4,
        ai_score: 88,
        ai_sentiment: 'bullish',
        ai_comment: 'Ağ aktivitesi yüksek, RSI aşırı satım bölgesinden çıktı.',
      },
      {
        coin: 'PEPE',
        price: 0.0000084,
        change_24h: -2.1,
        ai_score: 65,
        ai_sentiment: 'neutral',
        ai_comment: 'Hacim düşüyor ancak balina birikim görülüyor.',
      },
    ];

    return NextResponse.json({
      status: 'success',
      signals_count: mockResults.length,
      signals: mockResults,
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

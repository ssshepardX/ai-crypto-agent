"""
API endpoint to trigger backend analysis
Deploy to: Vercel Serverless Function
"""
import os
import json
import pandas as pd
import google.generativeai as genai
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime

load_dotenv()

_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=_api_key)
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

def fetch_market_data():
    """Mock market data - replace with real API later"""
    data = {
        "symbol": ["BTC", "ETH", "SOL", "PEPE", "ARB", "DOGE"],
        "price": [64000, 3400, 145, 0.000008, 1.10, 0.15],
        "volume_24h": [50000000, 20000000, 5000000, 2000000, 500000, 1000000],
        "rsi_14": [75, 60, 25, 28, 45, 80],
        "ma_200": [60000, 3000, 150, 0.000009, 1.00, 0.10],
        "recent_news": [
            "ETF girişleri yavaşladı.",
            "Vitalik yeni güncelleme paylaştı.",
            "Ağ tıkanıklığı çözüldü, hız arttı.",
            "Balinalar yüklü alım yapıyor.",
            "Proje roadmap güncelledi.",
            "Elon Musk tweet attı."
        ]
    }
    return pd.DataFrame(data)

def apply_filters(df):
    """Filter coins by volume and RSI"""
    df = df[df['volume_24h'] > 1000000]
    return df[df['rsi_14'] < 30].copy()

def get_ai_advice(coin_data):
    """Get AI analysis from Gemini"""
    symbol = coin_data['symbol']
    
    prompt = f"""
    Sen uzman bir kripto para trader'ısın. Aşağıdaki verileri kullanarak kısa, vurucu bir analiz yap.
    
    COIN: {symbol}
    FİYAT: ${coin_data['price']}
    TEKNİK GÖSTERGELER:
    - RSI (14): {coin_data['rsi_14']}
    - MA (200): {coin_data['ma_200']}
    
    SON HABER: "{coin_data['recent_news']}"
    
    Çıktıyı JSON formatında ver: {{ "sentiment": "", "analysis": "", "score": 0 }}
    """
    
    try:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={"response_mime_type": "application/json"}
        )
        response = model.generate_content(prompt)
        return (response.text or "").strip()
    except Exception as e:
        return f"Error: {str(e)}"

def handler(request):
    """Main handler - suitable for Vercel Functions"""
    try:
        # Get market data
        market_df = fetch_market_data()
        
        # Apply filters
        target_coins = apply_filters(market_df)
        
        if target_coins.empty:
            return {
                "status": "success",
                "message": "No coins matched criteria",
                "signals": []
            }
        
        results = []
        
        # Analyze each coin
        for index, row in target_coins.iterrows():
            ai_analysis = get_ai_advice(row)
            cleaned_json = ai_analysis.replace("```json", "").replace("```", "")
            
            try:
                analysis_dict = json.loads(cleaned_json)
            except json.JSONDecodeError:
                continue
            
            result_packet = {
                "coin": row['symbol'],
                "price": float(row['price']),
                "change_24h": 0.0,
                "ai_score": analysis_dict.get('score', 0),
                "ai_sentiment": analysis_dict.get('sentiment', 'neutral').lower(),
                "ai_comment": analysis_dict.get('analysis', ''),
            }
            results.append(result_packet)
        
        # Save to Supabase
        if results:
            response = supabase.table("signals").insert(results).execute()
        
        return {
            "status": "success",
            "signals_count": len(results),
            "signals": results
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

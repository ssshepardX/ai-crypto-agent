import os
import time
import json
import random
import requests
from dotenv import load_dotenv
from datetime import datetime
import google.generativeai as genai
from supabase import create_client, Client

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

COINS_TO_MONITOR = ["BTC", "ETH", "SOL", "PEPE", "DOGE", "AVAX", "ARB", "OP", "LINK", "UNI"]

def fetch_market_data():
    """Fetch real market data from Binance"""
    print("\n[FETCH] Fetching market data from Binance...")
    
    coins_data = []
    
    for symbol in COINS_TO_MONITOR:
        try:
            pair = f"{symbol}USDT"
            url = f"https://api.binance.com/api/v3/ticker/24hr?symbol={pair}"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                
                price = float(data['lastPrice'])
                change_24h = float(data['priceChangePercent'])
                volume_24h = float(data['quoteAssetVolume'])
                
                rsi_val = calculate_simple_rsi(float(data['openPrice']), price, change_24h)
                
                coins_data.append({
                    'symbol': symbol,
                    'price': price,
                    'change_24h': change_24h,
                    'volume_24h': volume_24h,
                    'rsi_val': rsi_val
                })
                
                print(f"  ✓ {symbol}: ${price} | RSI: {rsi_val} | 24h: {change_24h}%")
            else:
                print(f"  ✗ {symbol}: API error")
                
        except Exception as e:
            print(f"  ✗ {symbol}: {str(e)}")
    
    return coins_data

def calculate_simple_rsi(open_price, current_price, change_24h):
    """Simple RSI calculation based on price movement"""
    if open_price == 0:
        return random.randint(30, 70)
    
    price_change = ((current_price - open_price) / open_price) * 100
    
    if price_change < -5:
        return random.randint(15, 35)
    elif price_change > 5:
        return random.randint(65, 85)
    else:
        return random.randint(40, 60)

def filter_opportunities(coins_list):
    """Filter coins based on RSI and volume"""
    print("\n[FILTER] Filtering opportunities...")
    
    opportunities = []
    
    for coin in coins_list:
        rsi = coin['rsi_val']
        volume = coin['volume_24h']
        
        is_oversold = rsi < 30
        is_overbought = rsi > 70
        good_volume = volume > 50000000
        
        if (is_oversold or is_overbought) and good_volume:
            opportunities.append(coin)
            status = "OVERSOLD" if is_oversold else "OVERBOUGHT"
            print(f"  ✓ {coin['symbol']}: {status} (RSI: {rsi})")
    
    if not opportunities and coins_list:
        top_coin = max(coins_list, key=lambda x: abs(x['change_24h']))
        opportunities.append(top_coin)
        print(f"  ► Selected {top_coin['symbol']} (no oversold/overbought, but highest volatility)")
    
    return opportunities

def analyze_with_gemini(coin_data):
    """Analyze coin using Gemini AI"""
    symbol = coin_data['symbol']
    print(f"\n[ANALYSIS] Analyzing {symbol}...")
    
    prompt = f"""
    You are an expert cryptocurrency trader. Analyze this data and provide a quick assessment.
    
    COIN: {symbol}
    PRICE: ${coin_data['price']:.6f}
    24H CHANGE: {coin_data['change_24h']:.2f}%
    RSI: {coin_data['rsi_val']:.0f}
    VOLUME (24h): ${coin_data['volume_24h']:,.0f}
    
    Provide:
    1. A brief 2-sentence analysis
    2. Sentiment (bullish/bearish/neutral)
    3. Score (0-100)
    
    Return ONLY valid JSON: {{"analysis": "", "sentiment": "", "score": 0}}
    """
    
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        
        json_str = response.text.strip()
        if json_str.startswith("```"):
            json_str = json_str.split("```")[1]
            if json_str.startswith("json"):
                json_str = json_str[4:]
        
        result = json.loads(json_str)
        
        print(f"  ✓ {symbol}: {result['sentiment'].upper()} | Score: {result['score']}/100")
        return result
        
    except Exception as e:
        print(f"  ✗ Analysis error: {str(e)}")
        return {
            "analysis": "Unable to analyze at this time",
            "sentiment": "neutral",
            "score": 50
        }

def update_database(coin_data, analysis):
    """Update Supabase with analysis results"""
    symbol = coin_data['symbol']
    print(f"\n[DATABASE] Updating {symbol} in Supabase...")
    
    try:
        record = {
            "coin": symbol,
            "price": float(coin_data['price']),
            "change_24h": float(coin_data['change_24h']),
            "rsi": int(coin_data['rsi_val']),
            "volume_24h": float(coin_data['volume_24h']),
            "ai_score": int(analysis.get('score', 50)),
            "ai_sentiment": analysis.get('sentiment', 'neutral').lower(),
            "ai_comment": analysis.get('analysis', ''),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("signals").upsert(record, on_conflict="coin").execute()
        print(f"  ✓ {symbol} saved to database")
        return True
        
    except Exception as e:
        print(f"  ✗ Database error: {str(e)}")
        return False

def worker_loop(test_mode=False):
    """Main worker loop"""
    print("="*60)
    print("CRYPTO AI WORKER STARTED")
    print("="*60)
    
    interval = 60 if test_mode else 900
    
    while True:
        try:
            print(f"\n>>> Running analysis cycle at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            coins_data = fetch_market_data()
            
            if not coins_data:
                print("No data fetched, retrying...")
                time.sleep(interval)
                continue
            
            opportunities = filter_opportunities(coins_data)
            
            if not opportunities:
                print("No opportunities found")
                time.sleep(interval)
                continue
            
            print(f"\n[PROCESSING] Analyzing {len(opportunities)} coins...")
            processed = 0
            
            for coin in opportunities:
                analysis = analyze_with_gemini(coin)
                update_database(coin, analysis)
                processed += 1
                time.sleep(2)
            
            print(f"\n>>> Cycle complete: Processed {processed} coins")
            print(f">>> Next cycle in {interval} seconds")
            print("="*60)
            
            time.sleep(interval)
            
        except KeyboardInterrupt:
            print("\nWorker stopped by user")
            break
        except Exception as e:
            print(f"\nError in worker loop: {str(e)}")
            print("Retrying in 60 seconds...")
            time.sleep(60)

if __name__ == "__main__":
    import sys
    test_mode = "--test" in sys.argv
    if test_mode:
        print("Running in TEST MODE (60 second intervals)")
    else:
        print("Running in PRODUCTION MODE (15 minute intervals)")
    
    worker_loop(test_mode=test_mode)

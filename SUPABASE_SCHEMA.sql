-- Supabase Schema: AI Crypto Signals Table

CREATE TABLE signals (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  coin VARCHAR(20) NOT NULL,
  price DECIMAL(20, 10) NOT NULL,
  change_24h DECIMAL(8, 2) NOT NULL,
  ai_score INTEGER NOT NULL CHECK (ai_score >= 0 AND ai_score <= 100),
  ai_sentiment VARCHAR(10) NOT NULL CHECK (ai_sentiment IN ('bullish', 'bearish', 'neutral')),
  ai_comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_signals_coin ON signals(coin);
CREATE INDEX idx_signals_created_at ON signals(created_at DESC);
CREATE INDEX idx_signals_ai_score ON signals(ai_score DESC);

-- Enable Row Level Security (optional)
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;

-- Public read access (everyone can read)
CREATE POLICY "Allow public read" ON signals
  FOR SELECT USING (true);

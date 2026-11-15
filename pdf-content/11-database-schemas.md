# Appendix D: Database Schemas

Ready-to-use Supabase schemas for common app types.

---

## Base Schema (Required for All Apps)

### Profiles Table

```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Push Tokens Table

```sql
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tokens"
ON push_tokens FOR ALL
USING (auth.uid() = user_id);
```

---

## AI Generation App Schema

### Generations Table

```sql
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio', 'text')),
  prompt TEXT NOT NULL,
  result_url TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX idx_generations_type ON generations(type);

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generations"
ON generations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own generations"
ON generations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations"
ON generations FOR DELETE
USING (auth.uid() = user_id);
```

### User Credits Table

```sql
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER DEFAULT 5,
  lifetime_credits INTEGER DEFAULT 0,
  last_free_refresh TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits"
ON user_credits FOR SELECT
USING (auth.uid() = user_id);

-- Function to refresh daily free credits
CREATE OR REPLACE FUNCTION refresh_daily_credits()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_free_refresh::date < CURRENT_DATE THEN
    NEW.credits := GREATEST(NEW.credits, 5); -- Reset to at least 5
    NEW.last_free_refresh := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_credits_on_select
  BEFORE UPDATE ON user_credits
  FOR EACH ROW EXECUTE FUNCTION refresh_daily_credits();
```

### Favorites Table

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_id UUID REFERENCES generations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, generation_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites"
ON favorites FOR ALL
USING (auth.uid() = user_id);
```

---

## Habit Tracker Schema

### Habits Table

```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '✓',
  color TEXT DEFAULT '#7C3AED',
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'custom')),
  frequency_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6], -- 0=Sunday
  target_count INTEGER DEFAULT 1,
  reminder_time TIME,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_habits_user_id ON habits(user_id);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own habits"
ON habits FOR ALL
USING (auth.uid() = user_id);
```

### Habit Completions Table

```sql
CREATE TABLE habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, completed_date)
);

CREATE INDEX idx_completions_habit_date ON habit_completions(habit_id, completed_date);
CREATE INDEX idx_completions_user_date ON habit_completions(user_id, completed_date);

ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own completions"
ON habit_completions FOR ALL
USING (auth.uid() = user_id);
```

### Streaks View

```sql
CREATE OR REPLACE VIEW habit_streaks AS
WITH streak_data AS (
  SELECT
    habit_id,
    completed_date,
    completed_date - ROW_NUMBER() OVER (
      PARTITION BY habit_id
      ORDER BY completed_date
    )::integer AS streak_group
  FROM habit_completions
)
SELECT
  habit_id,
  MIN(completed_date) AS streak_start,
  MAX(completed_date) AS streak_end,
  COUNT(*) AS streak_length
FROM streak_data
GROUP BY habit_id, streak_group
ORDER BY habit_id, streak_start DESC;
```

---

## Expense Tracker Schema

### Categories Table

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📦',
  color TEXT DEFAULT '#6B7280',
  type TEXT DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own categories"
ON categories FOR ALL
USING (auth.uid() = user_id);

-- Insert default categories for new users
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (user_id, name, icon, color, type, is_default) VALUES
    (NEW.id, 'Food & Dining', '🍔', '#EF4444', 'expense', true),
    (NEW.id, 'Transportation', '🚗', '#3B82F6', 'expense', true),
    (NEW.id, 'Shopping', '🛍️', '#8B5CF6', 'expense', true),
    (NEW.id, 'Entertainment', '🎬', '#EC4899', 'expense', true),
    (NEW.id, 'Bills & Utilities', '💡', '#F59E0B', 'expense', true),
    (NEW.id, 'Health', '🏥', '#22C55E', 'expense', true),
    (NEW.id, 'Salary', '💰', '#22C55E', 'income', true),
    (NEW.id, 'Freelance', '💻', '#3B82F6', 'income', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_categories();
```

### Transactions Table

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  recurring BOOLEAN DEFAULT FALSE,
  recurring_interval TEXT CHECK (recurring_interval IN ('daily', 'weekly', 'monthly', 'yearly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions"
ON transactions FOR ALL
USING (auth.uid() = user_id);
```

### Budgets Table

```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  period TEXT DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL DEFAULT DATE_TRUNC('month', CURRENT_DATE),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id, period)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own budgets"
ON budgets FOR ALL
USING (auth.uid() = user_id);
```

### Monthly Summary View

```sql
CREATE OR REPLACE VIEW monthly_summary AS
SELECT
  user_id,
  DATE_TRUNC('month', date) AS month,
  type,
  category_id,
  SUM(amount) AS total,
  COUNT(*) AS transaction_count
FROM transactions
GROUP BY user_id, DATE_TRUNC('month', date), type, category_id;
```

---

## Social/Content App Schema

### Posts Table

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  image_url TEXT,
  video_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public posts"
ON posts FOR SELECT
USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can manage own posts"
ON posts FOR ALL
USING (auth.uid() = user_id);
```

### Likes Table

```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX idx_likes_post ON likes(post_id);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own likes"
ON likes FOR ALL
USING (auth.uid() = user_id);

-- Update likes count trigger
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_likes_count();
```

### Comments Table

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON comments(post_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments on public posts"
ON comments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM posts WHERE posts.id = post_id AND (posts.is_public = TRUE OR posts.user_id = auth.uid())
));

CREATE POLICY "Users can manage own comments"
ON comments FOR ALL
USING (auth.uid() = user_id);
```

### Follows Table

```sql
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows"
ON follows FOR SELECT
USING (TRUE);

CREATE POLICY "Users can manage own follows"
ON follows FOR ALL
USING (auth.uid() = follower_id);
```

---

## Useful Functions

### Get User Stats

```sql
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'followers_count', (SELECT COUNT(*) FROM follows WHERE following_id = user_uuid),
    'following_count', (SELECT COUNT(*) FROM follows WHERE follower_id = user_uuid),
    'posts_count', (SELECT COUNT(*) FROM posts WHERE user_id = user_uuid),
    'total_likes', (SELECT COALESCE(SUM(likes_count), 0) FROM posts WHERE user_id = user_uuid)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Soft Delete

```sql
-- Add deleted_at column for soft deletes
ALTER TABLE posts ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Update policy to exclude deleted
DROP POLICY "Anyone can view public posts" ON posts;
CREATE POLICY "Anyone can view public posts"
ON posts FOR SELECT
USING (
  deleted_at IS NULL
  AND (is_public = TRUE OR auth.uid() = user_id)
);

-- Soft delete function
CREATE OR REPLACE FUNCTION soft_delete_post(post_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE posts
  SET deleted_at = NOW()
  WHERE id = post_uuid AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Storage Buckets

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('generations', 'generations', true),
  ('posts', 'posts', true);

-- Avatar bucket policies
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Migration Tips

1. **Always test migrations** on a staging environment first
2. **Back up your database** before running migrations
3. **Use transactions** for complex migrations
4. **Check RLS policies** after schema changes
5. **Update TypeScript types** to match schema

```bash
# Generate TypeScript types from Supabase
supabase gen types typescript --project-id your-project-id > types/database.ts
```

---

**Official Docs:** [supabase.com/docs/guides/database](https://supabase.com/docs/guides/database)

#!/usr/bin/env node

/**
 * ============================================================================
 * DATABASE SEED SCRIPT
 * ============================================================================
 *
 * Seeds the Supabase database with sample data for development and testing.
 *
 * Usage:
 *   node scripts/seed.js
 *   npm run db:seed
 *
 * Requirements:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 *   - Supabase project with migrations applied
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// Configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing environment variables:");
  console.error("   - EXPO_PUBLIC_SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  console.error("\nPlease check your .env file.");
  process.exit(1);
}

// Create admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================================================
// SEED DATA
// ============================================================================

const TEST_USER = {
  email: "test@example.com",
  password: "testpassword123",
  name: "Test User",
};

const SAMPLE_GENERATIONS = [
  {
    type: "image",
    provider: "openai",
    model: "dall-e-3",
    prompt: "A futuristic city skyline at sunset with flying cars",
    url: "https://placehold.co/1024x1024/2563eb/ffffff?text=AI+Image+1",
    credits_used: 1,
  },
  {
    type: "image",
    provider: "replicate",
    model: "flux-schnell",
    prompt: "A serene Japanese zen garden with cherry blossoms",
    url: "https://placehold.co/1024x1024/ec4899/ffffff?text=AI+Image+2",
    credits_used: 1,
  },
  {
    type: "image",
    provider: "replicate",
    model: "sdxl",
    prompt: "Abstract digital art with geometric patterns",
    url: "https://placehold.co/1024x1024/8b5cf6/ffffff?text=AI+Image+3",
    credits_used: 1,
  },
  {
    type: "speech",
    provider: "elevenlabs",
    model: "eleven_multilingual_v2",
    prompt: "Welcome to our AI application. Let me show you around.",
    url: "https://example.com/audio/sample.mp3",
    credits_used: 1,
  },
  {
    type: "video",
    provider: "runway",
    model: "runway-gen3",
    prompt: "A timelapse of clouds moving over mountain peaks",
    url: "https://example.com/video/sample.mp4",
    credits_used: 5,
  },
];

const INITIAL_CREDITS = 50;

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function createTestUser() {
  console.log("📝 Creating test user...");

  // Check if user exists
  const { data: existingUsers } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", TEST_USER.email)
    .limit(1);

  if (existingUsers && existingUsers.length > 0) {
    console.log("   User already exists, skipping creation");
    return existingUsers[0].id;
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: TEST_USER.email,
    password: TEST_USER.password,
    email_confirm: true,
    user_metadata: {
      name: TEST_USER.name,
    },
  });

  if (authError) {
    throw new Error(`Failed to create user: ${authError.message}`);
  }

  console.log(`   ✓ Created user: ${TEST_USER.email}`);
  return authData.user.id;
}

async function seedProfile(userId) {
  console.log("📝 Seeding profile...");

  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    email: TEST_USER.email,
    name: TEST_USER.name,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${TEST_USER.name}`,
    updated_at: new Date().toISOString(),
  });

  if (error && !error.message.includes("duplicate")) {
    throw new Error(`Failed to seed profile: ${error.message}`);
  }

  console.log("   ✓ Profile seeded");
}

async function seedCredits(userId) {
  console.log("📝 Seeding credits...");

  const { error } = await supabase.from("user_credits").upsert({
    user_id: userId,
    credits_remaining: INITIAL_CREDITS,
    total_purchased: INITIAL_CREDITS,
    updated_at: new Date().toISOString(),
  });

  if (error && !error.message.includes("duplicate")) {
    throw new Error(`Failed to seed credits: ${error.message}`);
  }

  console.log(`   ✓ Added ${INITIAL_CREDITS} credits`);
}

async function seedGenerations(userId) {
  console.log("📝 Seeding sample generations...");

  const generations = SAMPLE_GENERATIONS.map((gen, index) => ({
    user_id: userId,
    ...gen,
    created_at: new Date(Date.now() - index * 3600000).toISOString(), // 1 hour apart
  }));

  const { error } = await supabase.from("generations").insert(generations);

  if (error) {
    throw new Error(`Failed to seed generations: ${error.message}`);
  }

  console.log(`   ✓ Added ${generations.length} sample generations`);
}

async function cleanDatabase() {
  console.log("🧹 Cleaning existing test data...");

  // Get test user
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", TEST_USER.email)
    .limit(1);

  if (profiles && profiles.length > 0) {
    const userId = profiles[0].id;

    // Delete generations
    await supabase.from("generations").delete().eq("user_id", userId);

    // Delete credits
    await supabase.from("user_credits").delete().eq("user_id", userId);

    // Delete profile
    await supabase.from("profiles").delete().eq("id", userId);

    // Delete auth user
    await supabase.auth.admin.deleteUser(userId);

    console.log("   ✓ Cleaned existing test data");
  } else {
    console.log("   No existing test data found");
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🌱 Database Seed Script                                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

  const args = process.argv.slice(2);
  const shouldClean = args.includes("--clean");

  try {
    if (shouldClean) {
      await cleanDatabase();
    }

    const userId = await createTestUser();
    await seedProfile(userId);
    await seedCredits(userId);
    await seedGenerations(userId);

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                     ✅ Seed Complete!                         ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║   Test Account:                                               ║
║   Email:    ${TEST_USER.email.padEnd(40)}║
║   Password: ${TEST_USER.password.padEnd(40)}║
║   Credits:  ${String(INITIAL_CREDITS).padEnd(40)}║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

You can now sign in with the test account to see sample data.
`);
  } catch (error) {
    console.error("\n❌ Seed failed:", error.message);
    process.exit(1);
  }
}

main();

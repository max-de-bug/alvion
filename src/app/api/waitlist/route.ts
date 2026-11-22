import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  sendWaitlistConfirmation,
  sendWaitlistUpgrade,
  fireAndForgetEmail,
} from "@/lib/email/emailService";

const DATA_DIR = path.resolve(process.cwd(), "data");
const WAITLIST_FILE = path.join(DATA_DIR, "waitlist.json");

export interface WaitlistEntry {
  address: string;
  email?: string;
  referralCode: string;
  referredBy?: string;
  referralsCount: number;
  xp: number;
  tier: "BRONZE" | "METAL" | "GOLD" | "PLATINUM" | "DIAMOND";
  quests: {
    walletConnected: boolean;
    signatureVerified: boolean;
    twitterFollowed: boolean;
    discordJoined: boolean;
    testnetTraded: boolean;
    peersInvited: boolean;
  };
  rank: number;
  joinedAt: number;
  passId: string;
}

interface WaitlistDb {
  totalCount: number;
  entries: Record<string, WaitlistEntry>;
}

function ensureDb(): WaitlistDb {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(WAITLIST_FILE)) {
    const initialDb: WaitlistDb = {
      totalCount: 48920,
      entries: {},
    };
    fs.writeFileSync(WAITLIST_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(WAITLIST_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return { totalCount: 48920, entries: {} };
  }
}

function saveDb(db: WaitlistDb) {
  try {
    fs.writeFileSync(WAITLIST_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error("Failed to save waitlist DB:", err);
  }
}

function calculateTier(xp: number, referrals: number): "BRONZE" | "METAL" | "GOLD" | "PLATINUM" | "DIAMOND" {
  if (referrals >= 10 || xp >= 5000) return "DIAMOND";
  if (referrals >= 5 || xp >= 3000) return "PLATINUM";
  if (referrals >= 2 || xp >= 1800) return "GOLD";
  if (referrals >= 1 || xp >= 800) return "METAL";
  return "BRONZE";
}

function generatePassId(address: string): string {
  const clean = address.replace(/^0x/, "").toUpperCase();
  const part = clean.slice(0, 4) + clean.slice(-4);
  return `ALV-${part}`;
}

function generateReferralCode(address: string): string {
  const clean = address.replace(/^0x/, "").toLowerCase();
  return clean.slice(0, 6);
}

// Generate Top 10 Community Leaderboard combining real users + institutional founders
function getTopLeaderboard(db: WaitlistDb) {
  const realUsers = Object.values(db.entries).map((u) => ({
    rank: u.rank,
    address: `${u.address.slice(0, 6)}...${u.address.slice(-4)}`,
    passId: u.passId,
    tier: u.tier,
    xp: u.xp,
    referrals: u.referralsCount,
    badge: u.tier === "DIAMOND" ? "Founder" : u.tier === "PLATINUM" ? "Institutional" : "VIP",
  }));

  const seedLeaderboard = [
    { rank: 1, address: "0x71C8...3875", passId: "ALV-71C83875", tier: "DIAMOND", xp: 14200, referrals: 28, badge: "Founder #1" },
    { rank: 2, address: "0x89A1...D491", passId: "ALV-89A1D491", tier: "DIAMOND", xp: 11800, referrals: 22, badge: "Alpha Whale" },
    { rank: 3, address: "0x34F9...E21C", passId: "ALV-34F9E21C", tier: "DIAMOND", xp: 9500, referrals: 18, badge: "NYSE Arca MM" },
    { rank: 4, address: "0xB201...99AF", passId: "ALV-B20199AF", tier: "PLATINUM", xp: 6200, referrals: 11, badge: "Robinhood Core" },
    { rank: 5, address: "0x981C...4031", passId: "ALV-981C4031", tier: "PLATINUM", xp: 5400, referrals: 9, badge: "Quant Lead" },
    { rank: 6, address: "0x442E...09B7", passId: "ALV-442E09B7", tier: "PLATINUM", xp: 4800, referrals: 8, badge: "Perp Pro" },
    { rank: 7, address: "0x127A...66D2", passId: "ALV-127A66D2", tier: "GOLD", xp: 2900, referrals: 4, badge: "VIP Trader" },
    { rank: 8, address: "0x889B...1410", passId: "ALV-889B1410", tier: "GOLD", xp: 2600, referrals: 4, badge: "VIP Trader" },
    { rank: 9, address: "0x5501...CC88", passId: "ALV-5501CC88", tier: "GOLD", xp: 2200, referrals: 3, badge: "Early Adopter" },
    { rank: 10, address: "0x00A1...5642", passId: "ALV-00A15642", tier: "GOLD", xp: 1950, referrals: 2, badge: "Early Adopter" },
  ];

  // Merge, sort by XP descending, and take top 10
  const combined = [...realUsers, ...seedLeaderboard]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  return combined;
}

export async function GET(req: NextRequest) {
  const db = ensureDb();
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address")?.toLowerCase();
  const emailParam = searchParams.get("email")?.toLowerCase().trim();

  const globalStats = {
    totalWaitlistMembers: db.totalCount + Object.keys(db.entries).length,
    diamondHoldersCount: 342,
    totalVolumeQueuedUsd: 142_850_000,
    currentPhase: "TESTNET_ALPHA_WAVE_1",
    guaranteedWave1SpotsLeft: 158,
  };

  const topLeaderboard = getTopLeaderboard(db);

  const recentActivity = [
    { text: "0x71C8...3875 unlocked DIAMOND FOUNDER PASS", time: "1m ago", type: "diamond" },
    { text: "0xA082...742D executed SPY testnet order on Robinhood Chain (+1,000 Credits)", time: "3m ago", type: "trade" },
    { text: "0x981C...4031 invited 3 traders -> Rank promoted to #5", time: "6m ago", type: "referral" },
    { text: "0x442E...09B7 verified EIP-712 signature (+500 Credits)", time: "9m ago", type: "verify" },
    { text: "0x127A...66D2 upgraded to GOLD PASS", time: "12m ago", type: "gold" },
  ];

  if (!address && !emailParam) {
    return NextResponse.json({
      success: true,
      stats: globalStats,
      leaderboard: topLeaderboard,
      recentActivity,
    });
  }

  let user: WaitlistEntry | null = null;
  if (address && db.entries[address]) {
    user = db.entries[address];
  } else if (emailParam) {
    user = Object.values(db.entries).find((u) => u.email?.toLowerCase() === emailParam) || null;
  }

  return NextResponse.json({
    success: true,
    exists: !!user,
    user: user || null,
    stats: globalStats,
    leaderboard: topLeaderboard,
    recentActivity,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, email, referredBy, questCompleted } = body;

    const trimmedEmail = email ? String(email).trim().toLowerCase() : undefined;
    if (!address && !trimmedEmail) {
      return NextResponse.json({ success: false, error: "Email or wallet address is required" }, { status: 400 });
    }

    if (trimmedEmail) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(trimmedEmail)) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid email address (e.g. name@domain.com)" },
          { status: 400 }
        );
      }
    }

    const db = ensureDb();

    // Check if user already exists by wallet or email
    let existingKey: string | null = null;
    if (address && db.entries[address.toLowerCase()]) {
      existingKey = address.toLowerCase();
    } else if (trimmedEmail) {
      const foundKey = Object.keys(db.entries).find(
        (key) => db.entries[key].email?.toLowerCase() === trimmedEmail
      );
      if (foundKey) existingKey = foundKey;
    }

    // Hash email deterministically if no wallet address provided
    const crypto = await import("crypto");
    const emailHash = trimmedEmail ? crypto.createHash("sha256").update(trimmedEmail).digest("hex") : "";
    const generatedAddr = "0x" + emailHash.slice(0, 40);

    const lookupKey = existingKey || (address ? address.toLowerCase() : generatedAddr);
    let user = db.entries[lookupKey];
    const isNew = !user;

    if (!user) {
      const passId = generatePassId(lookupKey);
      const referralCode = generateReferralCode(lookupKey);
      const userRank = db.totalCount + Object.keys(db.entries).length + 1;

      user = {
        address: lookupKey,
        email: trimmedEmail || undefined,
        referralCode,
        referredBy: referredBy ? referredBy.toLowerCase() : undefined,
        referralsCount: 0,
        xp: address ? 250 : 200,
        tier: "BRONZE",
        quests: {
          walletConnected: !!address,
          signatureVerified: false,
          twitterFollowed: false,
          discordJoined: false,
          testnetTraded: false,
          peersInvited: false,
        },
        rank: userRank,
        joinedAt: Date.now(),
        passId,
      };

      // Credit referrer if applicable
      if (referredBy && referredBy.toLowerCase() !== lookupKey) {
        const referrerCode = referredBy.toLowerCase();
        const referrer = Object.values(db.entries).find(
          (u) => u.referralCode.toLowerCase() === referrerCode || u.address.toLowerCase() === referrerCode
        );
        if (referrer) {
          const prevTier = referrer.tier;
          referrer.referralsCount += 1;
          referrer.xp += 500;
          if (referrer.referralsCount >= 3) {
            referrer.quests.peersInvited = true;
          }
          referrer.tier = calculateTier(referrer.xp, referrer.referralsCount);
          referrer.rank = Math.max(1, referrer.rank - 150);

          // If referrer has registered an email, dispatch upgrade notification
          if (referrer.email) {
            const origin = req.nextUrl?.origin || process.env.NEXT_PUBLIC_APP_URL || "https://alvion.fi";
            const refLink = `${origin}/waitlist?ref=${referrer.referralCode}`;
            fireAndForgetEmail(
              sendWaitlistUpgrade({
                email: referrer.email,
                passId: referrer.passId,
                rank: referrer.rank,
                tier: referrer.tier,
                newTier: referrer.tier,
                previousTier: prevTier,
                referralCode: referrer.referralCode,
                referralLink: refLink,
                xp: referrer.xp,
                referralsCount: referrer.referralsCount,
                ranksClimbed: 150,
                xpEarned: 500,
              })
            );
          }
        }
      }
    }

    if (trimmedEmail) {
      user.email = trimmedEmail;
    }

    if (questCompleted && questCompleted in user.quests) {
      const qKey = questCompleted as keyof typeof user.quests;
      if (!user.quests[qKey]) {
        user.quests[qKey] = true;
        let xpGained = 200;
        if (qKey === "signatureVerified") xpGained = 500;
        if (qKey === "testnetTraded") xpGained = 1000;
        if (qKey === "peersInvited") xpGained = 1500;
        user.xp += xpGained;
        user.rank = Math.max(1, user.rank - 100);
      }
    }

    user.tier = calculateTier(user.xp, user.referralsCount);
    db.entries[lookupKey] = user;
    saveDb(db);

    // Dispatch priority pass confirmation email on new sign-up or explicit resend
    if (trimmedEmail && (isNew || body.resendEmail)) {
      const origin = req.nextUrl?.origin || process.env.NEXT_PUBLIC_APP_URL || "https://alvion.fi";
      const refLink = `${origin}/waitlist?ref=${user.referralCode}`;
      fireAndForgetEmail(
        sendWaitlistConfirmation({
          email: trimmedEmail,
          passId: user.passId,
          rank: user.rank,
          tier: user.tier,
          referralCode: user.referralCode,
          referralLink: refLink,
          xp: user.xp,
        })
      );
    }

    return NextResponse.json({
      success: true,
      isNew,
      alreadyJoined: !isNew,
      user,
      stats: {
        totalWaitlistMembers: db.totalCount + Object.keys(db.entries).length,
        diamondHoldersCount: 342,
        totalVolumeQueuedUsd: 142_850_000,
        currentPhase: "TESTNET_ALPHA_WAVE_1",
        guaranteedWave1SpotsLeft: 158,
      },
      leaderboard: getTopLeaderboard(db),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to join waitlist" },
      { status: 500 }
    );
  }
}

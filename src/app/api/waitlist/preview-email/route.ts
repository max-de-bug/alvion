import { NextRequest, NextResponse } from "next/server";
import { renderWaitlistConfirmationEmail } from "@/lib/email/templates/waitlistConfirmationEmail";
import { renderWaitlistUpgradeEmail } from "@/lib/email/templates/waitlistUpgradeEmail";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "confirmation";
  const email = searchParams.get("email") || "investor@alvion.fi";
  const origin = req.nextUrl.origin || "http://localhost:3000";

  if (type === "upgrade") {
    const rendered = renderWaitlistUpgradeEmail({
      email,
      passId: "ALV-89A1D491",
      rank: 48,
      tier: "GOLD",
      newTier: "GOLD",
      previousTier: "METAL",
      referralCode: "89a1d4",
      referralLink: `${origin}/waitlist?ref=89a1d4`,
      xp: 2200,
      referralsCount: 3,
      ranksClimbed: 150,
      xpEarned: 500,
    });

    return new NextResponse(rendered.html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Default: confirmation pass
  const rendered = renderWaitlistConfirmationEmail({
    email,
    passId: "ALV-71C83875",
    rank: 48924,
    tier: "BRONZE",
    referralCode: "71c838",
    referralLink: `${origin}/waitlist?ref=71c838`,
    xp: 250,
  });

  return new NextResponse(rendered.html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}


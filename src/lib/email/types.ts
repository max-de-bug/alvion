export interface WaitlistEmailRecipient {
  email: string;
  passId: string;
  rank: number;
  tier: "BRONZE" | "METAL" | "GOLD" | "PLATINUM" | "DIAMOND";
  referralCode: string;
  referralLink: string;
  xp: number;
  credits?: number;
}

export interface WaitlistUpgradeNotification extends WaitlistEmailRecipient {
  previousTier?: string;
  newTier: "BRONZE" | "METAL" | "GOLD" | "PLATINUM" | "DIAMOND";
  referralsCount: number;
  ranksClimbed: number;
  xpEarned: number;
  creditsEarned?: number;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  provider: "resend" | "mock-log";
  error?: string;
}


import { Resend } from "resend";
import fs from "fs";
import path from "path";
import {
  WaitlistEmailRecipient,
  WaitlistUpgradeNotification,
  SendEmailResult,
} from "./types";
import { renderWaitlistConfirmationEmail } from "./templates/waitlistConfirmationEmail";
import { renderWaitlistUpgradeEmail } from "./templates/waitlistUpgradeEmail";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "Alvion Priority Pass <access@alvion.fi>";
const DATA_DIR = path.resolve(process.cwd(), "data");
const OUTBOUND_LOG_FILE = path.join(DATA_DIR, "outbound-emails.json");

let resendClient: Resend | null = null;
if (RESEND_API_KEY) {
  resendClient = new Resend(RESEND_API_KEY);
}

function logOutboundEmailLocally(entry: {
  to: string;
  subject: string;
  type: string;
  textSnippet: string;
  sentAt: string;
}) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    let existingLogs: unknown[] = [];
    if (fs.existsSync(OUTBOUND_LOG_FILE)) {
      try {
        existingLogs = JSON.parse(fs.readFileSync(OUTBOUND_LOG_FILE, "utf-8"));
      } catch {
        existingLogs = [];
      }
    }
    existingLogs.unshift(entry);
    if (existingLogs.length > 50) {
      existingLogs = existingLogs.slice(0, 50);
    }
    fs.writeFileSync(OUTBOUND_LOG_FILE, JSON.stringify(existingLogs, null, 2));
  } catch (err) {
    console.error("Failed to write to outbound email log file:", err);
  }
}

/**
 * Send Priority Pass Confirmation Email to a newly waitlisted user.
 */
export async function sendWaitlistConfirmation(
  recipient: WaitlistEmailRecipient
): Promise<SendEmailResult> {
  const { subject, html, text } = renderWaitlistConfirmationEmail(recipient);

  if (resendClient) {
    try {
      const res = await resendClient.emails.send({
        from: EMAIL_FROM,
        to: recipient.email,
        subject,
        html,
        text,
      });

      if (res.error) {
        console.error("Resend API error:", res.error);
        return {
          success: false,
          provider: "resend",
          error: res.error.message,
        };
      }

      console.log(`[EmailService] Sent confirmation to ${recipient.email} via Resend. ID: ${res.data?.id}`);
      return {
        success: true,
        messageId: res.data?.id,
        provider: "resend",
      };
    } catch (err) {
      console.error("[EmailService] Failed to send via Resend:", err);
      return {
        success: false,
        provider: "resend",
        error: err instanceof Error ? err.message : "Unknown send error",
      };
    }
  }

  // Development / Local Fallback Mock
  const logEntry = {
    to: recipient.email,
    subject,
    type: "waitlist_confirmation",
    textSnippet: text.slice(0, 200) + "...",
    sentAt: new Date().toISOString(),
  };

  logOutboundEmailLocally(logEntry);
  console.log(
    `[EmailService:DevMock] Priority pass email registered for ${recipient.email} (Rank #${recipient.rank}, ${recipient.tier} Tier, ${recipient.xp} Credits). Logged to data/outbound-emails.json`
  );

  return {
    success: true,
    provider: "mock-log",
  };
}

/**
 * Send Upgrade / Rank Advancement Notification Email to a referrer.
 */
export async function sendWaitlistUpgrade(
  notification: WaitlistUpgradeNotification
): Promise<SendEmailResult> {
  const { subject, html, text } = renderWaitlistUpgradeEmail(notification);

  if (resendClient) {
    try {
      const res = await resendClient.emails.send({
        from: EMAIL_FROM,
        to: notification.email,
        subject,
        html,
        text,
      });

      if (res.error) {
        console.error("Resend API error:", res.error);
        return {
          success: false,
          provider: "resend",
          error: res.error.message,
        };
      }

      console.log(`[EmailService] Sent upgrade notification to ${notification.email} via Resend.`);
      return {
        success: true,
        messageId: res.data?.id,
        provider: "resend",
      };
    } catch (err) {
      console.error("[EmailService] Failed to send upgrade via Resend:", err);
      return {
        success: false,
        provider: "resend",
        error: err instanceof Error ? err.message : "Unknown send error",
      };
    }
  }

  // Development / Local Fallback Mock
  const logEntry = {
    to: notification.email,
    subject,
    type: "waitlist_upgrade",
    textSnippet: text.slice(0, 200) + "...",
    sentAt: new Date().toISOString(),
  };

  logOutboundEmailLocally(logEntry);
  console.log(
    `[EmailService:DevMock] Upgrade email queued for ${notification.email} (New Rank #${notification.rank}, ${notification.newTier} Tier).`
  );

  return {
    success: true,
    provider: "mock-log",
  };
}

/**
 * Non-blocking fire-and-forget helper so email dispatch never delays HTTP API response
 */
export function fireAndForgetEmail(promise: Promise<SendEmailResult>) {
  promise.catch((err) => {
    console.error("[EmailService:AsyncError]", err);
  });
}


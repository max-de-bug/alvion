import { WaitlistUpgradeNotification } from "../types";

export function renderWaitlistUpgradeEmail(data: WaitlistUpgradeNotification): {
  subject: string;
  html: string;
  text: string;
} {
  const isTierUpgraded = !!data.previousTier && data.previousTier !== data.newTier;
  const subject = isTierUpgraded
    ? `Level Up! You Unlocked ${data.newTier} Tier (#${data.rank.toLocaleString()}) | Alvion`
    : `Rank Promoted: #${data.rank.toLocaleString()} (+${data.xpEarned} Credits) | Alvion`;

  const text = `
Priority Pass Upgraded - Alvion

Great news! Another trader joined using your invite link.

NEW TIER: ${data.newTier}
PROMOTED RANK: #${data.rank.toLocaleString()} (+${data.ranksClimbed} positions climbed)
CREDITS EARNED: +${data.xpEarned} Credits (Total: ${data.xp.toLocaleString()} Credits)
INVITED TRADERS: ${data.referralsCount}

Keep sharing to unlock the next allocation tier:
${data.referralLink}

Robinhood Chain L2 Settlement | Zero Spread | Zero Borrow Fee
© Alvion Solutions Limited
`.trim();

  const html = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <title>${subject}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; min-width: 100%; background-color: #DFE4DA; font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    @media only screen and (max-width: 600px) {
      .container-table { width: 100% !important; padding: 12px !important; }
      .stat-grid-col { display: block !important; width: 100% !important; margin-bottom: 10px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #DFE4DA; color: #26241D;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #DFE4DA; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 36px 12px 48px 12px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="580" class="container-table" style="max-width: 580px; width: 100%; margin: 0 auto;">
          
          <!-- Top Centered Brand Badge -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #23412E; border: 1px solid rgba(223, 228, 218, 0.35); border-radius: 0px; padding: 8px 18px;">
                    <span style="font-family: 'SF Mono', Menlo, monospace; font-size: 11px; font-weight: 600; color: #DFE4DA; letter-spacing: 0.05em; text-transform: uppercase;">
                      Alvion &middot; Allocation Upgrade
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Sanctuary Visual Card -->
          <tr>
            <td style="background-color: #07150E; border: 1px solid rgba(38, 36, 29, 0.18); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 48px -12px rgba(10, 22, 16, 0.45);">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                
                <!-- Celestial Glow & Tier Title -->
                <tr>
                  <td align="center" style="padding: 38px 24px 20px 24px; background: radial-gradient(circle at 50% 50%, #0D2318 0%, #07150E 75%);">
                    <!-- Concentric Circles & Bird Emblem -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="140" height="140" style="width: 140px; height: 140px; border-radius: 50%; border: 1.5px solid rgba(229, 192, 123, 0.4); background: radial-gradient(circle, rgba(229, 192, 123, 0.22) 0%, rgba(10, 22, 16, 0.95) 75%);">
                      <tr>
                        <td align="center" valign="middle">
                          <svg width="72" height="72" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
                            <path d="M23 21C26.5 14.5 32 9.5 40 7C36.8 12.8 34.5 18 29 22C26.5 23.8 24 23.5 23 21Z" fill="#E5C07B" />
                            <path d="M13 28C17 28 21.5 25.8 25.5 22.5C30.2 18.7 34.5 12.5 38 5C32.2 10.2 27 16.5 22.8 20.2C19.2 23.4 15.5 25 11 25.2C8.2 25.3 9 27.5 13 28Z" fill="#F4F7F2" />
                            <path d="M19 23.5C23 23 27 24.8 30.8 24.8C34.2 24.8 37.8 23.8 41 21.8C38.8 24.6 35.8 26.8 32.5 27.8C28.5 29 24.5 28.5 20 26.5C16.5 25 12.8 25.2 9.5 27C11.5 25 15 23.8 19 23.5Z" fill="#DFE4DA" opacity="0.9" />
                          </svg>
                        </td>
                      </tr>
                    </table>
                    
                    <div style="padding-top: 20px;">
                      <span style="display: inline-block; background-color: rgba(82, 183, 136, 0.2); border: 1px solid #52B788; border-radius: 0px; padding: 4px 14px; font-family: 'SF Mono', Menlo, monospace; font-size: 11px; font-weight: 700; color: #52B788; letter-spacing: 0.05em; text-transform: uppercase;">
                        +${data.xpEarned} Credits &middot; Rank Jumped
                      </span>
                      <h1 style="margin: 12px 0 0 0; font-family: 'Newsreader', Georgia, serif; font-size: 30px; font-weight: 400; color: #F4F7F2;">
                        ${isTierUpgraded ? `Unlocked ${data.newTier} Tier!` : "Your Rank Has Advanced!"}
                      </h1>
                      <p style="margin: 6px 0 0 0; font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 12px; color: rgba(223, 228, 218, 0.75);">
                        A trader registered via your referral link
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 24px 32px 36px 32px;">
                    
                    <!-- Stats Grid -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(35, 65, 46, 0.35); border: 1px solid rgba(223, 228, 218, 0.22); border-radius: 16px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 20px;">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td width="32%" class="stat-grid-col" style="background-color: rgba(10, 22, 16, 0.6); border: 1px solid rgba(223, 228, 218, 0.1); border-radius: 12px; padding: 12px 14px;">
                                <div style="font-family: 'SF Mono', Menlo, monospace; font-size: 10px; color: rgba(223, 228, 218, 0.55); text-transform: uppercase;">
                                  New Rank
                                </div>
                                <div style="font-family: 'SF Mono', Menlo, monospace; font-size: 18px; font-weight: 700; color: #E5C07B; margin-top: 3px;">
                                  #${data.rank.toLocaleString()}
                                </div>
                              </td>
                              <td width="2%">&nbsp;</td>
                              <td width="32%" class="stat-grid-col" style="background-color: rgba(10, 22, 16, 0.6); border: 1px solid rgba(223, 228, 218, 0.1); border-radius: 12px; padding: 12px 14px;">
                                <div style="font-family: 'SF Mono', Menlo, monospace; font-size: 10px; color: rgba(223, 228, 218, 0.55); text-transform: uppercase;">
                                  Tier
                                </div>
                                <div style="font-family: 'SF Mono', Menlo, monospace; font-size: 18px; font-weight: 700; color: #52B788; margin-top: 3px;">
                                  ${data.newTier}
                                </div>
                              </td>
                              <td width="2%">&nbsp;</td>
                              <td width="32%" class="stat-grid-col" style="background-color: rgba(10, 22, 16, 0.6); border: 1px solid rgba(223, 228, 218, 0.1); border-radius: 12px; padding: 12px 14px;">
                                <div style="font-family: 'SF Mono', Menlo, monospace; font-size: 10px; color: rgba(223, 228, 218, 0.55); text-transform: uppercase;">
                                  Total Credits
                                </div>
                                <div style="font-family: 'SF Mono', Menlo, monospace; font-size: 18px; font-weight: 700; color: #DFE4DA; margin-top: 3px;">
                                  ${data.xp.toLocaleString()}
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Protocol Privileges Ladder -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(10, 22, 16, 0.6); border: 1px solid rgba(223, 228, 218, 0.16); border-radius: 14px; margin-bottom: 24px; overflow: hidden;">
                      <tr>
                        <td style="padding: 14px 18px; border-bottom: 1px solid rgba(223, 228, 218, 0.08);">
                          <div style="font-family: 'Newsreader', Georgia, serif; font-size: 16px; color: #F4F7F2;">
                            Next Tier Milestones &amp; Unlocked Privileges
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 18px; font-size: 11px; font-family: 'Lato', sans-serif; line-height: 1.5; color: rgba(223, 228, 218, 0.88);">
                          <div style="padding: 4px 0;">&bull; <strong style="color: #E2E8F0;">Metal (1 invite)</strong>: 15% Maker Fee Rebates &middot; Fast-Lane Queue</div>
                          <div style="padding: 4px 0;">&bull; <strong style="color: #E5C07B;">Gold (2 invites)</strong>: 0% Borrow Fees on Synthetics (SPY/NVDA) &middot; Wave 1 Pass</div>
                          <div style="padding: 4px 0;">&bull; <strong style="color: #70D6FF;">Platinum (5 invites)</strong>: Sub-10ms Private Relayer Gateway &middot; Liquidation Shield</div>
                          <div style="padding: 4px 0;">&bull; <strong style="color: #52B788;">Diamond (10+ invites)</strong>: Lifetime Zero Spread &middot; Protocol Revenue Share Pool</div>
                        </td>
                      </tr>
                    </table>

                    <!-- Keep Inviting Button -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="padding-top: 8px; padding-bottom: 12px;">
                          <a href="${data.referralLink}" target="_blank" style="display: inline-block; background-color: #23412E; color: #DFE4DA; text-decoration: none; font-family: 'Lato', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 16px 36px; border-radius: 50px; border: 1px solid rgba(223, 228, 218, 0.3); box-shadow: 0 10px 24px -4px rgba(35, 65, 46, 0.6);">
                            Invite More &middot; Reach Diamond Tier
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Telemetry Footnote -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 24px; border-top: 1px solid rgba(223, 228, 218, 0.1); padding-top: 16px;">
                      <tr>
                        <td align="center" style="font-family: 'SF Mono', Menlo, monospace; font-size: 11px; color: rgba(223, 228, 218, 0.6);">
                          Robinhood Chain L2 Settlement &middot; Zero Spread &middot; Zero Borrow Fee
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer Information -->
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="margin: 0; font-size: 11px; color: rgba(38, 36, 29, 0.58);">
                &copy; Alvion Solutions Limited &middot; Robinhood Chain (0x4663...4663)
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html, text };
}


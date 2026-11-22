import { WaitlistEmailRecipient } from "../types";

export function renderWaitlistConfirmationEmail(data: WaitlistEmailRecipient): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Priority Pass Confirmed #${data.rank.toLocaleString()} | Alvion on Robinhood Chain`;

  const text = `
Priority Reservation Confirmed - Alvion

Your early access pass for Alvion on Robinhood Chain L2 has been minted.

PASS IDENTIFIER: ${data.passId}
WAITLIST RANK: #${data.rank.toLocaleString()}
TIER: ${data.tier}
TOTAL CREDITS: ${data.xp.toLocaleString()}

INVITE TRADERS & CLIMB RANKS:
Share your personal invite link:
${data.referralLink}

Tier Upgrades & Protocol Privileges:
- BRONZE · Scout (0 invites | 200 Credits):
  • Standard Testnet Queue Access
  • 1.0x Liquidity Vault Yield Multiplier
  • Real-Time CLOB WebSocket Market Data Feed

- METAL · Vanguard (1 invite | 800 Credits):
  • 15% Maker Fee Rebates on all synthetic orders
  • Fast-Lane Priority Testnet Queue
  • 1.25x Genesis Airdrop Multiplier

- GOLD · Sovereign (2 invites | 1,800 Credits):
  • 0% Borrow Fees on Synthetic Equities (SPY, TSLA, NVDA)
  • Guaranteed Wave 1 Genesis Access Pass
  • 1.5x Vault Yield Boost & Direct Relayer Access

- PLATINUM · Syndicate (5 invites | 3,000 Credits):
  • Sub-10ms Low-Latency Private Relayer Gateway
  • Zero Liquidation Penalty Grace Shield
  • Institutional Co-Vault MM Liquidity Allocation

- DIAMOND · Founder Council (10+ invites | 5,000+ Credits):
  • Lifetime Zero-Spread Execution Guarantee
  • Direct Revenue Share from Protocol Settlement Pool
  • 2.5x Genesis Token Allocation + Private Core Architect Access

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
  <meta name="supported-color-schemes" content="light dark" />
  <title>${subject}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; min-width: 100%; background-color: #DFE4DA; font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    
    @media only screen and (max-width: 600px) {
      .container-table { width: 100% !important; padding: 12px !important; }
      .mobile-padding { padding: 24px 18px !important; }
      .stat-grid-col { display: block !important; width: 100% !important; margin-bottom: 10px !important; }
      .hero-title { font-size: 28px !important; line-height: 1.1 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #DFE4DA; color: #26241D;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #DFE4DA; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 36px 12px 48px 12px;">
        <!-- Email Card Wrapper -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="580" class="container-table" style="max-width: 580px; width: 100%; margin: 0 auto;">
          
          <!-- Top Centered Brand Badge -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color: #23412E; border: 1px solid rgba(223, 228, 218, 0.35); border-radius: 9999px; padding: 8px 18px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="middle" style="padding-right: 8px;">
                          <!-- Alvion Peaceful Bird Mini SVG -->
                          <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
                            <path d="M23 21C26.5 14.5 32 9.5 40 7C36.8 12.8 34.5 18 29 22C26.5 23.8 24 23.5 23 21Z" fill="#E5C07B" opacity="0.8" />
                            <path d="M13 28C17 28 21.5 25.8 25.5 22.5C30.2 18.7 34.5 12.5 38 5C32.2 10.2 27 16.5 22.8 20.2C19.2 23.4 15.5 25 11 25.2C8.2 25.3 9 27.5 13 28Z" fill="#F4F7F2" />
                            <path d="M19 23.5C23 23 27 24.8 30.8 24.8C34.2 24.8 37.8 23.8 41 21.8C38.8 24.6 35.8 26.8 32.5 27.8C28.5 29 24.5 28.5 20 26.5C16.5 25 12.8 25.2 9.5 27C11.5 25 15 23.8 19 23.5Z" fill="#DFE4DA" opacity="0.9" />
                          </svg>
                        </td>
                        <td valign="middle" style="font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 11px; font-weight: 600; color: #DFE4DA; letter-spacing: 0.05em; text-transform: uppercase;">
                          Alvion &middot; Peaceful Financial Freedom
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Sanctuary Visual Card -->
          <tr>
            <td style="background-color: #07150E; border: 1px solid rgba(38, 36, 29, 0.18); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 48px -12px rgba(10, 22, 16, 0.45);" class="mobile-padding">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                
                <!-- Celestial Bird & Rings Graphic -->
                <tr>
                  <td align="center" style="padding: 38px 24px 20px 24px; background: radial-gradient(circle at 50% 50%, #0D2318 0%, #07150E 75%);">
                    <!-- Concentric Circles & Bird Emblem Table -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="160" height="160" style="width: 160px; height: 160px; border-radius: 50%; border: 1.5px solid rgba(223, 228, 218, 0.22); background: radial-gradient(circle, rgba(82, 183, 136, 0.28) 0%, rgba(10, 22, 16, 0.95) 75%);">
                      <tr>
                        <td align="center" valign="middle">
                          <svg width="84" height="84" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.6));">
                            <path d="M23 21C26.5 14.5 32 9.5 40 7C36.8 12.8 34.5 18 29 22C26.5 23.8 24 23.5 23 21Z" fill="#E5C07B" opacity="0.8" />
                            <path d="M13 28C17 28 21.5 25.8 25.5 22.5C30.2 18.7 34.5 12.5 38 5C32.2 10.2 27 16.5 22.8 20.2C19.2 23.4 15.5 25 11 25.2C8.2 25.3 9 27.5 13 28Z" fill="#F4F7F2" />
                            <path d="M19 23.5C23 23 27 24.8 30.8 24.8C34.2 24.8 37.8 23.8 41 21.8C38.8 24.6 35.8 26.8 32.5 27.8C28.5 29 24.5 28.5 20 26.5C16.5 25 12.8 25.2 9.5 27C11.5 25 15 23.8 19 23.5Z" fill="#DFE4DA" opacity="0.9" />
                            <path d="M11 26.2C8 28.5 6 32.5 5 37.5C8.2 34.2 12.5 31.2 15.5 29C13.5 28 12.2 27 11 26.2Z" fill="#DFE4DA" opacity="0.85" />
                            <path d="M13.5 27.2C10.5 30.5 9.5 35 9.5 39.5C12.5 35.8 15.8 32.5 18 29.8C16 28.8 14.5 28 13.5 27.2Z" fill="#E5C07B" opacity="0.7" />
                          </svg>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Title & Identity -->
                    <div style="padding-top: 20px;">
                      <h1 class="hero-title" style="margin: 0; font-family: 'Newsreader', Georgia, serif; font-size: 32px; font-weight: 400; color: #F4F7F2; letter-spacing: -0.015em;">
                        The Flight of Capital
                      </h1>
                      <p style="margin: 6px 0 0 0; font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 12px; color: rgba(223, 228, 218, 0.75); letter-spacing: 0.02em;">
                        Priority Access Reserved &middot; Robinhood Chain L2
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 24px 32px 36px 32px;">
                    
                    <!-- Priority Pass Confirmation Box -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(35, 65, 46, 0.35); border: 1px solid rgba(223, 228, 218, 0.22); border-radius: 16px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 20px;">
                          <!-- Pass Header -->
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-bottom: 1px solid rgba(223, 228, 218, 0.12); padding-bottom: 14px;">
                            <tr>
                              <td align="left">
                                <span style="font-family: 'Newsreader', Georgia, serif; font-size: 19px; color: #F4F7F2;">
                                  Priority Reservation Confirmed
                                </span>
                                <div style="font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 11px; color: rgba(223, 228, 218, 0.7); margin-top: 3px;">
                                  ${data.email}
                                </div>
                              </td>
                              <td align="right" valign="top">
                                <span style="background-color: #23412E; border: 1px solid rgba(223, 228, 218, 0.3); border-radius: 9999px; padding: 4px 12px; font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 11px; font-weight: 700; color: #E5C07B; letter-spacing: 0.05em;">
                                  ${data.tier} TIER
                                </span>
                              </td>
                            </tr>
                          </table>

                          <!-- 2-Col Stat Boxes -->
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 14px;">
                            <tr>
                              <td width="48%" class="stat-grid-col" style="background-color: rgba(10, 22, 16, 0.6); border: 1px solid rgba(223, 228, 218, 0.1); border-radius: 12px; padding: 12px 14px;">
                                <div style="font-family: 'SF Mono', Menlo, monospace; font-size: 10px; color: rgba(223, 228, 218, 0.55); text-transform: uppercase;">
                                  Waitlist Rank
                                </div>
                                <div style="font-family: 'SF Mono', Menlo, monospace; font-size: 18px; font-weight: 700; color: #E5C07B; margin-top: 3px;">
                                  #${data.rank.toLocaleString()}
                                </div>
                              </td>
                              <td width="4%">&nbsp;</td>
                              <td width="48%" class="stat-grid-col" style="background-color: rgba(10, 22, 16, 0.6); border: 1px solid rgba(223, 228, 218, 0.1); border-radius: 12px; padding: 12px 14px;">
                                <div style="font-family: 'SF Mono', Menlo, monospace; font-size: 10px; color: rgba(223, 228, 218, 0.55); text-transform: uppercase;">
                                  Pass Identifier
                                </div>
                                <div style="font-family: 'SF Mono', Menlo, monospace; font-size: 18px; font-weight: 700; color: #DFE4DA; margin-top: 3px;">
                                  ${data.passId}
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Explanatory Copy -->
                    <p style="font-size: 14px; line-height: 1.6; color: rgba(223, 228, 218, 0.88); margin: 0 0 20px 0;">
                      Welcome to <strong>Alvion</strong>. We are deploying synthetic perpetual markets with institutional zero-spread execution on Robinhood Chain L2.
                    </p>

                    <!-- Upgrade Progression Privilege Matrix -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(10, 22, 16, 0.6); border: 1px solid rgba(223, 228, 218, 0.16); border-radius: 16px; margin-bottom: 24px; overflow: hidden;">
                      <tr>
                        <td style="padding: 18px 20px; border-bottom: 1px solid rgba(223, 228, 218, 0.1);">
                          <div style="font-family: 'Newsreader', Georgia, serif; font-size: 18px; color: #F4F7F2; margin-bottom: 4px;">
                            Tier Progression &amp; Protocol Privileges
                          </div>
                          <p style="font-size: 12px; color: rgba(223, 228, 218, 0.72); margin: 0; line-height: 1.5;">
                            Each trader who registers using your link awards you <strong style="color: #52B788;">+500 Credits</strong> and promotes you up the queue, unlocking high-conviction protocol perks:
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 18px;">
                          <!-- Tier Item 1: Bronze -->
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 8px 0; border-bottom: 1px solid rgba(223, 228, 218, 0.08);">
                            <tr>
                              <td width="28%" valign="top">
                                <span style="background-color: rgba(205, 127, 50, 0.18); border: 1px solid rgba(205, 127, 50, 0.5); border-radius: 9999px; padding: 2px 8px; font-family: 'SF Mono', monospace; font-size: 10px; font-weight: 700; color: #CD7F32; text-transform: uppercase;">
                                  Bronze &middot; Scout
                                </span>
                                <div style="font-family: 'SF Mono', monospace; font-size: 9px; color: rgba(223, 228, 218, 0.45); margin-top: 3px;">0 Invites &middot; 200 Credits</div>
                              </td>
                              <td width="72%" valign="middle" style="padding-left: 10px; font-size: 11px; line-height: 1.45; color: rgba(223, 228, 218, 0.82); font-family: 'Lato', sans-serif;">
                                Standard Testnet Queue &middot; 1.0x Vault Yield &middot; Real-time CLOB WebSocket Stream
                              </td>
                            </tr>
                          </table>

                          <!-- Tier Item 2: Metal -->
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 8px 0; border-bottom: 1px solid rgba(223, 228, 218, 0.08);">
                            <tr>
                              <td width="28%" valign="top">
                                <span style="background-color: rgba(192, 192, 192, 0.18); border: 1px solid rgba(192, 192, 192, 0.5); border-radius: 9999px; padding: 2px 8px; font-family: 'SF Mono', monospace; font-size: 10px; font-weight: 700; color: #E2E8F0; text-transform: uppercase;">
                                  Metal &middot; Vanguard
                                </span>
                                <div style="font-family: 'SF Mono', monospace; font-size: 9px; color: rgba(223, 228, 218, 0.45); margin-top: 3px;">1 Invite &middot; 800 Credits</div>
                              </td>
                              <td width="72%" valign="middle" style="padding-left: 10px; font-size: 11px; line-height: 1.45; color: rgba(223, 228, 218, 0.88); font-family: 'Lato', sans-serif;">
                                <strong style="color: #E2E8F0;">15% Maker Fee Rebate</strong> &middot; Fast-Lane Queue &middot; 1.25x Genesis Multiplier
                              </td>
                            </tr>
                          </table>

                          <!-- Tier Item 3: Gold -->
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 8px 0; border-bottom: 1px solid rgba(223, 228, 218, 0.08);">
                            <tr>
                              <td width="28%" valign="top">
                                <span style="background-color: rgba(229, 192, 123, 0.2); border: 1px solid #E5C07B; border-radius: 9999px; padding: 2px 8px; font-family: 'SF Mono', monospace; font-size: 10px; font-weight: 700; color: #E5C07B; text-transform: uppercase;">
                                  Gold &middot; Sovereign
                                </span>
                                <div style="font-family: 'SF Mono', monospace; font-size: 9px; color: rgba(223, 228, 218, 0.45); margin-top: 3px;">2 Invites &middot; 1,800 Credits</div>
                              </td>
                              <td width="72%" valign="middle" style="padding-left: 10px; font-size: 11px; line-height: 1.45; color: rgba(223, 228, 218, 0.92); font-family: 'Lato', sans-serif;">
                                <strong style="color: #E5C07B;">0% Borrow Fees on Synthetics (SPY/NVDA)</strong> &middot; Wave 1 Guaranteed Pass &middot; 1.5x Vault Boost
                              </td>
                            </tr>
                          </table>

                          <!-- Tier Item 4: Platinum -->
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 8px 0; border-bottom: 1px solid rgba(223, 228, 218, 0.08);">
                            <tr>
                              <td width="28%" valign="top">
                                <span style="background-color: rgba(112, 214, 255, 0.18); border: 1px solid #70D6FF; border-radius: 9999px; padding: 2px 8px; font-family: 'SF Mono', monospace; font-size: 10px; font-weight: 700; color: #70D6FF; text-transform: uppercase;">
                                  Platinum &middot; Syndicate
                                </span>
                                <div style="font-family: 'SF Mono', monospace; font-size: 9px; color: rgba(223, 228, 218, 0.45); margin-top: 3px;">5 Invites &middot; 3,000 Credits</div>
                              </td>
                              <td width="72%" valign="middle" style="padding-left: 10px; font-size: 11px; line-height: 1.45; color: rgba(223, 228, 218, 0.92); font-family: 'Lato', sans-serif;">
                                <strong style="color: #70D6FF;">Sub-10ms Private Relayer Gateway</strong> &middot; Liquidation Grace Shield &middot; VIP Syndicate Allocation
                              </td>
                            </tr>
                          </table>

                          <!-- Tier Item 5: Diamond -->
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 8px 0;">
                            <tr>
                              <td width="28%" valign="top">
                                <span style="background-color: rgba(82, 183, 136, 0.22); border: 1px solid #52B788; border-radius: 9999px; padding: 2px 8px; font-family: 'SF Mono', monospace; font-size: 10px; font-weight: 700; color: #52B788; text-transform: uppercase;">
                                  Diamond &middot; Council
                                </span>
                                <div style="font-family: 'SF Mono', monospace; font-size: 9px; color: rgba(223, 228, 218, 0.45); margin-top: 3px;">10+ Invites &middot; 5,000 Credits</div>
                              </td>
                              <td width="72%" valign="middle" style="padding-left: 10px; font-size: 11px; line-height: 1.45; color: rgba(223, 228, 218, 0.95); font-family: 'Lato', sans-serif;">
                                <strong style="color: #52B788;">Lifetime Zero-Spread Execution</strong> &middot; <strong style="color: #E5C07B;">Protocol Revenue Share Pool</strong> &middot; 2.5x Genesis Allocation
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Share Referral Box -->
                    <div style="margin-bottom: 24px;">
                      <div style="font-family: 'SF Mono', Menlo, monospace; font-size: 11px; color: rgba(223, 228, 218, 0.75); margin-bottom: 6px; text-transform: uppercase;">
                        Your Unique Invitation Link:
                      </div>
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #030A06; border: 1px solid rgba(223, 228, 218, 0.25); border-radius: 10px;">
                        <tr>
                          <td style="padding: 12px 16px; font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 12px; color: #52B788; word-break: break-all;">
                            ${data.referralLink}
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Liquid Morph Style Action Button -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="padding-top: 8px; padding-bottom: 12px;">
                          <a href="${data.referralLink}" target="_blank" style="display: inline-block; background-color: #23412E; color: #DFE4DA; text-decoration: none; font-family: 'Lato', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 16px 36px; border-radius: 50px; border: 1px solid rgba(223, 228, 218, 0.3); box-shadow: 0 10px 24px -4px rgba(35, 65, 46, 0.6);">
                            Invite Traders &amp; Climb Rank
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
              <p style="margin: 0; font-size: 11px; color: rgba(38, 36, 29, 0.58); font-family: 'Lato', sans-serif;">
                &copy; Alvion Solutions Limited &middot; Robinhood Chain (0x4663...4663)
              </p>
              <p style="margin: 6px 0 0 0; font-size: 10px; color: rgba(38, 36, 29, 0.42); font-family: 'Lato', sans-serif;">
                You received this priority pass because this email requested access at alvion.fi. Unsubscribe any time.
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


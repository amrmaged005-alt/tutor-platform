export interface WaitlistEmailProps {
  firstName:  string;
  classTitle: string;
  tutorName:  string;
  priceEgp:   number;
  classUrl:   string;
}

export function renderWaitlistEmail(props: WaitlistEmailProps): string {
  const { firstName, classTitle, tutorName, priceEgp, classUrl } = props;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Spot opened in ${classTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f4efe2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe2;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fbfaf6;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(24,23,21,0.10);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d5946,#073327);padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#a7e3d0;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">Coursaty</p>
              <h1 style="margin:12px 0 0;color:#fbfaf6;font-size:26px;font-weight:800;line-height:1.2;">A spot just opened!</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 18px;color:#2d2a24;font-size:16px;line-height:1.6;">Hi <strong>${escHtml(firstName)}</strong>,</p>
              <p style="margin:0 0 18px;color:#2d2a24;font-size:16px;line-height:1.6;">
                Great news — a spot has opened in a class you were waiting for:
              </p>
              <!-- Class card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe2;border:1px solid #ddd3bd;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px;color:#0d5946;font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;">Class</p>
                    <p style="margin:0 0 8px;color:#2d2a24;font-size:20px;font-weight:800;line-height:1.2;">${escHtml(classTitle)}</p>
                    <p style="margin:0 0 12px;color:#6b6455;font-size:14px;">with <strong>${escHtml(tutorName)}</strong></p>
                    <p style="margin:0;color:#0d5946;font-size:22px;font-weight:800;">${priceEgp.toLocaleString()} EGP <span style="font-size:13px;font-weight:600;color:#6b6455;">/ session</span></p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 28px;color:#6b6455;font-size:15px;line-height:1.6;">
                Spots go fast — click below to reserve your seat before someone else does.
              </p>
              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${escHtml(classUrl)}"
                       style="display:inline-block;background:#0d5946;color:#fbfaf6;text-decoration:none;font-size:16px;font-weight:800;padding:16px 40px;border-radius:12px;letter-spacing:0.01em;">
                      Reserve Your Spot &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f4efe2;padding:24px 40px;border-top:1px solid #ddd3bd;text-align:center;">
              <p style="margin:0;color:#9e9381;font-size:12px;line-height:1.6;">
                You received this email because you joined the waitlist on Coursaty.<br/>
                If you no longer need this class, you can ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

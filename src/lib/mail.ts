import nodemailer from "nodemailer";
import path from "path";

const getTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.zoho.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : port === 465;

  const user = process.env.SMTP_USERNAME || process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    const transporter = getTransporter();
    const senderEmail = process.env.SMTP_USERNAME || process.env.SMTP_USER;
    const logoPath = path.join(process.cwd(), "public/assets/images/logo.png");

    const mailOptions = {
      from: `"WinpariBet Security" <${senderEmail}>`,
      to: email,
      subject: "🔒 Security Verification Code | WinpariBet",
      // Embed local logo directly using cid (content identifier)
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "logo",
        },
      ],
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Security Verification Code</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #0b0e14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0e14; padding: 40px 10px;">
              <tr>
                <td align="center">
                  <!-- Main Box Container -->
                  <table role="presentation" width="100%" style="max-width: 520px; background-color: #131722; border: 1px solid #1e2538; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                    
                    <!-- Header with Logo -->
                    <tr>
                      <td style="padding: 32px 30px 20px 30px; text-align: center; border-bottom: 1px solid #1e2538;">
                        <img src="cid:logo" alt="WinpariBet" style="max-height: 48px; width: auto; display: block; margin: 0 auto;" />
                      </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                      <td style="padding: 30px;">
                        <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #ffffff; text-align: center; letter-spacing: -0.3px;">
                          Password Reset Request
                        </h2>
                        <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #94a3b8; text-align: center;">
                          We received a request to authorize a password change for your <strong style="color: #22c55e;">WinpariBet</strong> account. Use the code below to complete the process.
                        </p>

                        <!-- OTP Box -->
                        <div style="background-color: #0b0e14; border: 1px dashed #22c55e; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                          <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; display: block; margin-bottom: 8px;">
                            One-Time Security Code
                          </span>
                          <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #22c55e; text-shadow: 0 0 10px rgba(34, 197, 94, 0.2);">
                            ${token}
                          </span>
                        </div>

                        <!-- Timer Note -->
                        <p style="margin: 0 0 20px 0; font-size: 13px; color: #64748b; text-align: center; line-height: 1.5;">
                          ⏳ This code is valid for <strong style="color: #cbd5e1;">15 minutes</strong>. Do not share this code with anyone, including support staff.
                        </p>

                        <!-- Warning Footer -->
                        <div style="background-color: #1a1013; border-left: 3px solid #ef4444; border-radius: 4px; padding: 12px 16px;">
                          <p style="margin: 0; font-size: 12px; color: #fca5a5; line-height: 1.4;">
                            <strong>Didn't request this?</strong> Ignore this message or contact support if you suspect unauthorized access.
                          </p>
                        </div>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding: 20px 30px; background-color: #0d1017; border-top: 1px solid #1e2538; text-align: center;">
                        <p style="margin: 0 0 6px 0; font-size: 11px; color: #475569;">
                          WinpariBet Security Operations &bull; Automated System Notice
                        </p>
                        <p style="margin: 0; font-size: 10px; color: #334155;">
                          &copy; ${new Date().getFullYear()} WinpariBet. All rights reserved.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    };

    const res = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully. Message ID:", res.messageId);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

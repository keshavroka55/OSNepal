import nodemailer from "nodemailer";
import { config } from "../../config/config.js";

const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  secure: false,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASSWORD,
  },
});

// Brand colors and font: change here to restyle every email
const BRAND = {
  primary: "#FF7A00",
  primaryDark: "#E66D00",
  pageBg: "#F6F7F9",
  cardBg: "#FFFFFF",
  heading: "#111827",
  text: "#4B5563",
  muted: "#9CA3AF",
  border: "#E5E7EB",
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

// Table-based button so it renders correctly in Outlook as well
const button = (url, label) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0;">
    <tr>
      <td align="center" bgcolor="${BRAND.primary}" style="border-radius: 8px; border: 1px solid ${BRAND.primaryDark};">
        <a href="${url}" target="_blank"
           style="display: inline-block; padding: 14px 32px; font-family: ${BRAND.font};
                  font-size: 16px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 8px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;

const fallbackLink = (url) => `
  <p style="margin: 0 0 8px; font-size: 13px; color: ${BRAND.muted};">
    Button not working? Copy and paste this link into your browser:
  </p>
  <p style="margin: 0; font-size: 13px; word-break: break-all;">
    <a href="${url}" style="color: ${BRAND.primary};">${url}</a>
  </p>`;

// Shared layout: each email only provides its own content
const emailLayout = ({ preheader, content }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Open Source Nepal</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.pageBg};">

  <!-- Preview text shown next to the subject in the inbox -->
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${preheader}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.pageBg}">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width: 560px; background-color: ${BRAND.cardBg}; border: 1px solid ${BRAND.border}; border-radius: 12px; overflow: hidden;">

          <tr>
            <td height="6" style="background-color: ${BRAND.primary}; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <tr>
            <td style="padding: 28px 40px 0; font-family: ${BRAND.font}; font-size: 20px; font-weight: 700; color: ${BRAND.heading};">
              &lt;/&gt; <span style="color: ${BRAND.primary};">Open Source</span> Nepal
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 40px 36px; font-family: ${BRAND.font}; font-size: 16px; line-height: 1.6; color: ${BRAND.text};">
              ${content}
            </td>
          </tr>

        </table>

        <p style="max-width: 560px; margin: 24px 0 0; font-family: ${BRAND.font}; font-size: 12px; line-height: 1.5; color: ${BRAND.muted}; text-align: center;">
          &copy; ${new Date().getFullYear()} Open Source Nepal. Built by the community, for the community.
        </p>

      </td>
    </tr>
  </table>
</body>
</html>`;

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${config.CLIENT_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

  const html = emailLayout({
    preheader: "Reset your Open Source Nepal password. This link expires in 1 hour.",
    content: `
      <h1 style="margin: 0 0 16px; font-size: 24px; line-height: 1.3; color: ${BRAND.heading};">
        Reset your password
      </h1>
      <p style="margin: 0 0 8px;">
        We received a request to reset the password for your account.
        Click the button below to choose a new one.
      </p>

      ${button(resetUrl, "Reset Password")}

      <p style="margin: 0 0 24px; font-size: 14px;">
        This link expires in <strong>1 hour</strong>.
      </p>

      <hr style="border: none; border-top: 1px solid ${BRAND.border}; margin: 0 0 24px;" />

      ${fallbackLink(resetUrl)}

      <p style="margin: 24px 0 0; font-size: 14px; color: ${BRAND.muted};">
        Didn't request this? You can safely ignore this email. Your password won't change.
      </p>`,
  });

  // Plain-text version for clients that don't render HTML
  const text = `Reset your password\n\nReset it here (expires in 1 hour): ${resetUrl}\n\nIf you didn't request this, ignore this email.`;

  await transporter.sendMail({
    from: config.EMAIL_FROM,
    to: email,
    subject: "Reset your password - Open Source Nepal",
    html,
    text,
  });
};

export const sendVerificationEmail = async (email, verificationToken) => {
  const verifyUrl = `${config.CLIENT_URL}/verify-email?token=${encodeURIComponent(verificationToken)}`;

  const html = emailLayout({
    preheader: "Welcome! Verify your email to start building with Open Source Nepal.",
    content: `
      <h1 style="margin: 0 0 16px; font-size: 24px; line-height: 1.3; color: ${BRAND.heading};">
        Welcome to Open Source Nepal
      </h1>
      <p style="margin: 0 0 8px;">
        You're one step away from joining Nepal's community of developers,
        founders, and builders. Please verify your email to get started.
      </p>

      ${button(verifyUrl, "Verify Email")}

      <hr style="border: none; border-top: 1px solid ${BRAND.border}; margin: 0 0 24px;" />

      ${fallbackLink(verifyUrl)}`,
  });

  const text = `Welcome to Open Source Nepal!\n\nVerify your email: ${verifyUrl}`;

  await transporter.sendMail({
    from: config.EMAIL_FROM,
    to: email,
    subject: "Verify your email - Open Source Nepal",
    html,
    text,
  });
};
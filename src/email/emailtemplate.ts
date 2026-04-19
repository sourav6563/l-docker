import { EmailTypes } from "../constants";

export const getEmailTemplate = (type: EmailTypes, username: string, code: string) => {
  const isVerify = type === EmailTypes.VERIFY;
  const title = isVerify ? "Verify Your Email" : "Reset Your Password";
  const description = isVerify
    ? "Thank you for signing up! Please use the verification code below to confirm your email address and complete your registration."
    : "We received a request to reset your password. Please use the code below to create a new password.";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            
            <!-- Main Container -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width: 560px; width: 100%; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5; overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(to right, #7c3aed, #2563eb); background-color: #7c3aed; padding: 40px 32px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; line-height: 1.3; font-family: 'Helvetica Neue', Arial, sans-serif; letter-spacing: -0.5px;">
                    Dancely
                  </h1>
                  <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 14px; font-weight: 500;">
                    ${title}
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 32px;">
                  
                  <!-- Greeting -->
                  <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 500; color: #18181b; line-height: 1.5;">
                    Hi ${username},
                  </p>
                  
                  <!-- Description -->
                  <p style="margin: 0 0 32px 0; font-size: 15px; color: #52525b; line-height: 1.6;">
                    ${description}
                  </p>
                  
                  <!-- Code Label -->
                  <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 500; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">
                    Your verification code
                  </p>
                  
                  <!-- Code Box -->
                  <div style="background-color: #fafafa; border: 2px dashed #d4d4d8; border-radius: 8px; padding: 24px 16px; text-align: center; margin: 0 0 24px 0;">
                    <p style="margin: 0; font-size: 36px; font-weight: 700; color: #18181b; letter-spacing: 6px; font-family: 'Courier New', Courier, monospace; line-height: 1;">
                      ${code}
                    </p>
                  </div>
                  
                  <!-- Expiry Notice -->
                  <p style="margin: 0 0 32px 0; font-size: 14px; color: #71717a; text-align: center; line-height: 1.5;">
                    ⏱ This code will expire in <strong>15 minutes</strong>.
                  </p>
                  
                  <!-- Divider -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 0 32px 0;">
                    <tr>
                      <td style="border-top: 1px solid #e5e5e5;"></td>
                    </tr>
                  </table>
                  
                  <!-- Footer Message -->
                  <p style="margin: 0; font-size: 13px; color: #a1a1aa; line-height: 1.6;">
                    If you didn't request this, please ignore this email. Your Dancely account remains secure.
                  </p>
                  
                </td>
              </tr>
              
              <!-- Bottom Footer -->
              <tr>
                <td style="background-color: #fafafa; padding: 24px 32px; border-top: 1px solid #e5e5e5;">
                  <p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center; line-height: 1.5;">
                    © ${new Date().getFullYear()} Dancely. All rights reserved.
                  </p>
                </td>
              </tr>
              
            </table>
            
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

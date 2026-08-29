import nodemailer from 'nodemailer';

interface SendResetEmailOptions {
  to: string;
  name: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({ to, name, resetUrl }: SendResetEmailOptions): Promise<{ success: boolean; preview?: boolean }> {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const fromEmail = process.env.SMTP_FROM || `"Lumière Support" <${smtpUser || 'nurainsalimah1@gmail.com'}>`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Kata Sandi Lumière</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1c1917;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e7e5e4;">
          <!-- Header -->
          <tr>
            <td style="background-color: #1c1917; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                Lumière<span style="color: #e29b47;">.</span>
              </h1>
              <p style="margin: 6px 0 0; color: #a8a29e; font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase;">
                Permintaan Reset Kata Sandi
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #292524;">
                Halo <strong>${name}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #57534e;">
                Kami menerima permintaan untuk mengatur ulang kata sandi akun Lumière Anda. Klik tombol di bawah ini untuk membuat kata sandi baru:
              </p>

              <!-- Action Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #1c1917;">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 12px; letter-spacing: 0.3px;">
                      Atur Ulang Kata Sandi
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; font-size: 13px; line-height: 20px; color: #78716c;">
                Atau salin tautan berikut ke browser Anda jika tombol di atas tidak dapat diklik:
              </p>
              <p style="margin: 0 0 32px; word-break: break-all; font-size: 13px; line-height: 20px; color: #d97706; background-color: #fef3c7; padding: 12px; border-radius: 8px; border: 1px solid #fde68a;">
                <a href="${resetUrl}" style="color: #b45309; text-decoration: underline;">${resetUrl}</a>
              </p>

              <div style="border-top: 1px solid #e7e5e4; padding-top: 24px; margin-top: 24px;">
                <p style="margin: 0 0 8px; font-size: 12px; line-height: 18px; color: #a8a29e;">
                  <strong>Catatan:</strong> Tautan ini hanya berlaku selama <strong>15 menit</strong> demi alasan keamanan.
                </p>
                <p style="margin: 0; font-size: 12px; line-height: 18px; color: #a8a29e;">
                  Jika Anda tidak meminta pengaturan ulang kata sandi, Anda dapat mengabaikan email ini dengan aman.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafaf9; padding: 20px 40px; text-align: center; border-top: 1px solid #e7e5e4;">
              <p style="margin: 0; font-size: 12px; color: #78716c;">
                &copy; ${new Date().getFullYear()} Lumière Furniture. All rights reserved.
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

  // If SMTP is not yet configured, provide a convenient fallback for local development
  if (!smtpUser || !smtpPass) {
    console.log('\n────────────────────────────────────────────────────────────────────────');
    console.log('[DEV EMAIL SIMULATOR] Password Reset Email');
    console.log(`To: ${to} (${name})`);
    console.log(`Reset Link: ${resetUrl}`);
    console.log('Untuk mengirim email asli, atur SMTP_USER & SMTP_PASS di server/.env');
    console.log('────────────────────────────────────────────────────────────────────────\n');
    return { success: true, preview: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: fromEmail,
      to,
      subject: 'Atur Ulang Kata Sandi Akun Lumière',
      html: htmlContent,
      text: `Halo ${name},\n\nPermintaan reset kata sandi akun Lumière Anda.\nSilakan buka tautan berikut untuk membuat kata sandi baru (berlaku 15 menit):\n${resetUrl}\n\nJika bukan Anda yang meminta, abaikan pesan ini.`,
    });

    return { success: true, preview: false };
  } catch (error) {
    console.error('Failed to send reset email via SMTP:', error);
    throw error;
  }
}

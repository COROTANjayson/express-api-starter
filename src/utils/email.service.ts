import { Resend } from "resend";
import { RESEND_API_KEY, RESEND_SENDER_EMAIL, CLIENT_URL } from "./config";

export class EmailService {
  private resend: Resend | null = null;

  constructor() {
    if (RESEND_API_KEY) {
      this.resend = new Resend(RESEND_API_KEY);
      console.log("Resend Initialized");
    } else {
      console.warn(
        "Resend credentials not found. Email sending will be simulated."
      );
    }
  }

  async sendVerificationEmail(to: string, token: string) {
    const verificationLink = `${CLIENT_URL}/verify-email?token=${token}`;
    const htmlContent = `<p>Please verify your email by clicking the link below:</p><br><a href="${verificationLink}">${verificationLink}</a><br><p>This link expires in 30 minutes.</p>`;
    const textContent = `Please verify your email by clicking the link: ${verificationLink}`;
    const subject = "Verify your email";
    const sender = RESEND_SENDER_EMAIL || "onboarding@resend.dev";

    if (!this.resend) {
      console.log("Simulating Email Send:", {
        to,
        subject,
        html: htmlContent,
        from: sender,
      });
      return { success: true, message: "Simulated" };
    }

    try {
      const data = await this.resend.emails.send({
        from: sender,
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent,
      });

      if (data.error) {
        console.error("Resend Error:", data.error);
        throw data.error;
      }

      console.log("Email sent:", data);
      return data;
    } catch (error) {
      console.error("Email sending failed:", error);
      throw error;
    }
  }
}

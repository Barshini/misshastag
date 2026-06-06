import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "./supabase";
import nodemailer from "nodemailer";

// Helper: Build a fully responsive HTML email template
function buildResponsiveEmailHtml(title: string, contentHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          min-width: 100%;
          width: 100% !important;
          background-color: #f6f5f3;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        table {
          border-spacing: 0;
          border-collapse: collapse;
        }
        @media only screen and (max-width: 600px) {
          .email-container {
            width: 100% !important;
            padding: 20px !important;
          }
          .detail-table td {
            display: block !important;
            width: 100% !important;
            box-sizing: border-box;
            padding: 6px 0 !important;
          }
          .detail-table tr {
            border-bottom: 1px solid #eaeaea;
          }
          .detail-table tr:last-child {
            border-bottom: none;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f6f5f3;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f6f5f3; padding: 30px 0;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" class="email-container" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 16px; overflow: hidden; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);">
              <tr>
                <td>
                  <div style="text-align: center; border-bottom: 2px solid #62101e; padding-bottom: 20px; margin-bottom: 25px;">
                    <span style="font-family: Georgia, serif; font-size: 26px; letter-spacing: 0.05em; color: #222; text-transform: uppercase;">
                      Miss <span style="font-style: italic; color: #b18c64;">Hastag</span>
                    </span>
                  </div>
                  
                  ${contentHtml}

                  <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 30px 0;" />
                  <div style="font-size: 12px; color: #888888; text-align: center; line-height: 1.5;">
                    <strong>Miss Hastag Boutique</strong><br />
                    Patan, Lalitpur 44600, Nepal<br />
                    Contact: +977 9807499247 / +977 9808518972
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export const submitBookingAction = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(5),
      message: z.string().optional(),
      website: z.string().optional(), // Honeypot field for bot/spam protection
    })
  )
  .handler(async ({ data }) => {
    console.log("Processing booking request on server via Nodemailer:", data);

    // 1. Honeypot check for spam/bots
    if (data.website && data.website.trim() !== "") {
      console.warn("Spam detected via honeypot field. Rejecting silently.");
      return { success: true, message: "Booking requested successfully!" }; // return success silently
    }

    // 2. Insert into Supabase bookings table
    const { error: dbError } = await supabase.from("bookings").insert({
      customer_name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message || "",
      status: "pending",
    });

    if (dbError) {
      console.error("Database insertion error:", dbError);
      throw new Error(`Failed to save booking: ${dbError.message}`);
    }

    // 3. Dispatch Emails (entire block is wrapped in try/catch, if it fails, just console.error and continue)
    try {
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;
      const ownerEmail = process.env.OWNER_EMAIL || emailUser;

      if (!emailUser || !emailPass) {
        console.warn("Email credentials missing (EMAIL_USER/EMAIL_PASS). Skipping email dispatch.");
      } else {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || "smtp.gmail.com",
          port: parseInt(process.env.EMAIL_PORT || "465"),
          secure: process.env.EMAIL_SECURE !== "false", // default to true for 465
          auth: {
            user: emailUser,
            pass: emailPass,
          },
        });

        // A. Client Confirmation Email Html Body
        const clientEmailBody = `
          <h3 style="font-family: Georgia, serif; font-size: 20px; color: #222; margin-top: 0; font-weight: normal;">Appointment Request Received</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #444; margin-bottom: 20px;">
            Dear ${data.name},<br/><br/>
            Thank you for requesting a styling session with Miss Hastag! We are excited to dress you.
          </p>
          <div style="background-color: #fcfbf9; border: 1px solid #eaeaea; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; font-family: Georgia, serif; font-size: 16px; color: #62101e; border-bottom: 1px solid #eaeaea; padding-bottom: 8px;">Request Details</h4>
            <table width="100%" class="detail-table" style="font-size: 14px; color: #444; line-height: 1.5;">
              <tr>
                <td style="padding: 6px 0; font-weight: 600; width: 140px;">Name:</td>
                <td style="padding: 6px 0; color: #666;">${data.name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Phone:</td>
                <td style="padding: 6px 0; color: #666;">${data.phone}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Preferred Date/Notes:</td>
                <td style="padding: 6px 0; color: #666;">${data.message || "None specified"}</td>
              </tr>
            </table>
          </div>
          <p style="font-size: 14px; line-height: 1.6; color: #444; margin-bottom: 0;">
            Our team will contact you shortly via phone or email to confirm your date and time slot.
          </p>
        `;

        // B. Owner Notification Email Html Body
        const ownerEmailBody = `
          <h3 style="font-family: Georgia, serif; font-size: 20px; color: #62101e; margin-top: 0; font-weight: normal;">New Booking Request</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #444; margin-bottom: 20px;">
            Hello Admin,<br/><br/>
            You have received a new styling session request from the website:
          </p>
          <div style="background-color: #fcfbf9; border: 1px solid #eaeaea; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <table width="100%" class="detail-table" style="font-size: 14px; color: #444; line-height: 1.5;">
              <tr>
                <td style="padding: 6px 0; font-weight: 600; width: 140px;">Customer Name:</td>
                <td style="padding: 6px 0; color: #666;">${data.name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Email:</td>
                <td style="padding: 6px 0; color: #666;"><a href="mailto:${data.email}">${data.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Phone:</td>
                <td style="padding: 6px 0; color: #666;"><a href="tel:${data.phone}">${data.phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Notes/Preferred Time:</td>
                <td style="padding: 6px 0; color: #666;">${data.message || "None specified"}</td>
              </tr>
            </table>
          </div>
          <p style="font-size: 14px; line-height: 1.6; color: #444; margin-bottom: 0;">
            Please log in to your dashboard to confirm or manage this booking.
          </p>
        `;

        // Send both emails in parallel
        await Promise.all([
          transporter.sendMail({
            from: `"Miss Hastag" <${emailUser}>`,
            to: data.email,
            subject: "Your Styling Session Request - Miss Hastag",
            html: buildResponsiveEmailHtml("Styling Session Request", clientEmailBody),
          }),
          transporter.sendMail({
            from: `"Miss Hastag Bot" <${emailUser}>`,
            to: ownerEmail,
            subject: `New Styling Booking Request from ${data.name}`,
            html: buildResponsiveEmailHtml("New Booking Request", ownerEmailBody),
          }),
        ]);

        console.log("Automated booking emails successfully dispatched.");
      }
    } catch (emailErr) {
      console.error("Email dispatch failed:", emailErr);
      // We do not throw here so that the user's booking still succeeds in the UI and database
    }

    return { success: true, message: "Booking requested successfully!" };
  });

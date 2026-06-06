import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "./supabase";
import nodemailer from "nodemailer";

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

        // A. Client Confirmation Email
        const clientMailOptions = {
          from: `"Miss Hastag" <${emailUser}>`,
          to: data.email,
          subject: "Your Styling Session Request - Miss Hastag",
          html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 16px; background-color: #fcfbf9; color: #222;">
              <h2 style="font-family: Georgia, serif; color: #62101e; border-bottom: 2px solid #62101e; padding-bottom: 15px; margin-top: 0;">Appointment Request Received</h2>
              <p>Dear ${data.name},</p>
              <p>Thank you for requesting a styling session with Miss Hastag! We are excited to dress you.</p>
              <p>Here are your request details:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #eaeaea; width: 120px;">Name:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eaeaea;">${data.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #eaeaea;">Phone:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eaeaea;">${data.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #eaeaea;">Preferred Date/Notes:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eaeaea;">${data.message || "None specified"}</td>
                </tr>
              </table>
              <p>Our team will contact you shortly via phone or email to confirm your date and time slot.</p>
              <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 30px 0;" />
              <div style="font-size: 12px; color: #666; text-align: center;">
                <strong>Miss Hastag Boutique</strong><br />
                Patan, Lalitpur, Nepal<br />
                Contact: +977 9807499247 / +977 9808518972
              </div>
            </div>
          `,
        };

        // B. Owner Notification Email
        const ownerMailOptions = {
          from: `"Miss Hastag Bot" <${emailUser}>`,
          to: ownerEmail,
          subject: `New Styling Booking Request from ${data.name}`,
          html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 16px; background-color: #ffffff; color: #222;">
              <h2 style="font-family: Georgia, serif; color: #222; border-bottom: 2px solid #eaeaea; padding-bottom: 15px; margin-top: 0;">New Booking Notification</h2>
              <p>Hello Miss Hastag Admin,</p>
              <p>You have received a new styling session request from the website:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #fcfbf9; border-radius: 8px; border: 1px solid #eaeaea;">
                <tr>
                  <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #eaeaea; width: 150px;">Customer Name:</td>
                  <td style="padding: 12px; border-bottom: 1px solid #eaeaea;">${data.name}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #eaeaea;">Email:</td>
                  <td style="padding: 12px; border-bottom: 1px solid #eaeaea;"><a href="mailto:${data.email}">${data.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #eaeaea;">Phone Number:</td>
                  <td style="padding: 12px; border-bottom: 1px solid #eaeaea;"><a href="tel:${data.phone}">${data.phone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 12px; font-weight: bold;">Notes/Preferred Time:</td>
                  <td style="padding: 12px;">${data.message || "None specified"}</td>
                </tr>
              </table>
              <p>Please log in to your dashboard at <a href="https://misshastag.vercel.app/admin">misshastag.vercel.app/admin</a> to confirm or manage this booking.</p>
            </div>
          `,
        };

        // Send both emails in parallel
        await Promise.all([
          transporter.sendMail(clientMailOptions),
          transporter.sendMail(ownerMailOptions),
        ]);

        console.log("Automated booking emails successfully dispatched.");
      }
    } catch (emailErr) {
      console.error("Email dispatch failed:", emailErr);
      // We do not throw here so that the user's booking still succeeds in the UI and database
    }

    return { success: true, message: "Booking requested successfully!" };
  });

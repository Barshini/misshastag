import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "./supabase";
import nodemailer from "nodemailer";
import crypto from "node:crypto";

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
        /* Base styles reset */
        body {
          margin: 0;
          padding: 0;
          min-width: 100%;
          width: 100% !important;
          background-color: #f6f5f3;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        table {
          border-spacing: 0;
          border-collapse: collapse;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        td {
          padding: 0;
        }
        img {
          border: 0;
          line-height: 100%;
          outline: none;
          text-decoration: none;
        }
        /* Responsive container styling */
        @media only screen and (max-width: 600px) {
          .email-container {
            width: 100% !important;
            padding: 20px !important;
          }
          .detail-table td {
            display: block !important;
            width: 100% !important;
            box-sizing: border-box;
            padding: 8px 0 !important;
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
            <!--[if (gte mso 9)|(IE)]>
            <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
            <tr>
            <td>
            <![endif]-->
            <table border="0" cellpadding="0" cellspacing="0" class="email-container" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 16px; overflow: hidden; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);">
              <tr>
                <td>
                  <!-- Logo / Header -->
                  <div style="text-align: center; border-bottom: 2px solid #62101e; padding-bottom: 20px; margin-bottom: 25px;">
                    <span style="font-family: Georgia, serif; font-size: 26px; letter-spacing: 0.05em; color: #222; font-weight: normal; text-transform: uppercase;">
                      Miss <span style="font-style: italic; color: #b18c64;">Hastag</span>
                    </span>
                  </div>
                  
                  <!-- Main Body Content -->
                  ${contentHtml}

                  <!-- Footer -->
                  <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 30px 0;" />
                  <div style="font-size: 12px; color: #888888; text-align: center; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                    <strong>Miss Hastag Boutique</strong><br />
                    Patan, Lalitpur 44600, Nepal<br />
                    Contact: +977 9807499247 / +977 9808518972<br />
                    Instagram: @miss.hastag
                  </div>
                </td>
              </tr>
            </table>
            <!--[if (gte mso 9)|(IE)]>
            </td>
            </tr>
            </table>
            <![endif]-->
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Helper: Send responsive emails to Customer and Owner via Nodemailer
async function sendOrderEmails(order: {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  size: string;
  product_name: string;
  product_price: number;
  payment_method: string;
  payment_status: string;
}) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const ownerEmail = "sulyoonseo@gmail.com"; // Configured as requested

  if (!emailUser || !emailPass) {
    console.warn("Email credentials missing (EMAIL_USER/EMAIL_PASS). Skipping order email dispatch.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "465"),
    secure: process.env.EMAIL_SECURE !== "false",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const formattedPrice = `Rs. ${order.product_price.toLocaleString()}`;
  const methodLabel = order.payment_method.toUpperCase();

  // A. Customer Confirmation Email
  const customerContentHtml = `
    <h3 style="font-family: Georgia, serif; font-size: 20px; color: #222; margin-top: 0; font-weight: normal;">Order Placed Successfully</h3>
    <p style="font-size: 14px; line-height: 1.6; color: #444; margin-bottom: 20px;">
      Dear ${order.customer_name},<br/><br/>
      Thank you for shopping at Miss Hastag! We have received your order and are currently preparing it for delivery.
    </p>
    
    <div style="background-color: #fcfbf9; border: 1px solid #eaeaea; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h4 style="margin-top: 0; font-family: Georgia, serif; font-size: 16px; color: #62101e; border-bottom: 1px solid #eaeaea; padding-bottom: 8px;">Order Details</h4>
      <table width="100%" class="detail-table" style="font-size: 14px; color: #444; line-height: 1.5;">
        <tr>
          <td style="padding: 6px 0; font-weight: 600; width: 140px;">Order ID:</td>
          <td style="padding: 6px 0; color: #666;">${order.id}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: 600;">Product:</td>
          <td style="padding: 6px 0; color: #666;">${order.product_name} (Size: ${order.size})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: 600;">Total Amount:</td>
          <td style="padding: 6px 0; color: #222; font-weight: bold;">${formattedPrice}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: 600;">Payment Method:</td>
          <td style="padding: 6px 0; color: #666;">${methodLabel} (${order.payment_status.toUpperCase()})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: 600;">Delivery Address:</td>
          <td style="padding: 6px 0; color: #666;">${order.address}</td>
        </tr>
      </table>
    </div>
    
    <p style="font-size: 14px; line-height: 1.6; color: #444; margin-bottom: 0;">
      Our team will contact you at your phone number (${order.phone}) to confirm delivery timings. 
      If you have any questions, feel free to reply to this email or call us directly.
    </p>
  `;

  // B. Owner Notification Email
  const ownerContentHtml = `
    <h3 style="font-family: Georgia, serif; font-size: 20px; color: #62101e; margin-top: 0; font-weight: normal;">New Order Received</h3>
    <p style="font-size: 14px; line-height: 1.6; color: #444; margin-bottom: 20px;">
      Hello Miss Hastag Admin,<br/><br/>
      A new customer order has been placed on the website. Here are the full customer and order details:
    </p>
    
    <div style="background-color: #fcfbf9; border: 1px solid #eaeaea; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h4 style="margin-top: 0; font-family: Georgia, serif; font-size: 16px; color: #222; border-bottom: 1px solid #eaeaea; padding-bottom: 8px;">Order Details</h4>
      <table width="100%" class="detail-table" style="font-size: 14px; color: #444; line-height: 1.5;">
        <tr>
          <td style="padding: 6px 0; font-weight: 600; width: 140px;">Customer Name:</td>
          <td style="padding: 6px 0; color: #666;">${order.customer_name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: 600;">Email:</td>
          <td style="padding: 6px 0; color: #666;"><a href="mailto:${order.email}">${order.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: 600;">Phone:</td>
          <td style="padding: 6px 0; color: #666;"><a href="tel:${order.phone}">${order.phone}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: 600;">Delivery Address:</td>
          <td style="padding: 6px 0; color: #666;">${order.address}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: 600;">Product Name:</td>
          <td style="padding: 6px 0; color: #666;">${order.product_name} (Size: ${order.size})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: 600;">Price:</td>
          <td style="padding: 6px 0; color: #222; font-weight: bold;">${formattedPrice}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: 600;">Payment Method:</td>
          <td style="padding: 6px 0; color: #666;">${methodLabel}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: 600;">Payment Status:</td>
          <td style="padding: 6px 0; color: #222; font-weight: bold; text-transform: uppercase;">${order.payment_status}</td>
        </tr>
      </table>
    </div>
    <p style="font-size: 14px; line-height: 1.6; color: #444; margin-bottom: 0;">
      Please login to the admin dashboard or check Supabase to process this order.
    </p>
  `;

  try {
    await Promise.all([
      transporter.sendMail({
        from: `"Miss Hastag" <${emailUser}>`,
        to: order.email,
        subject: `Order Confirmation - Miss Hastag Boutique (Order #${order.id.slice(0, 8)})`,
        html: buildResponsiveEmailHtml("Your Miss Hastag Order", customerContentHtml),
      }),
      transporter.sendMail({
        from: `"Miss Hastag Bot" <${emailUser}>`,
        to: ownerEmail,
        subject: `[New Order] ${order.customer_name} placed an order - ${formattedPrice}`,
        html: buildResponsiveEmailHtml("New Order Notification", ownerContentHtml),
      }),
    ]);
    console.log("Responsive order emails successfully dispatched.");
  } catch (err) {
    console.error("Failed to send order emails:", err);
  }
}

// 1. CREATE ORDER ACTION
export const createOrderAction = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(5),
      address: z.string().min(3),
      size: z.string(),
      productName: z.string(),
      productPrice: z.number(),
      paymentMethod: z.enum(["cod", "esewa", "khalti"]),
      website: z.string().optional(), // Honeypot field
    })
  )
  .handler(async ({ data }) => {
    console.log("Create order initiated on server:", data);

    // Honeypot bot protection
    if (data.website && data.website.trim() !== "") {
      console.warn("Bot order detected via honeypot. Ignoring.");
      return { success: true, message: "Order placed successfully (silently ignored spam)" };
    }

    const transactionUuid = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Insert order into Supabase
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        customer_name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        size: data.size,
        product_name: data.productName,
        product_price: data.productPrice,
        payment_method: data.paymentMethod,
        payment_status: "pending",
        transaction_uuid: transactionUuid,
      })
      .select()
      .single();

    if (orderErr || !order) {
      console.error("Supabase order creation error:", orderErr);
      throw new Error(`Failed to save order: ${orderErr?.message || "Unknown database error"}`);
    }

    // A. Cash on Delivery (COD) Flow
    if (data.paymentMethod === "cod") {
      // In COD, order is placed immediately with status pending
      await sendOrderEmails(order);
      return { success: true, paymentMethod: "cod", orderId: order.id };
    }

    // B. eSewa Flow
    if (data.paymentMethod === "esewa") {
      const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q"; // UAT fallback
      const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST"; // UAT fallback
      const siteUrl = process.env.VITE_SITE_URL || "http://localhost:8080";

      // Message signature format: total_amount,transaction_uuid,product_code
      const message = `total_amount=${order.product_price},transaction_uuid=${transactionUuid},product_code=${productCode}`;
      
      const hmac = crypto.createHmac("sha256", secretKey);
      hmac.update(message);
      const signature = hmac.digest("base64");

      const esewaParams = {
        amount: order.product_price.toString(),
        tax_amount: "0",
        service_charge: "0",
        delivery_charge: "0",
        product_service_charge: "0",
        total_amount: order.product_price.toString(),
        product_code: productCode,
        transaction_uuid: transactionUuid,
        success_url: `${siteUrl}/payment-success?gateway=esewa`,
        failure_url: `${siteUrl}/payment-failure`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: signature,
      };

      return {
        success: true,
        paymentMethod: "esewa",
        orderId: order.id,
        esewaParams,
      };
    }

    // C. Khalti Flow
    if (data.paymentMethod === "khalti") {
      const khaltiSecretKey = process.env.KHALTI_SECRET_KEY;
      const siteUrl = process.env.VITE_SITE_URL || "http://localhost:8080";

      if (!khaltiSecretKey) {
        console.error("KHALTI_SECRET_KEY missing in environment variables.");
        throw new Error("Khalti payment gateway is not properly configured on server.");
      }

      // Khalti amount is in paisa (1 NPR = 100 Paisa)
      const amountInPaisa = order.product_price * 100;

      try {
        const response = await fetch("https://dev.khalti.com/api/v2/epayment/initiate/", {
          method: "POST",
          headers: {
            "Authorization": `Key ${khaltiSecretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            return_url: `${siteUrl}/payment-success?gateway=khalti`,
            website_url: siteUrl,
            amount: amountInPaisa,
            purchase_order_id: order.id,
            purchase_order_name: order.product_name,
            customer_info: {
              name: order.customer_name,
              email: order.email,
              phone: order.phone,
            },
          }),
        });

        const khaltiData = await response.json();

        if (!response.ok || !khaltiData.payment_url) {
          console.error("Khalti payment initiate failed:", khaltiData);
          throw new Error(khaltiData.detail || khaltiData.message || "Failed to initialize Khalti transaction.");
        }

        // Save pidx to order
        const { error: updateErr } = await supabase
          .from("orders")
          .update({ payment_pidx: khaltiData.pidx })
          .eq("id", order.id);

        if (updateErr) {
          console.error("Failed to update order with Khalti pidx:", updateErr);
        }

        return {
          success: true,
          paymentMethod: "khalti",
          orderId: order.id,
          paymentUrl: khaltiData.payment_url,
        };
      } catch (err: any) {
        console.error("Khalti checkout integration error:", err);
        throw new Error(err.message || "Something went wrong while connecting with Khalti.");
      }
    }

    throw new Error("Invalid payment method.");
  });

// 2. VERIFY ESEWA PAYMENT ACTION
export const verifyEsewaPaymentAction = createServerFn({ method: "POST" })
  .inputValidator(z.object({ data: z.string() }))
  .handler(async ({ data }) => {
    console.log("Verifying eSewa payment signature...");

    try {
      const decodedString = Buffer.from(data.data, "base64").toString("utf-8");
      const resultObj = JSON.parse(decodedString);
      console.log("Decoded eSewa payload:", resultObj);

      if (resultObj.status !== "COMPLETE") {
        console.warn("eSewa payment status not COMPLETE:", resultObj.status);
        return { success: false, message: "Payment was not completed successfully." };
      }

      const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";

      // Reconstruct signature message
      const signedFields = resultObj.signed_field_names.split(",");
      const messageParts = signedFields.map((field: string) => `${field}=${resultObj[field]}`);
      const message = messageParts.join(",");

      const hmac = crypto.createHmac("sha256", secretKey);
      hmac.update(message);
      const computedSignature = hmac.digest("base64");

      if (computedSignature !== resultObj.signature) {
        console.error("Signature mismatch on eSewa validation!");
        return { success: false, message: "Security signature check failed." };
      }

      // Fetch order matching transaction UUID
      const { data: order, error: fetchErr } = await supabase
        .from("orders")
        .select("*")
        .eq("transaction_uuid", resultObj.transaction_uuid)
        .single();

      if (fetchErr || !order) {
        console.error("Failed to find order for eSewa transaction:", resultObj.transaction_uuid);
        return { success: false, message: "Order not found." };
      }

      if (order.payment_status === "completed") {
        return { success: true, order };
      }

      // Update payment status to completed
      const { data: updatedOrder, error: updateErr } = await supabase
        .from("orders")
        .update({ payment_status: "completed" })
        .eq("id", order.id)
        .select()
        .single();

      if (updateErr || !updatedOrder) {
        console.error("Failed to update order payment status:", updateErr);
        return { success: false, message: "Failed to update order payment status." };
      }

      // Send confirmation emails
      await sendOrderEmails(updatedOrder);

      return { success: true, order: updatedOrder };
    } catch (err: any) {
      console.error("Unexpected error verifying eSewa payment:", err);
      return { success: false, message: err.message || "Failed to verify eSewa payment." };
    }
  });

// 3. VERIFY KHALTI PAYMENT ACTION
export const verifyKhaltiPaymentAction = createServerFn({ method: "POST" })
  .inputValidator(z.object({ pidx: z.string() }))
  .handler(async ({ data }) => {
    console.log("Verifying Khalti payment status with pidx:", data.pidx);

    const khaltiSecretKey = process.env.KHALTI_SECRET_KEY;
    if (!khaltiSecretKey) {
      console.error("KHALTI_SECRET_KEY missing. Cannot lookup Khalti payment.");
      return { success: false, message: "Khalti gateway configuration error." };
    }

    try {
      const response = await fetch("https://dev.khalti.com/api/v2/epayment/lookup/", {
        method: "POST",
        headers: {
          "Authorization": `Key ${khaltiSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pidx: data.pidx }),
      });

      const lookupData = await response.json();
      console.log("Khalti Lookup API Response:", lookupData);

      if (!response.ok || lookupData.status !== "Completed") {
        console.warn("Khalti payment verification failed:", lookupData);
        return { success: false, message: `Khalti payment status is: ${lookupData.status || "Unknown"}` };
      }

      // Retrieve order with matching pidx
      const { data: order, error: fetchErr } = await supabase
        .from("orders")
        .select("*")
        .eq("payment_pidx", data.pidx)
        .single();

      if (fetchErr || !order) {
        console.error("Failed to find order for Khalti pidx:", data.pidx);
        return { success: false, message: "Order not found." };
      }

      if (order.payment_status === "completed") {
        return { success: true, order };
      }

      // Update payment status to completed
      const { data: updatedOrder, error: updateErr } = await supabase
        .from("orders")
        .update({ payment_status: "completed" })
        .eq("id", order.id)
        .select()
        .single();

      if (updateErr || !updatedOrder) {
        console.error("Failed to update order status:", updateErr);
        return { success: false, message: "Failed to update order status." };
      }

      // Send confirmation emails
      await sendOrderEmails(updatedOrder);

      return { success: true, order: updatedOrder };
    } catch (err: any) {
      console.error("Unexpected error verifying Khalti payment:", err);
      return { success: false, message: err.message || "Failed to verify Khalti payment." };
    }
  });

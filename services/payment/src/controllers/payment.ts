import { TryCatch } from "../utils/TryCatch.js";
import { AuthenticatedRequest } from "../middleware/user.js";
import ErrorHandler from "../utils/errorHandler.js";
import sql from "../utils/db.js";
import { instance, PRICE_PER_DAY } from "../config/sslcommerz.config.js";
import { Request, Response } from "express";

export const checkOut = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    throw new ErrorHandler(401, "No valid user");
  }

  const user_id = req.user.user_id;
  const { days } = req.body;

  if (!days) {
    throw new ErrorHandler(400, "Please specify subscription duration in days");
  }

  const subscriptionDays = parseInt(days);
  if (isNaN(subscriptionDays) || subscriptionDays <= 0) {
    throw new ErrorHandler(
      400,
      "Invalid number of days. Please provide a positive number",
    );
  }

  if (subscriptionDays > 30) {
    throw new ErrorHandler(400, "Maximum subscription duration is 30 days");
  }

  if (subscriptionDays < 1) {
    throw new ErrorHandler(400, "Minimum subscription duration is 1 day");
  }

  const totalAmount = subscriptionDays * PRICE_PER_DAY;

  const [user] = await sql`
    SELECT * FROM users WHERE user_id = ${user_id}
  `;

  const subTime = user?.subscription
    ? new Date(user.subscription).getTime()
    : 0;
  const now = Date.now();
  const isSubscribed = subTime > now;

  if (isSubscribed) {
    const remainingDays = Math.ceil((subTime - now) / (1000 * 60 * 60 * 24));
    throw new ErrorHandler(
      400,
      `You already have an active subscription for ${remainingDays} more days`,
    );
  }

  const tran_id = `SUB_${user_id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const paymentData = {
    total_amount: totalAmount,
    currency: "BDT",
    tran_id: tran_id,
    success_url: `${process.env.BASE_URL}/api/payment/success`,
    fail_url: `${process.env.BASE_URL}/api/payment/fail`,
    cancel_url: `${process.env.BASE_URL}/api/payment/cancel`,
    ipn_url: `${process.env.BASE_URL}/api/payment/ipn`,
    shipping_method: "No",
    product_name: `HireHeaven - ${subscriptionDays} Day${subscriptionDays > 1 ? "s" : ""} Subscription`,
    product_category: "Subscription",
    product_profile: "Digital",
    cus_name: user?.name || "Customer",
    cus_email: user?.email,
    cus_add1: "N/A",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1230",
    cus_country: "Bangladesh",
    cus_phone: user?.phone_number || "01700000000",
    value_a: user_id.toString(),
    value_b: tran_id,
    value_c: totalAmount.toString(),
    value_d: subscriptionDays.toString(),
  };

  try {
    const apiResponse = await instance.init(paymentData);

    if (apiResponse.status === "SUCCESS" && apiResponse.GatewayPageURL) {
      console.log("✅ Payment initiated successfully");
      console.log("Gateway URL:", apiResponse.GatewayPageURL);

      return res.status(200).json({
        success: true,
        message: "Payment initiated successfully",
        gatewayUrl: apiResponse.GatewayPageURL,
        tran_id: tran_id,
        days: subscriptionDays,
        amount: totalAmount,
        user_id: user_id,
        user_email: user?.email,
      });
    } else {
      console.error("❌ Payment initiation failed:", apiResponse?.failedreason);

      return res.status(400).json({
        success: false,
        message: apiResponse?.failedreason || "Payment initiation failed",
        error: apiResponse,
      });
    }
  } catch (error: any) {
    console.error("❌ SSLCommerz initialization error:", error);
    throw new ErrorHandler(500, error.message || "Payment gateway error");
  }
});

export const paymentVerification = TryCatch(
  async (req: Request, res: Response) => {
    console.log("🔔 PAYMENT VERIFICATION CALLED");
    console.log("📦 Request body:", JSON.stringify(req.body, null, 2));

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

    // Get payment data from SSLCommerz POST
    const { val_id, tran_id, status } = req.body;

    // If missing fields or invalid status, redirect to frontend with error
    if (!val_id || !tran_id || status !== "VALID") {
      console.error("❌ Invalid payment:", { val_id, tran_id, status });
      const params = new URLSearchParams({
        status: "failed",
        tran_id: tran_id || "unknown",
      });
      return res.redirect(`${FRONTEND_URL}/payment/failed?${params}`);
    }

    try {
      // Validate with SSLCommerz
      const validation = await instance.validate({ val_id });
      console.log("✅ Validation response:", validation);

      if (validation.status !== "VALID" && validation.status !== "VALIDATED") {
        console.error("❌ Payment validation failed:", validation);
        const params = new URLSearchParams({
          status: "failed",
          tran_id: tran_id,
        });
        return res.redirect(`${FRONTEND_URL}/payment/failed?${params}`);
      }

      // Extract user_id and subscription details from value_a/c/d
      const user_id = validation.value_a ? parseInt(validation.value_a) : 0;
      const subscriptionDays = validation.value_d
        ? parseInt(validation.value_d)
        : 1;
      const amount = validation.value_c ? parseFloat(validation.value_c) : 0;

      if (!user_id) {
        console.error("❌ User ID not found in validation response");
        const params = new URLSearchParams({
          status: "failed",
          tran_id: tran_id,
        });
        return res.redirect(`${FRONTEND_URL}/payment/failed?${params}`);
      }

      // Check current subscription
      const [currentUser] = await sql`
        SELECT subscription FROM users WHERE user_id = ${user_id}
      `;

      const currentSubTime = currentUser?.subscription
        ? new Date(currentUser.subscription).getTime()
        : 0;
      const now = Date.now();
      const hasActiveSubscription = currentSubTime > now;

      let expiryDate: Date;

      if (hasActiveSubscription) {
        expiryDate = new Date(currentSubTime);
        expiryDate.setDate(expiryDate.getDate() + subscriptionDays);
        console.log(`🔄 Extending subscription by ${subscriptionDays} days`);
      } else {
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + subscriptionDays);
        console.log(`✨ New subscription for ${subscriptionDays} days`);
      }

      // Update subscription in DB
      const [updatedUser] = await sql`
        UPDATE users 
        SET subscription = ${expiryDate}
        WHERE user_id = ${user_id}
        RETURNING user_id, name, email, subscription
      `;

      if (!updatedUser) {
        console.error("❌ User not found with ID:", user_id);
        const params = new URLSearchParams({
          status: "failed",
          tran_id: tran_id,
        });
        return res.redirect(`${FRONTEND_URL}/payment/failed?${params}`);
      }

      console.log(`✅ Payment successful for user: ${updatedUser.email}`);
      console.log(`   Transaction ID: ${tran_id}`);
      console.log(`   Amount: ${amount} BDT`);
      console.log(`   Days: ${subscriptionDays}`);
      console.log(`   Expires: ${expiryDate}`);

      // Redirect to frontend success page with details
      const params = new URLSearchParams({
        status: "success",
        amount: amount.toString(),
        days: subscriptionDays.toString(),
        expiry: expiryDate.toISOString(),
      });

      return res.redirect(
        `${FRONTEND_URL}/payment/${encodeURIComponent(tran_id)}?${params}`,
      );
    } catch (error: any) {
      console.error("❌ Payment verification error:", error);
      const params = new URLSearchParams({
        status: "failed",
        tran_id: tran_id || "unknown",
      });
      return res.redirect(`${FRONTEND_URL}/payment/failed?${params}`);
    }
  },
);

export const handleIPN = TryCatch(async (req: Request, res: Response) => {
  console.log("\n" + "=".repeat(60));
  console.log("📡 IPN RECEIVED FROM SSLCOMMERZ");
  console.log("Full IPN Data:", JSON.stringify(req.body, null, 2));
  console.log("=".repeat(60));

  // Extract data from IPN
  const {
    status,
    tran_id,
    val_id,
    amount,
    store_amount,
    card_type,
    bank_tran_id,
    tran_date,
    value_a, // This contains user_id
    value_b, // This contains tran_id
    value_c, // This contains amount
    value_d, // This contains subscription days
  } = req.body;

  // Validate required fields
  if (!tran_id || !val_id || !status) {
    console.error("❌ IPN: Missing required fields");
    return res.status(400).send("Missing required fields");
  }

  // Only process if payment is VALID
  if (status !== "VALID") {
    console.log(`⚠️ IPN: Payment status is ${status}, not processing`);
    return res.status(200).send("OK");
  }

  try {
    // Get user_id from value_a (stored during checkout)
    const user_id = value_a ? parseInt(value_a) : null;

    if (!user_id) {
      console.error("❌ IPN: User ID not found in value_a");
      return res.status(400).send("User ID not found");
    }

    // Get subscription days from value_d
    const subscriptionDays = value_d ? parseInt(value_d) : 1;
    const paidAmount = value_c ? parseFloat(value_c) : 0;

    console.log(`📝 IPN Processing:`);
    console.log(`   User ID: ${user_id}`);
    console.log(`   Transaction: ${tran_id}`);
    console.log(`   val_id: ${val_id}`);
    console.log(`   Amount: ${paidAmount} BDT`);
    console.log(`   Days: ${subscriptionDays}`);
    console.log(`   Card: ${card_type}`);
    console.log(`   Bank Tran ID: ${bank_tran_id}`);
    console.log(`   Transaction Date: ${tran_date}`);

    // Check if user already has active subscription
    const [currentUser] = await sql`
      SELECT subscription FROM users WHERE user_id = ${user_id}
    `;

    const currentSubTime = currentUser?.subscription
      ? new Date(currentUser.subscription).getTime()
      : 0;
    const now = Date.now();
    const hasActiveSubscription = currentSubTime > now;

    let expiryDate: Date;

    if (hasActiveSubscription) {
      // Extend existing subscription
      expiryDate = new Date(currentSubTime);
      expiryDate.setDate(expiryDate.getDate() + subscriptionDays);
      console.log(`🔄 Extending subscription by ${subscriptionDays} days`);
    } else {
      // New subscription
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + subscriptionDays);
      console.log(`✨ New subscription for ${subscriptionDays} days`);
    }

    // Update user's subscription in database
    const [updatedUser] = await sql`
      UPDATE users 
      SET subscription = ${expiryDate}
      WHERE user_id = ${user_id}
      RETURNING user_id, name, email, subscription
    `;

    if (!updatedUser) {
      console.error(`❌ IPN: User ${user_id} not found`);
      return res.status(404).send("User not found");
    }

    // Log success
    console.log(`✅ IPN: Subscription updated successfully!`);
    console.log(`   User: ${updatedUser.email}`);
    console.log(`   New Expiry: ${expiryDate}`);
    console.log(`   Type: ${hasActiveSubscription ? "Extension" : "New"}`);

    // Always respond with 200 OK to acknowledge receipt
    return res.status(200).send("OK");
  } catch (error: any) {
    console.error("❌ IPN Error:", error);
    // Still return 200 to SSLCommerz to acknowledge receipt
    return res.status(200).send("OK");
  }
});

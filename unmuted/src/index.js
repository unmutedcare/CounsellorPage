const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { defineSecret } = require("firebase-functions/params");

admin.initializeApp();

// 🔐 Secrets
const RAZORPAY_KEY_ID = defineSecret("RAZORPAY_KEY_ID");
const RAZORPAY_KEY_SECRET = defineSecret("RAZORPAY_KEY_SECRET");

/* ============================================================
   CREATE RAZORPAY ORDER
============================================================ */
async function sendPushNotification(uid, title, body) {
  try {
    const userSnap = await admin.firestore().collection("Users").doc(uid).get();
    if (!userSnap.exists) return;

    const token = userSnap.data().fcmToken;
    if (!token) {
      console.log("No FCM token for user:", uid);
      return;
    }

    await admin.messaging().send({
      token,
      notification: { title, body },
      android: { priority: "high" },
    });

    console.log("Notification sent to:", uid);

  } catch (error) {
    console.error("Push notification failed:", error.message);
  }
}

exports.createRazorpayOrder = onCall(
  {
    region: "asia-south1",
    secrets: [RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET],
  },
  async (request) => {
    try {
      const auth = request.auth;
      const { sessionId } = request.data;

      // 🔒 Auth check
      if (!auth?.uid) {
        throw new HttpsError("unauthenticated", "Login required");
      }

      if (!sessionId) {
        throw new HttpsError("invalid-argument", "Session ID missing");
      }

      const sessionRef = admin
        .firestore()
        .collection("VideoCallSession")
        .doc(sessionId);

      const snap = await sessionRef.get();

      // ❌ Session not found
      if (!snap.exists) {
        throw new HttpsError("not-found", "Session not found");
      }

      const session = snap.data();
      const now = admin.firestore.Timestamp.now();
      console.log("NOW:", now.toDate());
      if (session.sessionTimestamp) {
        console.log("SESSION:", session.sessionTimestamp.toDate());
      }

      // ❌ Session expired
      if (
        !session.sessionTimestamp ||
        session.sessionTimestamp.toMillis() <= now.toMillis()
      ) {
        throw new HttpsError(
          "failed-precondition",
          "SESSION_EXPIRED"
        );
      }

      // ❌ Already paid
      if (session.status === "paid") {
        throw new HttpsError(
          "failed-precondition",
          "SESSION_ALREADY_PAID"
        );
      }

      const razorpay = new Razorpay({
        key_id: RAZORPAY_KEY_ID.value(),
        key_secret: RAZORPAY_KEY_SECRET.value(),
      });

      const amount = 49 * 100; // ₹49 in paise

      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: `receipt_${sessionId}`,
      });

      // ✅ Move session to payment_pending
      await sessionRef.update({
        status: "payment_pending",
        razorpayOrder: {
          orderId: order.id,
          amount,
          createdBy: auth.uid,
          status: "created",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      });
      // 🔔 Notify counsellor




      return {
        orderId: order.id,
        amount,
      };
    } catch (err) {
      console.error("createRazorpayOrder ERROR:", err);

      if (err instanceof HttpsError) throw err;
      throw new HttpsError("internal", err.message || "Order creation failed");
    }
  }
);

/* ============================================================
   VERIFY PAYMENT
============================================================ */
exports.verifyPayment = onCall(
  {
    region: "asia-south1",
    secrets: [RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET],
  },
  async (request) => {
    const auth = request.auth;
    const {
      sessionId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = request.data;

    // 🔒 Auth check
    if (!auth?.uid) {
      throw new HttpsError("unauthenticated", "Login required");
    }

    if (
      !sessionId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      throw new HttpsError("invalid-argument", "Missing payment data");
    }

    const sessionRef = admin
      .firestore()
      .collection("VideoCallSession")
      .doc(sessionId);

    const snap = await sessionRef.get();

    // ❌ Session not found
    if (!snap.exists) {
      throw new HttpsError("not-found", "Session not found");
    }

    const session = snap.data();
    const now = admin.firestore.Timestamp.now();

    // ❌ Session expired

    // ✅ Idempotent success
    if (session.status === "paid") {
      return { success: true, alreadyPaid: true };
    }

    // ❌ Must be awaiting payment
    if (session.status === "paid") {
      return { success: true, alreadyPaid: true };
    }

    if (
      session.status !== "payment_pending" &&
      session.status !== "created"
    ) {
      throw new HttpsError(
        "failed-precondition",
        "SESSION_UNAVAILABLE"
      );
    }


    // ❌ Order/user mismatch
    if (
      session.razorpayOrder?.orderId !== razorpay_order_id ||
      session.razorpayOrder?.createdBy !== auth.uid
    ) {
      throw new HttpsError("permission-denied", "Order mismatch");
    }

    // 🔐 Verify Razorpay signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET.value())
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new HttpsError("permission-denied", "Invalid signature");
    }

    // ✅ Mark payment successful
    await sessionRef.update({
      status: "paid",
      razorpayPaymentId: razorpay_payment_id,
      paymentVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),

      reminderScheduled: false, // 👈 NEW
    });
    // 🔔 Notify counsellor AFTER payment success
    await sendCounsellorNotification(
      session.counsellorId,
      "New session booked 📅",
      "A student has booked a paid session with you."
    );


    await sendPushNotification(
      auth.uid,
      "Payment Successful 🎉",
      "Your counselling session is confirmed. We look forward to seeing you."
    );


    return { success: true };
  }
);
async function sendCounsellorNotification(counsellorId, title, body) {
  try {
    const snap = await admin
      .firestore()
      .collection("Counsellors")
      .doc(counsellorId)
      .get();

    if (!snap.exists) return;

    const token = snap.data().fcmToken;
    if (!token) return;

    await admin.messaging().send({
      token,
      notification: { title, body },
      android: { priority: "high" },
    });

  } catch (error) {
    console.error("Counsellor notification failed:", error.message);
  }
}


const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { CloudTasksClient } = require("@google-cloud/tasks");

const tasksClient = new CloudTasksClient();
const PROJECT = process.env.GCLOUD_PROJECT;
console.log("PROJECT:", PROJECT);

const LOCATION = "asia-south1";
const QUEUE = "session-reminders";

exports.scheduleSessionReminder = onDocumentUpdated(
  {
    document: "VideoCallSession/{sessionId}",
    region: "asia-south1",
  },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    // Only when payment JUST became successful
    if (
      before.status === "payment_pending" &&
      after.status === "paid" &&
      !after.reminderScheduled
    ) {
      const sessionTime = after.sessionTimestamp.toDate();
      const reminderTime = new Date(
        sessionTime.getTime() - 5 * 60 * 1000
      );
      const now = new Date();

      if (reminderTime <= now) {
        console.log("Reminder time already passed, skipping scheduling");
        return;
      }


      const parent = tasksClient.queuePath(
        PROJECT,
        LOCATION,
        QUEUE
      );

      const task = {
        httpRequest: {
          httpMethod: "POST",
          url: `https://${LOCATION}-${PROJECT}.cloudfunctions.net/sendSessionReminder`,
          headers: {
            "Content-Type": "application/json",
          },
          oidcToken: {
            serviceAccountEmail: `${PROJECT}@appspot.gserviceaccount.com`,
          },
          body: Buffer.from(JSON.stringify({
            uid: after.uid,

            sessionId: event.params.sessionId,
          })).toString("base64"),
        },

        scheduleTime: {
          seconds: Math.floor(reminderTime.getTime() / 1000),
        },
      };

      try {
        await tasksClient.createTask({ parent, task });
      } catch (err) {
        console.error("Failed to create reminder task:", err);
        return;
      }


      await event.data.after.ref.update({
        reminderScheduled: true,
      });
    }
  }
);
const { onRequest } = require("firebase-functions/v2/https");

exports.sendSessionReminder = onRequest(
  { region: "asia-south1" },
  async (req, res) => {
    if (!req.headers.authorization) {
      return res.status(401).send("Unauthorized");
    }

    const { uid } = req.body;

    if (!uid) {
      console.log("No uid provided for reminder");
      return res.status(400).send("Missing uid");
    }

    await sendPushNotification(
      uid,
      "Session starting soon ⏰",
      "Your counselling session starts in 5 minutes. Tap to join."
    );

    res.status(200).send("Reminder sent");
  }
);
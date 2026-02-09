import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase/firebase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function PaymentPage() {
    const navigate = useNavigate();
    const sessionId = new URLSearchParams(window.location.search).get("sessionId");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!sessionId) {
            alert("Session expired. Please book again.");
            navigate("/student/dashboard");
        }
    }, [sessionId, navigate]);

    const handlePayment = async () => {
        if (!sessionId) return;

        try {
            setLoading(true);
            const createOrder = httpsCallable(functions, "createRazorpayOrder");

            const res: any = await createOrder({ sessionId });
            const { orderId, amount } = res.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount,
                currency: "INR",
                name: "Counselling Session",
                description: "Student Support Session",
                order_id: orderId,

                handler: async (response: any) => {
                    await verifyPayment(response);
                },

                theme: {
                    color: "#2e7d32",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err: any) {
            alert(err.message || "Payment failed");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const verifyPayment = async (payment: any) => {
        try {
            setLoading(true);
            const verify = httpsCallable(functions, "verifyPayment");

            await verify({
                sessionId,
                razorpay_order_id: payment.razorpay_order_id,
                razorpay_payment_id: payment.razorpay_payment_id,
                razorpay_signature: payment.razorpay_signature,
            });

            alert("Payment successful 🎉");
            navigate(`/student/countdown?sessionId=${sessionId}`);

        } catch (err) {
            alert("Payment verification failed");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{css}</style>
            
                <div className="payment-card">
                    <div className="card-icon">💳</div>
                    <h1 className="card-title">Complete Your Booking</h1>
                    <p className="card-subtitle">Secure payment for your counselling session</p>

                    <div className="price-box">
                        <span className="price-label">Session Fee</span>
                        <span className="price-amount">₹49</span>
                        <span className="price-note">30-minute session</span>
                    </div>

                    <div className="features-box">
                        <div className="feature-item">
                            <span className="feature-check">✓</span>
                            <span>Professional licensed counselor</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-check">✓</span>
                            <span>100% private and secure</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-check">✓</span>
                            <span>Join from anywhere</span>
                        </div>
                    </div>

                    <button
                        className="pay-btn"
                        onClick={handlePayment}
                        disabled={loading}
                    >
                        {loading ? "Processing..." : "Pay ₹49 Now"}
                    </button>

                    <p className="secure-note">🔐 Secured by Razorpay</p>
                </div>
            
        </>
    );
}

const css = `
.payment-page {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-card {
  background: white;
  border-radius: 24px;
  padding: 40px 32px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.card-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: #1b5e20;
  margin: 0 0 8px 0;
}

.card-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0 0 28px 0;
}

.price-box {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.price-label {
  display: block;
  font-size: 12px;
  color: #558b2f;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.price-amount {
  display: block;
  font-size: 48px;
  font-weight: 800;
  color: #1b5e20;
  margin-bottom: 4px;
}

.price-note {
  font-size: 13px;
  color: #558b2f;
}

.features-box {
  text-align: left;
  margin-bottom: 28px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #333;
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-check {
  width: 24px;
  height: 24px;
  background: #e8f5e9;
  color: #43a047;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.pay-btn {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #43a047, #2e7d32);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(46, 125, 50, 0.3);
}

.pay-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 125, 50, 0.4);
}

.pay-btn:disabled {
  background: #a5d6a7;
  cursor: not-allowed;
  box-shadow: none;
}

.secure-note {
  margin-top: 16px;
  font-size: 12px;
  color: #9e9e9e;
}
`;

import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase/firebase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ShieldCheck, Zap, Wind, CreditCard, ChevronRight } from "lucide-react";

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
                name: "Unmuted Support",
                description: "Private Counseling Session",
                order_id: orderId,

                handler: async (response: any) => {
                    await verifyPayment(response);
                },

                theme: {
                    color: "#10b981",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err: any) {
            alert(err.message || "Payment processing failed. Please check your credentials.");
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

            alert("Session confirmed successfully 🎉");
            navigate(`/student/countdown?sessionId=${sessionId}`);

        } catch (err) {
            alert("Verification failed. Please contact support.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-[#0a0a0c] text-white flex items-center justify-center p-6 overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary opacity-5 blur-[150px] rounded-full animate-pulse-glow" />
            
            <div className="relative z-10 w-full max-w-[540px] reveal">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 glass-panel border border-white/10 rounded-full mb-6">
                        <CreditCard size={14} className="text-brand-primary" />
                        <span className="text-[10px] font-luxury uppercase tracking-[0.2em] text-white/60">Session Confirmation</span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tighter mb-4">Complete your <span className="text-gradient italic">booking</span></h1>
                    <p className="text-white/40 text-lg font-light tracking-wide">Secure your appointment with professional support.</p>
                </div>

                {/* Pricing Card */}
                <div className="glass-panel p-10 border border-white/5 shadow-2xl relative overflow-hidden mb-10">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <Sparkles size={80} />
                    </div>

                    <div className="bg-white/[0.03] rounded-3xl p-8 text-center mb-10 border border-white/5 shadow-inner">
                        <span className="text-[10px] font-luxury tracking-[0.3em] text-brand-primary block mb-4 uppercase">Booking Fee</span>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-3xl font-light opacity-40 italic">₹</span>
                            <span className="text-7xl font-bold tracking-tighter">49</span>
                        </div>
                        <p className="text-white/30 text-sm mt-4 font-light italic tracking-wider">Professional counseling per 30-min session</p>
                    </div>

                    <div className="space-y-6 mb-10">
                        <Feature icon={<ShieldCheck size={18} className="text-brand-primary" />} text="Certified Peer Counselor" />
                        <Feature icon={<Wind size={18} className="text-brand-secondary" />} text="Private & Secure Connection" />
                        <Feature icon={<Zap size={18} className="text-brand-primary" />} text="Instant Portal Access" />
                    </div>

                    <button
                        className="btn-action w-full py-5 text-xl shadow-brand-primary/20 group"
                        onClick={handlePayment}
                        disabled={loading}
                    >
                        <div className="flex items-center justify-center gap-3">
                            <span>{loading ? "Confirming..." : "Process Payment"}</span>
                            {!loading && <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />}
                        </div>
                    </button>
                </div>

                <div className="text-center opacity-30 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={14} />
                        <span className="text-[10px] font-luxury tracking-[0.2em] uppercase">Verified by Razorpay</span>
                    </div>
                    <p className="text-[9px] font-luxury tracking-[0.1em] uppercase leading-loose max-w-xs">
                        All financial data is processed securely through industry-standard encryption protocols.
                    </p>
                </div>
            </div>
        </div>
    );
}

const Feature = ({ icon, text }: { icon: any, text: string }) => (
    <div className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0 transition-all hover:translate-x-2">
        <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0">
            {icon}
        </div>
        <span className="text-lg font-light text-white/70 tracking-wide">{text}</span>
    </div>
);

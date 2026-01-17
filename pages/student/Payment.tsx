
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Button';
import { CreditCard, Lock, Calendar, User, CheckCircle2 } from 'lucide-react';

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { selectedSlot } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if no slot selected
  useEffect(() => {
    if (!selectedSlot) navigate('/student/select-timing');
  }, [selectedSlot, navigate]);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      // Wait a moment then redirect
      setTimeout(() => {
         navigate('/student/emotion-selection');
      }, 1000);
    }, 2000);
  };

  if (success) {
      return (
          <div className="flex flex-col items-center justify-center flex-grow animate-in zoom-in">
              <div className="bg-white/90 p-8 rounded-full shadow-xl mb-6">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#3E5C35]">Payment Successful!</h2>
              <p className="text-[#5B8C5A]">Redirecting to details...</p>
          </div>
      )
  }

  return (
    <div className="flex flex-col flex-grow pt-4 animate-in slide-in-from-right-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#3E5C35]">Secure Payment</h2>
        <p className="text-[#5B8C5A]">Confirm your session booking.</p>
      </div>

      {/* Order Summary */}
      <div className="bg-white/60 rounded-2xl p-4 mb-6 border border-white/50">
        <h3 className="text-sm font-bold text-gray-700 uppercase mb-2 tracking-wider">Order Summary</h3>
        <div className="flex justify-between items-center mb-1">
            <span className="text-gray-800 font-semibold">Counseling Session</span>
            <span className="text-gray-800 font-bold">₹49.00</span>
        </div>
        <div className="text-sm text-gray-600 flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            {selectedSlot?.day}, {selectedSlot?.time}
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handlePayment} className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg space-y-4">
         <div className="space-y-1">
             <label className="text-xs font-bold text-gray-500 ml-1">Card Number</label>
             <div className="relative">
                 <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                 <input 
                    required
                    type="text" 
                    placeholder="0000 0000 0000 0000"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 font-mono"
                 />
             </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">Expiry</label>
                <input 
                    required
                    type="text" 
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 text-center"
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">CVC</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        required
                        type="password" 
                        placeholder="123"
                        maxLength={3}
                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 text-center"
                    />
                </div>
            </div>
         </div>

         <div className="space-y-1">
             <label className="text-xs font-bold text-gray-500 ml-1">Cardholder Name</label>
             <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                 <input 
                    required
                    type="text" 
                    placeholder="Name on Card"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                 />
             </div>
         </div>

         <div className="pt-2">
            <Button fullWidth type="submit" disabled={isLoading} variant="primary">
                {isLoading ? 'Processing...' : 'Pay & Confirm'}
            </Button>
            <div className="flex items-center justify-center gap-1 mt-3 text-xs text-gray-500">
                <Lock className="w-3 h-3" />
                Payments are secure and encrypted
            </div>
         </div>
      </form>
    </div>
  );
};

export default Payment;

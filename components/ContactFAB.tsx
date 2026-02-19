import React, { useState } from "react";
import { MessageCircle, X, Phone, Mail, FileText, AlertCircle, HeartHandshake } from "lucide-react";

const ContactFAB: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[100] w-14 h-14 rounded-full bg-[#ff2d55] text-white flex items-center justify-center shadow-2xl shadow-[#ff2d55]/40 hover:scale-110 transition-transform duration-300 group"
      >
        <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0a0a0c] border border-white/10 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <HeartHandshake size={20} className="text-[#ff2d55]" />
                <h2 className="text-lg font-bold text-white tracking-tight">Support & Policy</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Scroll */}
            <div className="p-6 overflow-y-auto no-scrollbar space-y-8">
              
              {/* Contact Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-luxury tracking-[0.2em] text-white/40 uppercase">Direct Line</h3>
                <div className="glass-panel p-4 flex items-center gap-4 hover:border-[#5856d6]/50 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-[#5856d6]/10 flex items-center justify-center group-hover:bg-[#5856d6] transition-colors">
                    <Mail size={18} className="text-[#5856d6] group-hover:text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Email Support</p>
                    <p className="text-xs text-white/50">unmutedcare@gmail.com</p>
                  </div>
                </div>
              </div>

              {/* Helplines Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-luxury tracking-[0.2em] text-white/40 uppercase">Emergency Helplines (India)</h3>
                <div className="grid grid-cols-1 gap-3">
                  <HelplineCard name="Vandrevala Foundation" number="1860-266-2345" />
                  <HelplineCard name="iCall" number="9152987821" />
                  <HelplineCard name="Kiran (Govt)" number="1800-599-0019" />
                </div>
              </div>

              {/* Terms Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-luxury tracking-[0.2em] text-white/40 uppercase flex items-center gap-2">
                  <FileText size={12} />
                  Terms & Conditions
                </h3>
                <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/5 text-xs text-white/60 leading-relaxed space-y-3 font-light">
                  <p><strong className="text-[#ff2d55]">Fee Disclosure:</strong> All sessions are paid sessions. A fee of <span className="text-white">₹49</span> will be charged at the time of booking to schedule a session with a peer counselor.</p>
                  
                  <div className="h-[1px] bg-white/5 my-2" />
                  
                  <p><strong className="text-white">Refund Policy:</strong></p>
                  <ul className="list-disc pl-4 space-y-1 marker:text-[#5856d6]">
                    <li>Full refund for cancellations made <span className="text-white">24 hours or more</span> before the session.</li>
                    <li>No refund for cancellations less than 24 hours before the session.</li>
                    <li>No refund for no-show or failure to attend.</li>
                    <li>No refund for technical issues (network/device) on the user's side.</li>
                    <li>No refund based on dissatisfaction after session completion.</li>
                    <li>No refund for violations of platform policies.</li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-white/[0.02] text-center">
              <p className="text-[10px] text-white/20 font-luxury tracking-[0.2em] uppercase">Unmuted • Est. 2026</p>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

const HelplineCard = ({ name, number }: { name: string, number: string }) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
    <div className="flex items-center gap-3">
      <Phone size={14} className="text-[#4caf50]" />
      <span className="text-sm text-white/80">{name}</span>
    </div>
    <a href={`tel:${number}`} className="text-xs font-mono text-[#4caf50] hover:underline">{number}</a>
  </div>
);

export default ContactFAB;

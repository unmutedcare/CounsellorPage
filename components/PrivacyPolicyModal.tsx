import React from "react";
import { X, ShieldCheck, ScrollText } from "lucide-react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <ShieldCheck size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Privacy Policy</h2>
              <p className="text-[10px] font-luxury tracking-[0.2em] text-white/30 uppercase">Last updated: 5 January 2026</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Scroll */}
        <div className="p-8 overflow-y-auto no-scrollbar text-white/70 space-y-8 font-light leading-relaxed">
          <div className="space-y-4">
            <p>Unmuted (“we”, “our”, or “us”) operates the Unmuted mobile application (the “App”). This Privacy Policy explains how we collect, use, store, and protect your information when you use the App.</p>
            <p>By accessing or using Unmuted, you agree to the collection and use of information as described in this Privacy Policy.</p>
          </div>

          <section className="space-y-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <ScrollText size={18} className="text-blue-400" />
              1. Information We Collect
            </h3>
            <p>We collect limited personal information that is necessary for the functioning of the App.</p>
            <div className="bg-white/5 p-6 rounded-3xl space-y-3">
              <p className="text-white font-medium">Personal Information</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Name</li>
                <li>Email address</li>
              </ul>
              <p className="text-xs text-white/40">Users may sign up using an email address and password or through Google Sign-In.</p>
            </div>
            <div className="bg-red-500/5 p-6 rounded-3xl space-y-3 border border-red-500/10">
              <p className="text-red-400 font-medium text-sm uppercase tracking-widest">We do not collect:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Chat messages</li>
                <li>Journal entries</li>
                <li>Voice or audio recordings</li>
                <li>Payment or financial information</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-white font-bold text-lg">2. How We Use Your Information</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Creating and managing user accounts</li>
              <li>Authenticating users and enabling access to the App</li>
              <li>Sending essential account-related or app-related emails</li>
              <li>Operating, maintaining, and improving the App</li>
              <li>Understanding app usage at an internal and aggregate level</li>
            </ul>
            <p className="text-sm italic">We do not use user data for advertising or marketing purposes.</p>
          </section>

          <section className="space-y-4 bg-blue-500/5 p-8 rounded-[2rem] border border-blue-500/10 text-center">
            <h3 className="text-blue-400 font-bold text-xl uppercase tracking-tighter">3. Mental Health Disclaimer</h3>
            <p className="text-sm font-medium text-white/90">Unmuted provides peer-to-peer emotional support only.</p>
            <div className="text-xs space-y-2 text-white/50">
              <p>• Does not provide medical, psychological, psychiatric, or therapeutic services</p>
              <p>• Is not a substitute for professional mental health care</p>
              <p>• Should not be used for diagnosis, treatment, or crisis support</p>
            </div>
            <p className="text-xs text-red-400 mt-4 font-bold">If you are experiencing a mental health emergency, please seek immediate help from qualified professionals or local emergency services.</p>
          </section>

          <section className="space-y-4">
            <h3 className="text-white font-bold text-lg">4. Data Storage and Security</h3>
            <p className="text-sm">User data is stored and managed using Firebase, a cloud-based backend service. Access to personal data is restricted to authorized backend personnel only. We take reasonable technical measures to protect user information, though no method is 100% secure.</p>
          </section>

          <section className="space-y-4">
            <h3 className="text-white font-bold text-lg">5. Data Sharing</h3>
            <p className="text-sm">We do not sell, rent, or trade personal information. User data is shared only with service providers like Firebase for infrastructure. No personal data is shared with other users, peers, or mentors.</p>
          </section>

          <section className="space-y-4">
            <h3 className="text-white font-bold text-lg">6. Data Retention and Deletion</h3>
            <p className="text-sm">We retain info only as long as necessary. Users may request account deletion by emailing us.</p>
          </section>

          <section className="space-y-4">
            <h3 className="text-white font-bold text-lg">7. Children’s Privacy</h3>
            <p className="text-sm">Unmuted is intended for users 16 years of age and older. We do not knowingly collect information from anyone under 16.</p>
          </section>

          <section className="space-y-4">
            <h3 className="text-white font-bold text-lg">8. Contact Information</h3>
            <p className="text-sm">Email: <span className="text-blue-400">unmutedcare@gmail.com</span></p>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="p-8 border-t border-white/5 bg-white/[0.02] flex flex-col gap-4">
          <button
            onClick={onAccept}
            className="w-full py-5 bg-white text-blue-600 rounded-full font-bold text-xl shadow-2xl hover:scale-[1.02] transition-all active:scale-95"
          >
            I Agree & Accept
          </button>
          <p className="text-center text-[10px] text-white/20 uppercase tracking-widest font-luxury">
            By clicking above, you acknowledge you have read and understood our terms.
          </p>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicyModal;

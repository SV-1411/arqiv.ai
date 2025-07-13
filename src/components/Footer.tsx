import React, { useState } from 'react';

export const Footer: React.FC = () => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const Popover: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({title, onClose, children}) => (
    <div className="absolute bottom-full mb-3 right-0 bg-surface-100 border border-surface-400 rounded-xl p-4 w-72 shadow-xl z-40">
      <h3 className="text-lg font-semibold mb-2 text-parchment-200">{title}</h3>
      <div className="text-xs text-gray-300 space-y-2 max-h-60 overflow-y-auto">{children}</div>
      <button onClick={onClose} className="mt-3 px-3 py-1 bg-accent-500 hover:bg-accent-600 rounded text-sm text-surface-50">Close</button>
    </div>
  );
  return (
    <footer className="border-t border-surface-400 bg-surface-100 bg-opacity-70 backdrop-blur-sm px-4 py-6 mt-24 text-sm text-gray-300">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <p className="font-mono tracking-wide">© {new Date().getFullYear()} arqivAi. All rights reserved.</p>
        <div className="flex space-x-6">
          {/* Terms */}
          <div className="relative">
            <button onClick={() => setShowTerms(prev=>!prev)} className="hover:text-accent-500 transition-colors">Terms</button>
            {showTerms && (
              <Popover title="Terms & Conditions" onClose={() => setShowTerms(false)}>
                <p>By using arqivAi you agree not to rely solely on AI-generated content for critical decisions. Data is provided "as-is" without warranty.</p>
                <p>Do not submit sensitive personal information. We reserve the right to update these terms at any time.</p>
              </Popover>
            )}
          </div>
          {/* Privacy */}
          <div className="relative">
            <button onClick={() => setShowPrivacy(prev=>!prev)} className="hover:text-accent-500 transition-colors">Privacy</button>
            {showPrivacy && (
              <Popover title="Privacy Policy" onClose={() => setShowPrivacy(false)}>
                <p>We respect your privacy. Query text is processed to generate results but not stored beyond what is necessary for functionality.</p>
                <p>Saved research is tied to your account and can be deleted at any time from the Saved page. We never sell your data.</p>
              </Popover>
            )}
          </div>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent-500 transition-colors">GitHub</a>
        </div>
      </div>
    </footer>

  );
};

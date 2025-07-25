import React from 'react';
import { Brain, Zap, ShieldCheck, Code } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-40"
      >
        <source src="/vid.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black via-stone-900/50 to-black z-10"></div>
      <div className="relative z-20 min-h-screen pt-40 pb-24 text-white space-y-20 overflow-y-auto">
        <div className="text-center px-4">
          <h1 className="text-6xl md:text-8xl font-black font-mono tracking-tighter text-shadow-lg">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Us.</span>
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-stone-200 mt-6">
            Basically, we're a bunch of digital hermits who thought, "Hey, what if Google wasn't so... chaotic?" So we built this. You're welcome.
          </p>
        </div>

        {/* Our "Values" */}
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Our Core (aka Values)</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-stone-900/60 backdrop-blur-xl border border-amber-800/50 p-8 rounded-2xl shadow-2xl hover:bg-stone-800/80 hover:border-amber-500/80 transition-all duration-300">
              <Zap className="w-12 h-12 text-amber-400 mb-4" />
              <h3 className="text-3xl font-bold text-amber-300 mb-2">Transparency</h3>
              <p className="text-stone-300 text-lg">We'll show you our sources. Unlike your friend who swears they saw a celebrity at the grocery store, we provide receipts.</p>
            </div>
            <div className="bg-stone-900/60 backdrop-blur-xl border border-amber-800/50 p-8 rounded-2xl shadow-2xl hover:bg-stone-800/80 hover:border-amber-500/80 transition-all duration-300">
              <ShieldCheck className="w-12 h-12 text-amber-400 mb-4" />
              <h3 className="text-3xl font-bold text-amber-300 mb-2">Privacy</h3>
              <p className="text-stone-300 text-lg">We respect your data. Your weird late-night searches are safe with us. We're not here to judge your sudden interest in competitive duck herding.</p>
            </div>
          </div>
        </div>

        {/* Meet the "Brainiacs" */}
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">The Usual Suspects</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Sam', role: 'Prompt Whisperer', emoji: '📝' },
              { name: 'Alex', role: 'Data Ninja', emoji: '🥷' },
              { name: 'Riley', role: 'Pixel Alchemist', emoji: '🎨' },
              { name: 'Jordan', role: 'Bug Slayer', emoji: '🕷️' }
            ].map((p) => (
              <div key={p.name} className="bg-stone-900/60 backdrop-blur-xl border border-amber-800/50 p-6 rounded-2xl text-center shadow-2xl hover:scale-105 hover:bg-stone-800/80 hover:border-amber-500/80 transition-all duration-300">
                <div className="text-5xl mb-4">{p.emoji}</div>
                <h3 className="text-2xl font-bold text-amber-300">{p.name}</h3>
                <p className="text-stone-300">{p.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">What's Next? (Probably)</h2>
            <p className="text-stone-300 text-lg">
                Look, we have a plan. It's written on a napkin somewhere. It involves more features, less sleep, and a concerning amount of coffee. Stay tuned.
            </p>
            <a href="/ai" className="inline-block bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white px-10 py-4 rounded-full transition-all shadow-2xl mt-8 text-lg font-bold transform hover:scale-105">
                Go Bother the AI
            </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
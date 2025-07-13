import React from 'react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <>
      {/* Video disabled per request */}
      <section className="min-h-screen pt-32 pb-32 text-white text-center space-y-24 bg-[url('/brown.jpg')] bg-cover bg-center bg-fixed">
        {/* Hero */}
        <div className="space-y-8">
          <h1 className="text-6xl md:text-8xl font-black font-mono tracking-tighter text-shadow-lg">
            Welcome to <span className="text-amber-300">arqivAi</span>
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-stone-200">
            Your not-so-personal AI research companion. Ask ridiculously complex questions, get surprisingly coherent answers.
          </p>
          <Link to="/ai" className="inline-block bg-amber-400 hover:bg-amber-500 text-stone-900 px-10 py-4 rounded-full transition-all shadow-2xl mt-6 text-lg font-bold">
            Try the AI (If You Dare)
          </Link>
        </div>

        {/* About Section Preview */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img src="/research.png" alt="Research Illustration" className="w-full h-full object-cover" />
          </div>
          <div className="text-left space-y-4">
            <h2 className="text-5xl font-bold">Who Are We?</h2>
            <p className="text-stone-300 text-lg">
              A handful of nerds who got tired of bad search results. We're building tools to make knowledge less... annoying. By mixing scary-smart AI with a clean design, we help you find what you need, faster.
            </p>
            <Link to="/about" className="text-amber-400 hover:text-amber-500 font-bold text-lg">See the chaos →</Link>
          </div>
        </div>
          {/* Dopamine Feature Grid */}
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 md:grid-cols-2 gap-8 px-4">
        {[
          {
            title: 'Ask Anything',
            emoji: '🤯',
            desc: 'Drop wild questions, get mind-blowing answers. No cap.'
          },
          {
            title: 'Sources? Always.',
            emoji: '🔗',
            desc: 'Receipts included. Cite us in your group chat fights.'
          },
          {
            title: 'Speed Mode',
            emoji: '⚡',
            desc: 'Blink twice, boom—research delivered faster than memes go stale.'
          },
          {
            title: 'Mood Swings',
            emoji: '🎨',
            desc: 'Switch research depth & vibe. Shallow scroll or deep-dive rabbit hole.'
          },
          {
            title: 'Save the Gold',
            emoji: '💾',
            desc: 'Bookmark genius findings for flexing later.'
          },
          {
            title: 'Free(ish) Forever',
            emoji: '🆓',
            desc: 'Knowledge wants to be free, our lawyers agree.*'
          }
        ].map((f, i) => (
          <div key={i} className="bg-[#151515]/70 rounded-2xl p-6 backdrop-blur-lg border border-[#ffffff1a] hover:scale-[1.03] transition-transform">
            <div className="text-4xl mb-4">{f.emoji}</div>
            <h3 className="text-xl font-bold mb-2 text-accent-500">{f.title}</h3>
            <p className="text-gray-300 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Final CTA */}
      <div className="mt-20 space-y-6">
        <h2 className="text-3xl md:text-4xl font-extrabold">Ready to Upgrade Your Brain?</h2>
        <Link to="/ai" className="inline-block bg-gradient-to-r from-accent-500 to-pink-500 hover:to-yellow-400 text-white px-10 py-4 rounded-full shadow-xl text-lg font-semibold tracking-wide">Launch the AI 🚀</Link>
      </div>

    </section>
  </> );
};

export default LandingPage;

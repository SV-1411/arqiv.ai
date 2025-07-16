import React from 'react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  return (
    <>
      {/* Video disabled per request */}
      <div className="relative min-h-screen overflow-hidden bg-black">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-30"
      >
        <source src="/vid.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black via-transparent to-black z-10"></div>

      <section className="relative z-20 min-h-screen pt-48 pb-32 text-white text-center space-y-24">
        {/* Hero */}
        <div className="space-y-8">
          <h1 className="text-6xl md:text-8xl font-black font-mono tracking-tighter text-shadow-lg">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-pink-300 to-amber-500">arqivAi</span>
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-gray-300">
            Your not-so-personal AI research companion. Ask ridiculously complex questions, get surprisingly coherent answers.
          </p>
          <Link to="/ai" className="inline-block bg-gradient-to-r from-amber-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-10 py-4 rounded-full transition-all shadow-2xl mt-6 text-lg font-bold transform hover:scale-105">
            Try the AI (If You Dare)
          </Link>
        </div>

        {/* About Section Preview */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img src="/research.png" alt="Research Illustration" className="w-full h-full object-cover" />
          </div>
          <div className="text-left space-y-4">
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Who Are We?</h2>
            <p className="text-gray-300 text-lg">
              A handful of nerds who got tired of bad search results. We're building tools to make knowledge less... annoying. By mixing scary-smart AI with a clean design, we help you find what you need, faster.
            </p>
            <Link to="/about" className="text-cyan-400 hover:text-cyan-300 font-bold text-lg">See the chaos →</Link>
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
          <div key={i} className="bg-gray-900/50 rounded-2xl p-6 backdrop-blur-lg border border-white/10 hover:border-purple-400/50 hover:scale-[1.03] transition-all duration-300 shadow-lg hover:shadow-purple-500/20">
            <div className="text-4xl mb-4">{f.emoji}</div>
            <h3 className="text-xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{f.title}</h3>
            <p className="text-gray-300 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Final CTA */}
      <div className="mt-20 space-y-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-pink-500 to-amber-500">Ready to Upgrade Your Brain?</h2>
        <Link to="/ai" className="inline-block bg-gradient-to-r from-amber-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-10 py-4 rounded-full shadow-xl text-lg font-semibold tracking-wide transform hover:scale-105 transition-transform duration-300">Launch the AI 🚀</Link>
      </div>

    </section>
    </div>
  </> );
};

export default LandingPage;

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import './LandingPage.css';

const LandingPage = ({ onEnterApp }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: '🔐',
      title: 'Blockchain Secured',
      description: 'Immutable voting records stored on MegaETH blockchain ensuring complete transparency and security.'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Real-time updates with instant transaction confirmation. No waiting, no delays.'
    },
    {
      icon: '🌐',
      title: 'Fully Decentralized',
      description: 'No central authority. Pure peer-to-peer democratic voting powered by Web3.'
    },
    {
      icon: '🎨',
      title: 'Profile Pictures',
      description: 'IPFS-powered profile images for voters and candidates. Make your vote personal.'
    },
    {
      icon: '👥',
      title: 'Multi-Wallet Support',
      description: 'MetaMask, Rainbow, WalletConnect, and more. Connect with your favorite wallet.'
    },
    {
      icon: '📊',
      title: 'Live Results',
      description: 'Watch results update in real-time as votes are cast. Complete transparency.'
    }
  ];

  const stats = [
    { number: '100%', label: 'Transparent' },
    { number: '<100ms', label: 'Transaction Speed' },
    { number: '∞', label: 'Scalability' },
    { number: '0', label: 'Central Control' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-pink-500 rounded-full blur-3xl opacity-20 -bottom-48 -right-48 animate-pulse delay-1000"></div>
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg">
            🗳️
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            VoteLedger
          </span>
        </div>
        <div className="hidden md:flex space-x-8 items-center">
          <a href="#features" className="hover:text-pink-400 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-pink-400 transition-colors">How It Works</a>
          <a href="#stats" className="hover:text-pink-400 transition-colors">Stats</a>
          <ConnectButton />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-8 border border-white/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm">Powered by MegaETH • Lightning Fast ⚡</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-200 to-purple-200 animate-gradient">
              Decentralized
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-pink-200 to-white">
              Voting Revolution
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience the future of democratic voting with blockchain-powered transparency, 
            instant results, and complete security. No intermediaries. No manipulation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onEnterApp}
              className="group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-bold text-lg shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
            >
              <span>Launch App</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-full font-bold text-lg border-2 border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              Learn More
            </a>
          </div>

          {/* Floating Cards Preview */}
          <div className="mt-20 relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {['Vote', 'Register', 'Results'].map((item, idx) => (
                <div
                  key={item}
                  className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:bg-white/10"
                  style={{ 
                    animation: `float ${3 + idx * 0.5}s ease-in-out infinite`,
                    animationDelay: `${idx * 0.2}s`
                  }}
                >
                  <div className="text-4xl mb-3">
                    {idx === 0 ? '🗳️' : idx === 1 ? '📝' : '📊'}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item}</h3>
                  <p className="text-gray-400 text-sm">
                    {idx === 0 ? 'Cast your vote securely' : idx === 1 ? 'Register as voter or candidate' : 'Real-time transparent results'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative z-10 py-20 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 container mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Why Choose VoteLedger?
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Built with cutting-edge blockchain technology to ensure your vote counts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, idx) => (
            <div
              key={feature.title}
              className="group bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:border-pink-500/50 transition-all duration-300 hover:scale-105 hover:bg-white/10"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-32 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Simple, secure, and transparent voting in three easy steps
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="space-y-12">
              {[
                {
                  step: '01',
                  title: 'Connect Your Wallet',
                  description: 'Use MetaMask, Rainbow, or any Web3 wallet to connect to the platform. Your wallet is your identity.',
                  icon: '🔗'
                },
                {
                  step: '02',
                  title: 'Register & Vote',
                  description: 'Register as a voter or candidate. Upload your profile picture and participate in the election.',
                  icon: '📝'
                },
                {
                  step: '03',
                  title: 'View Results',
                  description: 'Watch real-time results update instantly. All votes are recorded on the blockchain, ensuring complete transparency.',
                  icon: '🎯'
                }
              ].map((item, idx) => (
                <div key={item.step} className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-4xl font-black shadow-2xl">
                      {item.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-6xl font-black text-white/10 mb-2">{item.step}</div>
                    <h3 className="text-3xl font-bold mb-3">{item.title}</h3>
                    <p className="text-gray-400 text-lg leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-md p-12 rounded-3xl border border-white/20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Ready to Experience True Democracy?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of users who trust VoteLedger for secure, transparent voting
            </p>
            <button
              onClick={onEnterApp}
              className="group px-10 py-5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-bold text-xl shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-110 flex items-center space-x-3 mx-auto"
            >
              <span>Get Started Now</span>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center text-xl font-bold">
                  🗳️
                </div>
                <span className="text-xl font-bold">VoteLedger</span>
              </div>
              <p className="text-gray-400 text-sm">
                Decentralized voting platform powered by blockchain technology.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-pink-400 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-pink-400 transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-pink-400 transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="https://github.com/Iglxkardam/VoteLedger" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-pink-400 transition-colors">Smart Contract</a></li>
                <li><a href="#" className="hover:text-pink-400 transition-colors">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-pink-400 transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-pink-400 transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-pink-400 transition-colors">Telegram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 VoteLedger. All rights reserved. Built with ❤️ on MegaETH Chain.</p>
          </div>
        </div>
      </footer>

      {/* CSS is handled via Tailwind and inline styles */}
    </div>
  );
};

export default LandingPage;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Landing = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/home");
    } else {
      navigate("/signin");
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute -top-[30%] -right-[10%] w-[80%] h-[80%] bg-purple-500/10 rounded-full blur-[100px]" 
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          />
          <div 
            className="absolute top-[50%] -left-[10%] w-[70%] h-[70%] bg-blue-500/10 rounded-full blur-[100px]" 
            style={{ transform: `translateY(${scrollY * -0.15}px)` }}
          />
          <div 
            className="absolute -bottom-[20%] left-[30%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[100px]" 
            style={{ transform: `translateY(${scrollY * -0.05}px)` }}
          />
        </div>

        <div 
          className="absolute top-0 left-0 w-full h-full" 
          style={{ 
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            opacity: 0.3
          }}
        />

        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-6 py-8 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">RAG Notebook</span>
          </div>
          
          <div className="space-x-6">
            <button 
              onClick={() => navigate("/signin")} 
              className="text-white/90 hover:text-white transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => navigate("/signup")} 
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
            >
              Sign Up
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="container relative z-10 mx-auto px-6 pt-20 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                <span className="block">Supercharge Your</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400">
                  Document Intelligence
                </span>
              </h1>
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Upload your documents and instantly chat, query, and generate insights with the power of AI. From summaries to study notes, transform how you interact with your knowledge.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleGetStarted}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 font-bold text-lg transition-all transform hover:scale-105"
                >
                  Start Using Now
                </button>
                <button className="px-8 py-4 rounded-xl border border-white/20 hover:bg-white/10 font-bold text-lg transition-all">
                  Watch Demo
                </button>
              </div>
            </div>
            
            <div className="hidden lg:block relative">
              <div className="w-full h-[500px] relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 rounded-2xl border border-white/10 backdrop-blur-sm" />
                
                <div className="absolute top-12 left-12 right-12 bottom-12 bg-gray-900/80 rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="h-10 w-full bg-gray-800 flex items-center px-4 border-b border-white/10">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div className="p-4 font-mono text-sm h-full">
                    <div className="flex items-center mb-4">
                      <span className="text-green-400">ragbot&gt;</span>
                      <span className="ml-2 typing-animation"> How can I help with your documents today?</span>
                    </div>
                    <div className="flex items-center mb-4">
                      <span className="text-purple-400">user&gt;</span>
                      <span className="ml-2"> Summarize the main findings from my research paper</span>
                    </div>
                    <div className="flex items-start mb-4">
                      <span className="text-green-400">ragbot&gt;</span>
                      <span className="ml-2 text-white/90 animate-pulse"> Analyzing your research paper...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="relative">
          <svg className="w-full h-24 md:h-32 fill-gray-900" viewBox="0 0 1440 74" preserveAspectRatio="none">
            <path d="M0,0 C240,50 480,74 720,74 C960,74 1200,50 1440,0 L1440,74 L0,74 Z" />
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-900 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Experience document intelligence reimagined with our cutting-edge tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-black/40 rounded-xl p-6 border border-white/10 backdrop-blur-sm hover:bg-black/60 transition-all group">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors">Smart Document Chat</h3>
              <p className="text-white/70">
                Ask questions about your documents and get instant, accurate answers powered by AI with context from your files.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-black/40 rounded-xl p-6 border border-white/10 backdrop-blur-sm hover:bg-black/60 transition-all group">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-cyan-400 transition-colors">Automatic Summaries</h3>
              <p className="text-white/70">
                Generate concise, accurate summaries of any document in seconds, extracting the most important information.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-black/40 rounded-xl p-6 border border-white/10 backdrop-blur-sm hover:bg-black/60 transition-all group">
              <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-pink-400 transition-colors">Study Notes Generator</h3>
              <p className="text-white/70">
                Transform complex documents into comprehensive study notes with key concepts highlighted for easier learning.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-black/40 rounded-xl p-6 border border-white/10 backdrop-blur-sm hover:bg-black/60 transition-all group">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-amber-400 transition-colors">PDF Support</h3>
              <p className="text-white/70">
                Upload and analyze any PDF document without format issues. Our system processes even complex PDFs with ease.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-black/40 rounded-xl p-6 border border-white/10 backdrop-blur-sm hover:bg-black/60 transition-all group">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-green-400 transition-colors">Personal Notes</h3>
              <p className="text-white/70">
                Add your own notes to documents, enhancing them with your insights and keeping everything organized in one place.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-black/40 rounded-xl p-6 border border-white/10 backdrop-blur-sm hover:bg-black/60 transition-all group">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">Document Organization</h3>
              <p className="text-white/70">
                Keep your documents organized in conversations, making it easy to find and work with related materials.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-black py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Get started in minutes with these simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -left-4 -top-4 w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center font-bold text-xl z-10">1</div>
              <div className="border border-white/10 bg-white/5 backdrop-blur-sm rounded-xl p-8 pt-12 h-full">
                <h3 className="text-xl font-bold mb-4">Upload Documents</h3>
                <p className="text-white/70">
                  Upload your PDFs to start a new conversation. Our system will process and index your documents.
                </p>
              </div>
              {/* Connector */}
              <div className="hidden md:block absolute -right-4 top-1/2 w-8 h-1 bg-gradient-to-r from-purple-500 to-transparent"></div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -left-4 -top-4 w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-xl z-10">2</div>
              <div className="border border-white/10 bg-white/5 backdrop-blur-sm rounded-xl p-8 pt-12 h-full">
                <h3 className="text-xl font-bold mb-4">Chat and Query</h3>
                <p className="text-white/70">
                  Ask questions about your documents or generate summaries and study notes with a single click.
                </p>
              </div>
              {/* Connector */}
              <div className="hidden md:block absolute -right-4 top-1/2 w-8 h-1 bg-gradient-to-r from-cyan-500 to-transparent"></div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -left-4 -top-4 w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center font-bold text-xl z-10">3</div>
              <div className="border border-white/10 bg-white/5 backdrop-blur-sm rounded-xl p-8 pt-12 h-full">
                <h3 className="text-xl font-bold mb-4">Save and Reference</h3>
                <p className="text-white/70">
                  Review AI-generated content, add your own notes, and build your knowledge base over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900 to-black" />
          <div className="absolute top-0 left-0 w-full h-full opacity-30" style={{ 
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }} />
        </div>

        <div className="container relative z-10 mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform How You Work with Documents?
            </h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
              Join thousands of users who are already using RAG Notebook to unlock insights from their documents.
            </p>
            <button 
              onClick={handleGetStarted}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 font-bold text-lg transition-all transform hover:scale-105"
            >
              Start Using Now — It's Free
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">RAG Notebook</span>
              <p className="text-white/50 mt-2">Document intelligence, reimagined</p>
            </div>
            <div className="flex flex-col md:flex-row gap-6 md:gap-12">
              <a href="#" className="text-white/70 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-white/70 hover:text-white">Terms of Service</a>
              <a href="#" className="text-white/70 hover:text-white">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/50">
            <p>&copy; {new Date().getFullYear()} RAG Notebook. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* CSS for animations */}
      <style>{`
        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }
        
        .typing-animation {
          overflow: hidden;
          white-space: nowrap;
          display: inline-block;
          animation: typing 2s steps(40, end);
        }
      `}</style>
    </div>
  );
};

export default Landing; 
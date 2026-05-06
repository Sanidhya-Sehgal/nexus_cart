'use client';

import { useState } from 'react';
import InventoryTable from '@/components/InventoryTable';
import SyncHistory from '@/components/SyncHistory';
import { Zap, ShoppingBag, Globe, LayoutDashboard, FileText, User, Settings, LogOut, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-slate-950 text-slate-300 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl relative z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-900/20">
            <Zap className="h-6 w-6 text-white fill-current" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            NexusCart
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-4">Menu</p>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'docs', label: 'Documentation', icon: FileText },
            { id: 'profile', label: 'Profile', icon: User },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[inset_0px_1px_0px_rgba(255,255,255,0.05)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <item.icon className={`h-4 w-4 ${activeTab === item.id ? 'text-blue-400' : 'text-slate-500'}`} />
              {item.label}
              {activeTab === item.id && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="max-w-6xl mx-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <DashboardView />}
              {activeTab === 'docs' && <DocumentationView />}
              {activeTab === 'profile' && <ProfileView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function DashboardView() {
  return (
    <div className="space-y-8">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome back, Admin</h2>
        <p className="text-slate-400">Your orchestration engine is running smoothly.</p>
      </header>

      {/* Hero / Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <ShoppingBag className="h-32 w-32 text-blue-500" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Source</p>
          <h3 className="text-2xl font-bold text-white mb-2">Shopify Admin</h3>
          <p className="text-xs font-medium text-emerald-400 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Connected
          </p>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <Activity className="h-32 w-32 text-purple-500" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">AI Engine</p>
          <h3 className="text-2xl font-bold text-white mb-2">Llama 3.3</h3>
          <p className="text-xs font-medium text-purple-400 flex items-center gap-2">
            Optimized Content Gen
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <Globe className="h-32 w-32 text-emerald-500" />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Destination</p>
          <h3 className="text-2xl font-bold text-white mb-2">WordPress Blog</h3>
          <p className="text-xs font-medium text-slate-400">Ready to publish</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        <InventoryTable />
        <SyncHistory />
      </div>
    </div>
  );
}

function DocumentationView() {
  return (
    <div className="max-w-4xl">
      <h2 className="text-3xl font-bold text-white mb-8">Documentation</h2>
      
      <div className="space-y-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-md">
          <h3 className="text-xl font-bold text-white mb-4">Quick Start Guide</h3>
          <p className="text-slate-400 mb-6 leading-relaxed">
            NexusCart is a professional orchestration engine that bridges the gap between Shopify and WordPress. Here's how it works:
          </p>
          
          <ul className="space-y-4 mb-8">
            <li className="flex gap-4">
              <div className="flex-none w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">1</div>
              <p className="text-slate-400 text-sm leading-relaxed"><strong className="text-white">Fetch Inventory:</strong> The app connects to your Shopify store via Admin API to retrieve your latest product catalog.</p>
            </li>
            <li className="flex gap-4">
              <div className="flex-none w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">2</div>
              <p className="text-slate-400 text-sm leading-relaxed"><strong className="text-white">AI Transformation:</strong> Using Llama 3.3, the system analyzes your product data and generates a high-converting, SEO-optimized landing page script.</p>
            </li>
            <li className="flex gap-4">
              <div className="flex-none w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">3</div>
              <p className="text-slate-400 text-sm leading-relaxed"><strong className="text-white">WordPress Sync:</strong> The generated content is automatically pushed to your WordPress blog using XML-RPC, including featured images and direct checkout links.</p>
            </li>
          </ul>

          <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl mb-8">
            <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-2">Shopify Access</h4>
            <p className="text-slate-300 text-sm">To view the Shopify store associated with this engine, use the following password:</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded border border-indigo-500/30 font-mono text-lg font-bold select-all">13012005</code>
            </div>
          </div>
          
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">API Endpoints</h4>
          <div className="bg-black/50 border border-slate-800 rounded-lg p-4 font-mono text-sm mb-6">
            <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
              <span className="text-emerald-400 font-bold">GET</span>
              <span className="text-slate-300">/api/shopify/products</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-400 font-bold">POST</span>
              <span className="text-slate-300">/api/sync</span>
            </div>
          </div>
          
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">WordPress Setup</h4>
          <p className="text-slate-400 text-sm leading-relaxed">
            Ensure your WordPress site has XML-RPC enabled. The system requires an Application Password generated from your WordPress user profile to bypass basic authentication limits.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileView() {
  return (
    <div className="max-w-3xl">
      <h2 className="text-3xl font-bold text-white mb-8">Profile Settings</h2>
      
      <div className="space-y-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-md">
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-800">
            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border-4 border-slate-900 shadow-2xl flex items-center justify-center text-3xl font-bold text-white">
              SS
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Sanidhya Sehgal</h3>
              <p className="text-slate-400 mb-2">sanidhya@nexuscart.dev</p>
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                System Architect
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">About Me</h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              I am a Full-Stack Systems Builder specializing in AI-driven automation and middleware orchestration. My focus is on creating seamless data pipelines that transform raw commerce data into sophisticated digital narratives.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Focus</p>
                <p className="text-sm text-slate-300">AI Orchestration</p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Stack</p>
                <p className="text-sm text-slate-300">MERN / Next.js</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6 pt-8 border-t border-slate-800">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">API Key</label>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  value="nexus_key_live_****************" 
                  readOnly
                  className="flex-1 bg-black/50 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500"
                />
                <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                  Reveal
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Email Notifications</label>
              <div className="flex items-center gap-3">
                <div className="w-11 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
                <span className="text-sm text-slate-300">Receive sync failure alerts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Shield, HelpCircle, Code, CheckCircle, ExternalLink, Settings, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';

interface AdPlacementProps {
  slotId?: string;
  format?: 'horizontal' | 'rectangle' | 'skyscraper' | 'native' | 'responsive';
}

export default function AdPlacement({ slotId = '1234567890', format = 'horizontal' }: AdPlacementProps) {
  const [activeFormat, setActiveFormat] = useState<'horizontal' | 'rectangle' | 'skyscraper' | 'native'>(
    format === 'responsive' ? 'horizontal' : format as any
  );
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  // Get Publisher ID from environment config (populated in AI Studio UI settings)
  const adClientId = (import.meta as any).env?.VITE_ADSENSE_CLIENT_ID || 'ca-pub-7683037506200285';

  // Dynamically inject the script tag in production when client ID is provided
  useEffect(() => {
    if (adClientId) {
      const scriptId = 'adsense-loader-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClientId}`;
        script.crossOrigin = 'anonymous';
        script.async = true;
        document.head.appendChild(script);
      }
    }
  }, [adClientId]);

  // Push individual ad initialization inside the SPA component life cycle
  useEffect(() => {
    if (adClientId) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        console.warn('AdSense script initialization deferred or blocked: ', e);
      }
    }
  }, [activeFormat, adClientId]);

  // Determine if we are running on the live published custom domain or if we're in a clean preview
  const isPublishedSite = typeof window !== 'undefined' && (
    window.location.hostname === 'asxetfscreener.com.au' ||
    window.location.hostname === 'www.asxetfscreener.com.au' ||
    // If not running on localhost, local IP, or development preview URL, treat as clean published site
    (!window.location.hostname.includes('localhost') && 
     !window.location.hostname.includes('127.0.0.1') && 
     !window.location.hostname.includes('ais-dev-'))
  );

  if (isPublishedSite) {
    // On the published website, we render a completely clean, standard AdSense ad slot 
    // without any of the development-only format selectors, setup manuals, borders, or simulated previews.
    return (
      <div className="w-full flex justify-center items-center py-4 my-2 overflow-hidden">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '90px' }}
          data-ad-client={adClientId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
        <div className="flex items-center gap-2">
          <span className={`flex h-2.5 w-2.5 rounded-full ${adClientId ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
            AdSense Monetization {adClientId ? 'Active' : 'Sandbox (Demo Mode)'}
          </span>
          {!adClientId && (
            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              Config Pending
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => setActiveFormat('horizontal')}
            className={`px-2 py-1 text-[10px] font-bold rounded-md transition ${
              activeFormat === 'horizontal' ? 'bg-slate-950 text-white' : 'bg-slate-200/60 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Leaderboard (728x90)
          </button>
          <button
            onClick={() => setActiveFormat('skyscraper')}
            className={`px-2 py-1 text-[10px] font-bold rounded-md transition ${
              activeFormat === 'skyscraper' ? 'bg-slate-950 text-white' : 'bg-slate-200/60 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Skyscraper (160x600)
          </button>
          <button
            onClick={() => setActiveFormat('rectangle')}
            className={`px-2 py-1 text-[10px] font-bold rounded-md transition ${
              activeFormat === 'rectangle' ? 'bg-slate-950 text-white' : 'bg-slate-200/60 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Rectangle (300x250)
          </button>
          <button
            onClick={() => setActiveFormat('native')}
            className={`px-2 py-1 text-[10px] font-bold rounded-md transition ${
              activeFormat === 'native' ? 'bg-slate-950 text-white' : 'bg-slate-200/60 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Native Ad
          </button>
          <button
            onClick={() => setShowConfigGuide(!showConfigGuide)}
            className="p-1 text-slate-400 hover:text-slate-950 transition flex items-center gap-1"
            title="AdSense Setup Guide"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Actual Simulated/Real Ad Container */}
      <div className="flex justify-center items-center w-full">
        {activeFormat === 'horizontal' && (
          /* Leaderboard Banner (728x90 style) */
          <div className="w-full max-w-[728px] h-[90px] bg-slate-100 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center relative overflow-hidden p-4 group transition hover:border-slate-400">
            {/* Real Ad Container */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-r from-indigo-50/10 via-slate-50/30 to-emerald-50/10 p-3 text-center">
              <span className="absolute top-2 right-3 text-[8px] font-black text-slate-400 tracking-wider uppercase bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                Sponsored Ad
              </span>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-xs">🚀</span>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">Compare over 150+ Australian ETFs instantly with Pearler Brokerage</p>
                  <p className="text-[10px] text-slate-500">Sign up today and get $10 free brokerage credit. Terms &amp; conditions apply.</p>
                </div>
              </div>
            </div>

            {/* Hidden production AdSense Tag */}
            {adClientId && (
              <ins
                className="adsbygoogle"
                style={{ display: 'inline-block', width: '728px', height: '90px', opacity: 0, pointerEvents: 'none' }}
                data-ad-client={adClientId}
                data-ad-slot={slotId}
              />
            )}
          </div>
        )}

        {activeFormat === 'skyscraper' && (
          /* Skyscraper Style (160x600 style vertical bar) */
          <div className="w-[160px] h-[600px] bg-slate-100 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-between relative overflow-hidden p-4 text-center group transition hover:border-slate-400">
            <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase bg-white border border-slate-200 px-1.5 py-0.5 rounded">
              Sponsored Ad
            </span>
            
            <div className="my-auto space-y-6">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 text-2xl shadow-2xs">
                📈
              </span>
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-900 tracking-tight leading-snug">Vanguard High Growth Fund</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Diversified instantly into 10,000+ international shares.
                </p>
              </div>
              <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100 font-mono text-[10px] font-black text-emerald-800">
                MER: 0.27%
              </div>
              <button className="w-full bg-slate-950 text-white text-[10px] font-black py-2 rounded-lg hover:bg-slate-800 transition">
                Learn More
              </button>
            </div>

            <span className="text-[8px] text-slate-400 font-bold tracking-wider uppercase">Vanguard Index</span>

            {/* Hidden production AdSense Tag */}
            {adClientId && (
              <ins
                className="adsbygoogle"
                style={{ display: 'inline-block', width: '160px', height: '600px', opacity: 0, pointerEvents: 'none' }}
                data-ad-client={adClientId}
                data-ad-slot={slotId}
              />
            )}
          </div>
        )}

        {activeFormat === 'rectangle' && (
          /* Sidebar/Medium Rectangle style (300x250) */
          <div className="w-[300px] h-[250px] bg-slate-100 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center relative overflow-hidden p-6 text-center group transition hover:border-slate-400">
            <span className="absolute top-3 right-3 text-[8px] font-black text-slate-400 tracking-wider uppercase bg-white border border-slate-200 px-1.5 py-0.5 rounded">
              Sponsored Ad
            </span>
            <div className="space-y-3.5 my-auto">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-2xl">
                💼
              </span>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-950">Selfwealth Premium Trade</p>
                <p className="text-[11px] text-slate-500 leading-relaxed px-2">
                  Flat-fee $9.50 trades. Trade ASX &amp; US shares seamlessly inside Australia's most trusted community broker.
                </p>
              </div>
              <button className="bg-slate-950 text-white text-[11px] font-black px-4 py-1.5 rounded-lg border border-slate-950 hover:bg-white hover:text-slate-950 transition">
                Claim Brokerage Credit
              </button>
            </div>

            {/* Hidden production AdSense Tag */}
            {adClientId && (
              <ins
                className="adsbygoogle"
                style={{ display: 'inline-block', width: '300px', height: '250px', opacity: 0, pointerEvents: 'none' }}
                data-ad-client={adClientId}
                data-ad-slot={slotId}
              />
            )}
          </div>
        )}

        {activeFormat === 'native' && (
          /* Native Content-Matching Ad Card */
          <div className="w-full bg-indigo-950/40 border border-indigo-800/40 hover:border-indigo-700/60 transition rounded-2xl p-6 relative overflow-hidden">
            <span className="absolute top-4 right-4 text-[8px] font-black text-indigo-300 tracking-wider uppercase bg-indigo-900 border border-indigo-700/50 px-2 py-0.5 rounded-full">
              Sponsor Feature
            </span>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="bg-gradient-to-tr from-emerald-500 to-indigo-500 p-3.5 rounded-2xl text-2xl shrink-0 shadow-sm text-white">
                💡
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-black text-white tracking-tight flex items-center justify-center sm:justify-start gap-1">
                  Free ETF Tax &amp; franking intelligence tool
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                </h4>
                <p className="text-xs text-indigo-200 leading-relaxed max-w-2xl">
                  Automatically calculate your franking credits, Australian AMMA tax statements, capital gains distribution, and cost-base adjustments for over 250+ listed funds. Get your instant visual report before tax season.
                </p>
              </div>
              <button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl transition shadow-2xs whitespace-nowrap self-stretch sm:self-center flex items-center justify-center gap-1">
                Calculate Free <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Configuration & Deployment Guide Drawer */}
      {showConfigGuide && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 text-xs text-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b border-slate-150 pb-2">
            <Code className="w-4 h-4 text-indigo-600" />
            Vite &amp; React Google AdSense Implementation Manual
          </div>

          <div className="space-y-3">
            <p className="leading-relaxed">
              Google AdSense requires specific tags and verification to run inside Single Page Apps (SPA) like React. Follow this three-step blueprint:
            </p>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="bg-indigo-50 text-indigo-700 font-extrabold text-[10px] px-2 py-0.5 rounded-md mt-0.5">STEP 1</span>
                <div>
                  <p className="font-bold text-slate-900">Include the Publisher Script in index.html</p>
                  <p className="text-slate-500 mt-0.5 text-[11px]">
                    Paste this tag inside the <code className="bg-slate-50 border border-slate-150 px-1 rounded font-mono text-[10px]">&lt;head&gt;</code> element of your <code className="font-mono text-[10px]">/index.html</code>:
                  </p>
                  <pre className="bg-slate-950 text-slate-200 p-2.5 rounded-lg font-mono text-[9px] overflow-x-auto mt-1.5 border border-slate-800">
{`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7683037506200285" crossorigin="anonymous"></script>`}
                  </pre>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-slate-100 pt-2.5">
                <span className="bg-indigo-50 text-indigo-700 font-extrabold text-[10px] px-2 py-0.5 rounded-md mt-0.5">STEP 2</span>
                <div>
                  <p className="font-bold text-slate-900">Verify Ownership with ads.txt</p>
                  <p className="text-slate-500 mt-0.5 text-[11px]">
                    Google requires an <code className="font-mono text-[10px]">ads.txt</code> file to authorize your domain. Create a file at <code className="font-mono text-[10px]">/public/ads.txt</code> containing:
                  </p>
                  <pre className="bg-slate-950 text-slate-200 p-2.5 rounded-lg font-mono text-[10px] overflow-x-auto mt-1.5 border border-slate-800">
google.com, pub-7683037506200285, DIRECT, f08c47fec0942fa0
                  </pre>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-slate-100 pt-2.5">
                <span className="bg-indigo-50 text-indigo-700 font-extrabold text-[10px] px-2 py-0.5 rounded-md mt-0.5">STEP 3</span>
                <div>
                  <p className="font-bold text-slate-900">Render and Trigger Ads in React</p>
                  <p className="text-slate-500 mt-0.5 text-[11px]">
                    Since React mounts components dynamically, you must push the ad initialization trigger inside <code className="font-mono text-[10px]">useEffect</code>:
                  </p>
                  <pre className="bg-slate-950 text-slate-200 p-2.5 rounded-lg font-mono text-[9px] overflow-x-auto mt-1.5 border border-slate-800">
{`useEffect(() => {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (err) {
    console.error(err);
  }
}, [routeChange]);`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200/60 p-3 rounded-xl text-[11px] text-amber-800 leading-relaxed flex items-start gap-2 mt-2">
              <span className="text-sm">⚠️</span>
              <div>
                <strong>Ad Blocker Warning:</strong> During testing, ensure your browser ad blocker is disabled for your deployment domain to allow AdSense scripts to execute correctly.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

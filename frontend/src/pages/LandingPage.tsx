import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  Footprints, 
  Trash2, 
  TrafficCone, 
  Layers, 
  Cpu,
  CheckCircle2,
  MapPin,
  Compass,
  FileCheck2,
  Activity,
  User,
  Shield
} from 'lucide-react';

interface HeroMarker {
  id: string;
  x: number; // percentage
  y: number; // percentage
  label: string;
  category: string;
  severity: number;
  humanImpact: 'Critical' | 'High' | 'Medium' | 'Low';
  accessibilityImpact: 'High' | 'Medium' | 'Low';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  location: string;
}

const HERO_MARKERS: HeroMarker[] = [
  {
    id: 'm1',
    x: 48,
    y: 38,
    label: 'Deep Bus Lane Pothole',
    category: 'Pothole',
    severity: 87,
    humanImpact: 'High',
    accessibilityImpact: 'High',
    priority: 'Critical',
    location: 'Anna Salai & Mount Road Corridor (T. Nagar)'
  },
  {
    id: 'm2',
    x: 28,
    y: 62,
    label: 'Heaved ADA Curb Ramp',
    category: 'Accessibility Barrier',
    severity: 94,
    humanImpact: 'Critical',
    accessibilityImpact: 'High',
    priority: 'Critical',
    location: 'Adyar Cancer Institute & Hospital Junction (Adyar)'
  },
  {
    id: 'm3',
    x: 74,
    y: 45,
    label: 'Obscured School Zone Sign',
    category: 'Damaged Sign',
    severity: 72,
    humanImpact: 'High',
    accessibilityImpact: 'Medium',
    priority: 'High',
    location: 'Kendriya Vidyalaya School Zone (IIT Madras / Guindy)'
  },
  {
    id: 'm4',
    x: 62,
    y: 75,
    label: 'Sidewalk Concrete Collapse',
    category: 'Broken Sidewalk',
    severity: 68,
    humanImpact: 'Medium',
    accessibilityImpact: 'Medium',
    priority: 'Medium',
    location: 'Velachery Main Road & 100 Feet Bypass (OMR Corridor)'
  }
];

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  // Hero Interactive Marker State
  const [activeMarker, setActiveMarker] = useState<HeroMarker>(HERO_MARKERS[0]);

  // How it works step state
  const [activeStep, setActiveStep] = useState<number>(0);

  // Human Impact Comparison state
  const [activeIssueComparison, setActiveIssueComparison] = useState<'A' | 'B' | 'C'>('B');

  // City Intelligence filter
  const [mapCategoryFilter, setMapCategoryFilter] = useState<string>('ALL');

  const steps = [
    {
      num: '01',
      title: 'REPORT',
      tagline: 'Capture or upload a photo of an infrastructure problem.',
      desc: 'Citizens snap geo-referenced photos with mobile camera or browser upload, tagging immediate hazards in seconds.',
      badge: 'Citizen Telemetry',
      stat: '0.8s upload'
    },
    {
      num: '02',
      title: 'DETECT',
      tagline: 'AI identifies the type of infrastructure defect.',
      desc: 'Computer vision pipelines segment bounding boxes, detecting potholes, curb cracks, missing ramps, or garbage spills.',
      badge: 'CV Detection',
      stat: '94% CV Confidence'
    },
    {
      num: '03',
      title: 'ASSESS',
      tagline: 'AI estimates severity and potential public impact.',
      desc: 'Evaluates structural cavity volume, edge degradation, displacement height, and physical impediment risk.',
      badge: 'Hazard Classification',
      stat: 'Severity 0-100'
    },
    {
      num: '04',
      title: 'UNDERSTAND',
      tagline: 'CivicMind considers location, accessibility, nearby important places and previous reports.',
      desc: 'Correlates proximity to clinics, transit hubs, school crosswalks, wheelchair corridors, and spatial recurrence clusters.',
      badge: 'Geospatial Context',
      stat: '120m Cluster Memory'
    },
    {
      num: '05',
      title: 'PRIORITIZE',
      tagline: 'The Human Impact Engine determines which problems deserve attention first.',
      desc: 'Deterministic multi-factor algorithm balances pedestrian density and accessibility vulnerability into a 0-100 score.',
      badge: 'Human Impact Index',
      stat: 'Equitable Queue'
    },
    {
      num: '06',
      title: 'ACT',
      tagline: 'Authorities receive an actionable, prioritized repair ticket.',
      desc: 'Municipal public works and ADA division receive pre-formatted work orders with SLA timelines and equipment lists.',
      badge: 'Automated Dispatch',
      stat: '24h Target SLA'
    }
  ];

  return (
    <div className="space-y-32 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      
      {/* ============================================================ */}
      {/* PART 3 — CIVICMIND HERO                                       */}
      {/* ============================================================ */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center text-center pt-8 pb-12">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-cyan-600/10 via-blue-600/10 to-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6 max-w-4xl mx-auto relative z-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            AI-POWERED INCLUSIVE CITY INTELLIGENCE
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12]">
            Cities shouldn't just collect reports.{' '}
            <br className="hidden sm:inline" />
            They should know{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent font-extrabold">
              what to fix first.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            CivicMind transforms infrastructure reports into intelligent, prioritized repair decisions.
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload a photo. CivicMind detects the problem, understands its severity, considers location and human impact, and helps authorities prioritize the repairs that matter most.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <Link
              to={user ? "/report-issue" : "/sign-in/citizen"}
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 flex items-center gap-2 transition transform active:scale-95"
            >
              Report an issue <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#how-it-works"
              className="px-6 py-3.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition flex items-center gap-1.5"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Hero Geospatial Intelligence Visualization */}
        <div className="w-full max-w-5xl mt-14 relative rounded-3xl bg-slate-950/90 border border-slate-800 p-4 sm:p-6 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>CIVICMIND CHENNAI METROPOLITAN INTELLIGENCE GRID</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono text-slate-400">
              <span>LAT: 13.0827° N</span>
              <span>LNG: 80.2707° E</span>
              <span className="text-cyan-400">GCC WARDS: ACTIVE</span>
            </div>
          </div>

          {/* Interactive Visual Canvas */}
          <div className="relative h-80 sm:h-96 w-full rounded-2xl bg-gradient-to-b from-[#090d16] to-[#04060a] border border-slate-800/60 overflow-hidden flex items-center justify-center">
            {/* Vector Roads & Grid Mesh */}
            <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56, 189, 248, 0.1)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Arterial Roads */}
              <line x1="10%" y1="20%" x2="90%" y2="80%" stroke="rgba(14, 165, 233, 0.35)" strokeWidth="3" />
              <line x1="20%" y1="90%" x2="80%" y2="10%" stroke="rgba(14, 165, 233, 0.3)" strokeWidth="3" />
              <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="rgba(99, 102, 241, 0.25)" strokeWidth="2" strokeDasharray="6 4" />
              <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="rgba(99, 102, 241, 0.25)" strokeWidth="2" strokeDasharray="6 4" />
              <circle cx="50%" cy="50%" r="90" stroke="rgba(56, 189, 248, 0.18)" strokeWidth="1" fill="none" />
              <circle cx="50%" cy="50%" r="160" stroke="rgba(56, 189, 248, 0.1)" strokeWidth="1" fill="none" />
            </svg>

            {/* Interactive Pins on Map */}
            {HERO_MARKERS.map((marker) => {
              const isSelected = activeMarker.id === marker.id;
              return (
                <button
                  key={marker.id}
                  onClick={() => setActiveMarker(marker)}
                  onMouseEnter={() => setActiveMarker(marker)}
                  style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all duration-300 transform ${
                    isSelected ? 'scale-125 z-30' : 'scale-100 z-10 hover:scale-110'
                  }`}
                  aria-label={marker.label}
                >
                  <span
                    className={`block w-4 h-4 rounded-full border-2 ${
                      marker.priority === 'Critical'
                        ? 'bg-rose-500 border-rose-200 shadow-lg shadow-rose-500/60'
                        : marker.priority === 'High'
                        ? 'bg-amber-500 border-amber-200 shadow-lg shadow-amber-500/60'
                        : 'bg-cyan-500 border-cyan-200 shadow-lg shadow-cyan-500/60'
                    } ${isSelected ? 'animate-ping' : ''}`}
                  />
                  <span
                    className={`block w-4 h-4 rounded-full border-2 absolute top-1.5 left-1.5 ${
                      marker.priority === 'Critical'
                        ? 'bg-rose-500 border-white'
                        : marker.priority === 'High'
                        ? 'bg-amber-500 border-white'
                        : 'bg-cyan-500 border-white'
                    }`}
                  />
                </button>
              );
            })}

            {/* Active Intelligence Overlay Card */}
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-80 bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-left space-y-3 z-40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> AI DETECTED
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    activeMarker.priority === 'Critical'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {activeMarker.priority} PRIORITY
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white line-clamp-1">{activeMarker.label}</h4>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{activeMarker.location}</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-center">
                <div className="bg-slate-900/80 p-2 rounded-xl">
                  <span className="block text-[9px] text-slate-400 uppercase font-semibold">Severity</span>
                  <span className="text-xs font-bold font-mono text-white">{activeMarker.severity}/100</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl">
                  <span className="block text-[9px] text-slate-400 uppercase font-semibold">Human Impact</span>
                  <span className="text-xs font-bold font-mono text-cyan-300">{activeMarker.humanImpact}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl">
                  <span className="block text-[9px] text-slate-400 uppercase font-semibold">Accessibility</span>
                  <span className="text-xs font-bold font-mono text-indigo-300">{activeMarker.accessibilityImpact}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PART 4 — PROBLEM SECTION                                      */}
      {/* ============================================================ */}
      <section id="platform" className="space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
            The Civic Dilemma
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Every city has thousands of problems.{' '}
            <br className="hidden sm:inline" />
            The hard part is knowing which one matters most.
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Raw complaint volumes overwhelm city staff. Traditional portals treat a cosmetic pothole and a blocked hospital wheelchair ramp with identical priority.
          </p>
        </div>

        {/* 4 Problem Deficit Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              name: 'Pothole Deficits',
              desc: 'Deep asphalt fissures puncturing vehicle tires, threatening cyclists, and slowing emergency response.',
              severity: 'Severity 88',
              icon: AlertTriangle,
              color: 'text-amber-400',
              accent: 'border-amber-500/20'
            },
            {
              name: 'Damaged Sidewalk',
              desc: 'Heaved concrete slabs exceeding ADA limits, tripping seniors and forcing pedestrians into active roadway lanes.',
              severity: 'Severity 92',
              icon: Footprints,
              color: 'text-rose-400',
              accent: 'border-rose-500/20'
            },
            {
              name: 'Broken Signage',
              desc: 'Fallen stop signs and obscured pedestrian signals leading to high collision incidence at blind crosswalks.',
              severity: 'Severity 75',
              icon: TrafficCone,
              color: 'text-cyan-400',
              accent: 'border-cyan-500/20'
            },
            {
              name: 'Garbage Overflow',
              desc: 'Commercial dumpster spillage and broken glass obstructing wheelchair corridors and creating sanitation risk.',
              severity: 'Severity 67',
              icon: Trash2,
              color: 'text-purple-400',
              accent: 'border-purple-500/20'
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className={`p-6 rounded-3xl bg-slate-900/60 border ${item.accent} hover:border-cyan-400/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group shadow-lg`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                      {item.severity}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400">
                  <span>View intelligence</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Large Statement Callout */}
        <div className="text-center py-6 px-4 rounded-3xl bg-slate-950/80 border border-slate-800">
          <p className="text-lg sm:text-2xl font-bold tracking-tight text-white">
            "Reporting creates data.{' '}
            <span className="text-cyan-400">
              Prioritization creates action.
            </span>"
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PART 5 — HOW CIVICMIND WORKS                                  */}
      {/* ============================================================ */}
      <section id="how-it-works" className="space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
            The 6-Stage Progression
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            From a photo to a prioritized repair.
          </h2>
          <p className="text-sm text-slate-400">
            CivicMind connects citizen observation directly with intelligent municipal dispatch.
          </p>
        </div>

        {/* Interactive Step Navigator */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {steps.map((s, idx) => (
            <button
              key={s.num}
              onClick={() => setActiveStep(idx)}
              className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all ${
                activeStep === idx
                  ? 'bg-slate-900 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-mono font-bold text-cyan-400 mb-1">{s.num}</div>
              <div className="text-xs font-bold line-clamp-1">{s.title}</div>
            </button>
          ))}
        </div>

        {/* Active Step Feature Box */}
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/70 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold">
              STAGE {steps[activeStep].num} • {steps[activeStep].badge}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {steps[activeStep].tagline}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {steps[activeStep].desc}
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Metric: {steps[activeStep].stat}
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3 font-mono text-xs">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 pb-2">
              Pipeline Live Payload Simulation
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div><span className="text-cyan-400">STAGE:</span> {steps[activeStep].title}</div>
              <div><span className="text-cyan-400">TRIGGER:</span> Photo & GPS Ingestion</div>
              <div><span className="text-cyan-400">OUTPUT:</span> {steps[activeStep].badge}</div>
              <div><span className="text-cyan-400">STATUS:</span> Verified & Dispatched</div>
            </div>
            <div className="pt-2 text-[10px] text-slate-400 italic">
              Demonstration pipeline step preview
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PART 6 — AI INTELLIGENCE                                      */}
      {/* ============================================================ */}
      <section className="space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
            Contextual Computer Vision
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            AI doesn't just detect the defect.{' '}
            <br className="hidden sm:inline" />
            It understands the context.
          </h2>
          <p className="text-sm text-slate-400">
            CivicMind combines visual detection, severity assessment, accessibility impact, location context and historical reports to turn individual observations into infrastructure intelligence.
          </p>
        </div>

        {/* AI Scan Overlay Mockup */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
          <div className="lg:col-span-7 relative rounded-2xl bg-slate-950 border border-slate-800 h-72 sm:h-80 overflow-hidden flex items-center justify-center">
            {/* Visual scan effect */}
            <div className="absolute inset-x-0 top-0 h-1 bg-cyan-400/80 shadow-lg shadow-cyan-400 blur-[1px] animate-pulse" />
            
            {/* Bounding box simulation */}
            <div className="border-2 border-cyan-400 rounded-lg p-3 bg-cyan-500/10 w-3/4 h-3/5 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[10px] font-mono text-cyan-300 font-bold">
                <span className="bg-slate-950/90 px-2 py-0.5 rounded border border-cyan-500/40">
                  DETECTED: POTHOLE (94% CONF)
                </span>
                <span className="bg-slate-950/90 px-2 py-0.5 rounded border border-cyan-500/40">
                  SEV: HIGH
                </span>
              </div>
              <div className="text-center text-xs font-mono text-cyan-400/80">
                [DIMENSIONS: 0.85m × 0.60m | DEPTH: 14cm]
              </div>
            </div>
          </div>

          {/* Structured Analysis Metrics */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
              <span>INTELLIGENCE REPORT</span>
              <span className="text-cyan-400">DEMO CONTRACT SPEC</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-slate-400">DETECTED ISSUE:</span>
                <span className="font-bold text-white">Pothole</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-slate-400">SEVERITY:</span>
                <span className="font-bold text-amber-400">High (88/100)</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-slate-400">CONFIDENCE:</span>
                <span className="font-bold text-emerald-400">94%</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-slate-400">ACCESSIBILITY IMPACT:</span>
                <span className="font-bold text-indigo-300">Medium (Wheelchair Barrier)</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-slate-400">LOCATION CONTEXT:</span>
                <span className="font-bold text-cyan-300">Near Velachery MRTS & School Zone Corridor</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-slate-400">REPORT HISTORY:</span>
                <span className="font-bold text-white">6 similar reports nearby</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
                <span className="text-cyan-300 font-semibold">HUMAN IMPACT SCORE:</span>
                <span className="font-mono font-bold text-cyan-200">92 / 100 • CRITICAL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PART 7 — HUMAN IMPACT PRIORITIZATION                         */}
      {/* ============================================================ */}
      <section className="space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
            Core Differentiator
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Not every problem is equally urgent.
          </h2>
          <p className="text-sm text-slate-400">
            Compare how CivicMind evaluates three different infrastructure complaints based on vulnerable human impact rather than who shouted first.
          </p>
        </div>

        {/* 3 Issue Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              id: 'A',
              title: 'Small Sidewalk Crack',
              location: 'Anna Nagar 2nd Avenue (Residential Zone)',
              severity: 32,
              reports: 1,
              accessibility: 'Low',
              nearby: 'Low (Residential Colony)',
              priority: 29,
              tier: 'LOW',
              tierColor: 'bg-slate-800 text-slate-300',
              borderColor: 'border-slate-800'
            },
            {
              id: 'B',
              title: 'Deep Transit Pothole',
              location: 'Anna Salai & Mount Road Corridor (T. Nagar Arterial)',
              severity: 91,
              reports: 14,
              accessibility: 'High',
              nearby: 'High (School Zone & Transit)',
              priority: 94,
              tier: 'CRITICAL',
              tierColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
              borderColor: 'border-cyan-400/80'
            },
            {
              id: 'C',
              title: 'Overflowing Garbage Bin',
              location: 'Ranganathan Street Pedestrian Center (T. Nagar)',
              severity: 68,
              reports: 7,
              accessibility: 'Medium',
              nearby: 'Medium (Commercial Market)',
              priority: 71,
              tier: 'HIGH',
              tierColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
              borderColor: 'border-slate-800'
            }
          ].map((issue) => {
            const isSelected = activeIssueComparison === issue.id;
            return (
              <div
                key={issue.id}
                onClick={() => setActiveIssueComparison(issue.id as any)}
                className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer text-left space-y-5 ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-400 shadow-xl shadow-cyan-500/10 scale-102'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    ISSUE {issue.id}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${issue.tierColor}`}>
                    {issue.tier} PRIORITY
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{issue.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{issue.location}</p>
                </div>

                <div className="space-y-2.5 text-xs pt-2 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Defect Severity:</span>
                    <span className="font-mono font-bold text-white">{issue.severity}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reports Logged:</span>
                    <span className="font-mono text-white">{issue.reports}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Accessibility Impact:</span>
                    <span className="font-mono text-indigo-300">{issue.accessibility}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nearby Context:</span>
                    <span className="font-mono text-slate-200">{issue.nearby}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Human Impact Score</span>
                  <span className="text-lg font-mono font-extrabold text-cyan-400">{issue.priority} / 100</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center py-4">
          <p className="text-base sm:text-xl font-bold text-slate-200">
            CivicMind helps cities move from{' '}
            <span className="text-slate-400 line-through">first-reported</span> to{' '}
            <span className="text-cyan-400 font-extrabold">
              highest-impact.
            </span>
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PART 8 — CITY INTELLIGENCE                                    */}
      {/* ============================================================ */}
      <section className="space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase">
            Greater Chennai Corporation (GCC) • Tamil Nadu, India
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            See the city differently.
          </h2>
          <p className="text-sm text-slate-400">
            Simulated ward intelligence mapping across Anna Nagar, T. Nagar, Adyar, Velachery, Guindy, OMR, and Tambaram.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {['ALL WARDS', 'POTHOLES', 'SIDEWALKS', 'SIGNS', 'GARBAGE', 'ACCESSIBILITY'].map((cat) => (
            <button
              key={cat}
              onClick={() => setMapCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition ${
                mapCategoryFilter === cat
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* City Map Visualization Container */}
        <div className="relative rounded-3xl bg-slate-950 border border-slate-800 p-6 h-[420px] overflow-hidden flex items-center justify-center">
          {/* Spatial Grid simulation */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Chennai Arteries (Anna Salai, Poonamallee High Rd, OMR, Sardar Patel Rd) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Anna Salai / Mount Road arterial */}
            <div className="w-[90%] h-0.5 bg-cyan-500/20 transform rotate-12" />
            {/* OMR / Rajiv Gandhi Salai */}
            <div className="w-[90%] h-0.5 bg-indigo-500/20 transform -rotate-25" />
            {/* Inner Ring Road / 100 Feet Road */}
            <div className="w-0.5 h-[85%] bg-slate-800" />
            <div className="absolute text-[9px] font-mono text-slate-600 top-1/3 left-1/4 -rotate-25">
              RAJIV GANDHI SALAI (OMR)
            </div>
            <div className="absolute text-[9px] font-mono text-slate-600 bottom-1/3 right-1/4 rotate-12">
              ANNA SALAI ARTERIAL
            </div>
          </div>

          {/* Chennai Hotspots & Ward Clusters */}
          {/* 1. T. Nagar (Critical Hotspot) */}
          <div className="absolute top-[28%] left-[42%] z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center animate-pulse">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-500" />
            </div>
            <div className="bg-slate-900/90 border border-rose-500/40 rounded-lg px-2.5 py-1 text-center -mt-8 shadow-xl backdrop-blur-sm">
              <span className="block text-[10px] font-mono font-bold text-rose-300">T. NAGAR (WARD 136)</span>
              <span className="text-[9px] font-mono text-slate-400">Pothole & Curb Clustered • Score: 94</span>
            </div>
          </div>

          {/* 2. Velachery / MRTS Zone */}
          <div className="absolute bottom-[26%] right-[22%] z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-md shadow-amber-400" />
            </div>
            <div className="bg-slate-900/90 border border-amber-500/40 rounded-lg px-2.5 py-1 text-center -mt-6 shadow-xl backdrop-blur-sm">
              <span className="block text-[10px] font-mono font-bold text-amber-300">VELACHERY BYPASS (WARD 178)</span>
              <span className="text-[9px] font-mono text-slate-400">Transit Crosswalk Cavity • Score: 87</span>
            </div>
          </div>

          {/* 3. Adyar Cancer Institute / Sardar Patel Rd */}
          <div className="absolute bottom-[35%] left-[24%] z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            </div>
            <div className="bg-slate-900/90 border border-purple-500/40 rounded-lg px-2.5 py-1 text-center -mt-5 shadow-xl backdrop-blur-sm">
              <span className="block text-[10px] font-mono font-bold text-purple-300">ADYAR (WARD 173)</span>
              <span className="text-[9px] font-mono text-slate-400">Sidewalk Heave • Score: 89</span>
            </div>
          </div>

          {/* 4. Anna Nagar (Resolved Corridor) */}
          <div className="absolute top-[20%] right-[32%] z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-lg px-2.5 py-1 text-center -mt-6 shadow-xl backdrop-blur-sm">
              <span className="block text-[10px] font-mono font-bold text-emerald-300">ANNA NAGAR 2ND AVE</span>
              <span className="text-[9px] font-mono text-slate-400">Resolved Work Orders</span>
            </div>
          </div>

          {/* Floating Stats Panel */}
          <div className="absolute top-4 left-4 bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md grid grid-cols-2 sm:grid-cols-4 gap-4 text-center z-20">
            <div>
              <span className="block text-xl font-bold font-mono text-white">128</span>
              <span className="text-[10px] uppercase text-slate-400">GCC Reports Logged</span>
            </div>
            <div>
              <span className="block text-xl font-bold font-mono text-rose-400">23</span>
              <span className="text-[10px] uppercase text-slate-400">Critical Priority</span>
            </div>
            <div>
              <span className="block text-xl font-bold font-mono text-emerald-400">74</span>
              <span className="text-[10px] uppercase text-slate-400">Repaired / Resolved</span>
            </div>
            <div>
              <span className="block text-xl font-bold font-mono text-cyan-400">15</span>
              <span className="text-[10px] uppercase text-slate-400">Active GCC Zones</span>
            </div>
          </div>

          <div className="absolute bottom-3 right-4 text-[10px] font-mono text-slate-400 z-20 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
            Simulated Greater Chennai Corporation demonstration visualization
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PART 9 — CITIZENS VS AUTHORITIES                              */}
      {/* ============================================================ */}
      <section className="space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
            Unified Ecosystem
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Designed for Citizens & City Authorities
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: FOR CITIZENS */}
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition flex flex-col justify-between space-y-6 text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold">
                <User className="w-3.5 h-3.5" /> FOR CITIZENS
              </div>
              <h3 className="text-2xl font-bold text-white">
                "Your report shouldn't disappear into a queue."
              </h3>
              <p className="text-xs text-slate-400">
                Directly communicate community safety and universal mobility barriers with photographic evidence.
              </p>

              <ul className="space-y-2.5 pt-2 text-xs text-slate-300">
                {[
                  'Report infrastructure issues in under 30 seconds',
                  'Upload live camera photos with location pinning',
                  'Flag wheelchair, ramp, and stroller impediments',
                  'Track real-time report resolution status',
                  'Receive verified dispatch and repair updates'
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to={user ? "/report-issue" : "/sign-in/citizen"}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs transition shadow-lg shadow-cyan-500/20"
            >
              Report an issue <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* RIGHT: FOR AUTHORITIES */}
          <div className="p-8 sm:p-10 rounded-3xl bg-purple-950/20 border border-purple-500/30 hover:border-purple-500/50 transition flex flex-col justify-between space-y-6 text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" /> FOR AUTHORITIES
              </div>
              <h3 className="text-2xl font-bold text-white">
                "Turn infrastructure data into a clear action plan."
              </h3>
              <p className="text-xs text-slate-400">
                Empower public works directors with data-driven Human Impact prioritization and automated work order generation.
              </p>

              <ul className="space-y-2.5 pt-2 text-xs text-slate-300">
                {[
                  'Prioritized repair queue sorted by Human Impact Score',
                  'Explainable algorithmic rationale for every priority',
                  'ADA & Universal mobility bottleneck highlighting',
                  'Simulate repair outcomes with What-If Simulator',
                  '1-Click Municipal Work Order dispatch with SLA tracking'
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to={user ? "/authority" : "/sign-in/authority"}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow-lg shadow-purple-600/20"
            >
              Authority portal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PART 10 — IMPACT                                              */}
      {/* ============================================================ */}
      <section id="impact" className="space-y-8 text-center">
        <div className="max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
            Quantified Action
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            From scattered reports to measurable action.
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { stat: '1,284', label: 'Issues Analyzed', sub: 'Across municipal grid' },
            { stat: '342', label: 'High-Priority Issues', sub: 'Triaged within 24h' },
            { stat: '76%', label: 'Issues Resolved', sub: 'Verified repair rate' },
            { stat: '18', label: 'Active Hotspots', sub: 'Under continuous monitoring' }
          ].map((item) => (
            <div key={item.label} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-cyan-400">{item.stat}</div>
              <div className="text-xs font-bold text-white mt-2">{item.label}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* PART 11 — WHY CIVICMIND                                       */}
      {/* ============================================================ */}
      <section id="why-civicmind" className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
            Core Architecture Pillars
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Why CivicMind
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
          {[
            {
              num: '01',
              title: 'AI-POWERED DETECTION',
              desc: 'Identify infrastructure problems from uploaded images using clean modular computer vision boundaries.',
              icon: Cpu
            },
            {
              num: '02',
              title: 'HUMAN-IMPACT PRIORITIZATION',
              desc: 'Combine severity, accessibility, location, context and history to understand what matters most.',
              icon: Layers
            },
            {
              num: '03',
              title: 'ACTIONABLE REPAIR INTELLIGENCE',
              desc: 'Convert infrastructure intelligence into prioritized repair actions and municipal work orders.',
              icon: FileCheck2
            },
            {
              num: '04',
              title: 'CITY-WIDE VISIBILITY',
              desc: 'Give authorities a unified, explainable view of infrastructure problems and resource allocation.',
              icon: Compass
            }
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.num}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:-translate-y-1 transition duration-300 space-y-4 group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400">{card.num}</span>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 group-hover:text-cyan-400 transition">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* PART 12 — FINAL CTA                                           */}
      {/* ============================================================ */}
      <section className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-slate-900 border border-cyan-500/30 text-center space-y-5 shadow-2xl">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
          Build a city that knows what needs attention.
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          CivicMind connects citizens, infrastructure data and city authorities through one intelligent platform.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3.5">
          <Link
            to={user ? "/report-issue" : "/sign-in/citizen"}
            className="px-6 py-3.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs shadow-lg shadow-cyan-500/25 transition"
          >
            Report an issue →
          </Link>
          <Link
            to={user ? "/authority" : "/sign-in/authority"}
            className="px-6 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
          >
            Authority portal →
          </Link>
        </div>
      </section>

    </div>
  );
};

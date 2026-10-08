import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi } from '../api/reports';
import type { ReportCategory, LocationType, AccessibilityBarrierType, YOLODetectionItem } from '../types';
import { CameraCaptureInput, type AIScanStage } from '../components/CameraCaptureInput';
import { LocationPickerMap } from '../components/LocationPickerMap';
import { 
  AlertTriangle, 
  Footprints, 
  Trash2, 
  TrafficCone, 
  ShieldAlert, 
  Accessibility, 
  HelpCircle, 
  Send, 
  Loader2, 
  Sparkles,
  Camera,
  FileText,
  MapPin,
  ArrowRight,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

export const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();

  // Active Mobile Step: 1 = Evidence, 2 = Details, 3 = Location
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReportCategory>('ACCESSIBILITY');
  const [severity, setSeverity] = useState<string>('HIGH');
  const [locationType, setLocationType] = useState<LocationType>('NONE');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  
  // Accessibility Intelligence
  const [accessibilityBarrier, setAccessibilityBarrier] = useState<AccessibilityBarrierType>('RAMP');
  const [affectsMobility, setAffectsMobility] = useState<boolean>(true);
  const [locationContext, setLocationContext] = useState<string>('TRANSIT_HUB');

  // Evidence & YOLO State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [captureSource, setCaptureSource] = useState<'CAMERA' | 'UPLOAD'>('CAMERA');
  const [detections, setDetections] = useState<YOLODetectionItem[]>([]);
  const [scanStage, setScanStage] = useState<AIScanStage>('idle');
  const [scanMessage, setScanMessage] = useState<string | undefined>(undefined);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions: { id: ReportCategory; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'ACCESSIBILITY', label: 'Accessibility Barrier', icon: <Accessibility className="w-4 h-4" />, desc: 'Ramps, stairs, wheelchair obstacles' },
    { id: 'SIDEWALK', label: 'Broken Sidewalk', icon: <Footprints className="w-4 h-4" />, desc: 'Cracked or missing concrete' },
    { id: 'POTHOLE', label: 'Pothole', icon: <AlertTriangle className="w-4 h-4" />, desc: 'Cavity on road surface' },
    { id: 'ROAD_DAMAGE', label: 'Road Damage / Cracks', icon: <TrafficCone className="w-4 h-4" />, desc: 'Asphalt fissure or subsidence' },
    { id: 'GARBAGE', label: 'Garbage & Waste', icon: <Trash2 className="w-4 h-4" />, desc: 'Overflowing bins obstructing passage' },
    { id: 'SIGNAGE', label: 'Damaged Signage', icon: <ShieldAlert className="w-4 h-4" />, desc: 'Missing stop signs or signals' },
    { id: 'OTHER', label: 'Other Hazard', icon: <HelpCircle className="w-4 h-4" />, desc: 'General municipal issue' },
  ];

  const barrierOptions: { id: AccessibilityBarrierType; label: string }[] = [
    { id: 'RAMP', label: 'Broken / Missing Ramp' },
    { id: 'WHEELCHAIR_ROUTE_BARRIER', label: 'Wheelchair Route Block' },
    { id: 'BLOCKED_SIDEWALK', label: 'Blocked Sidewalk' },
    { id: 'STAIRS', label: 'Stairs (No Ramp)' },
    { id: 'ELEVATOR', label: 'Broken Elevator' },
    { id: 'NARROW_DOOR', label: 'Narrow Passage (<36")' },
    { id: 'INACCESSIBLE_ENTRANCE', label: 'Inaccessible Entrance' },
    { id: 'OBSTACLE', label: 'Physical Obstacle' },
    { id: 'NONE', label: 'No Accessibility Barrier' },
  ];

  const handleLocationChange = (lat: number | null, lng: number | null, type: LocationType) => {
    setLatitude(lat);
    setLongitude(lng);
    setLocationType(type);
  };

  const handleFileSelect = async (file: File | null) => {
    setImageFile(file);
    if (!file) {
      setDetections([]);
      setScanStage('idle');
      setScanMessage(undefined);
      return;
    }

    setScanStage('uploading');
    setScanMessage(undefined);

    try {
      const formData = new FormData();
      formData.append('image', file);

      setTimeout(() => {
        setScanStage((current) => current === 'uploading' ? 'analyzing' : current);
      }, 350);

      const aiRes = await reportsApi.detectHazard(formData);

      setScanStage('complete');
      setDetections(aiRes.detections || []);
      setScanMessage(aiRes.message);

      // If defect detected, auto-populate category, severity, and title if empty
      if (aiRes.success && aiRes.defect && aiRes.detections.length > 0) {
        if (aiRes.category && (categoryOptions.some(c => c.id === aiRes.category))) {
          setCategory(aiRes.category as ReportCategory);
        }
        if (aiRes.severity) {
          setSeverity(aiRes.severity);
        }
        if (!title.trim()) {
          const formattedDefect = aiRes.defect.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          setTitle(`${formattedDefect} detected on transit route`);
        }
        if (aiRes.defect === 'pothole' || aiRes.defect.includes('crack')) {
          setAffectsMobility(true);
        }
      }
    } catch (err: any) {
      console.warn('AI preview detection notice:', err);
      setScanStage('error');
      setScanMessage('AI scan preview was unable to process this image. You can still submit manually.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 3) {
      setError('Please provide a descriptive title (at least 3 characters).');
      setCurrentStep(2);
      return;
    }
    if (description.trim().length < 5) {
      setError('Please describe the issue in more detail (at least 5 characters).');
      setCurrentStep(2);
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('location_type', locationType);
      formData.append('severity', severity);
      formData.append('accessibility_barrier', accessibilityBarrier);
      formData.append('affects_mobility_impaired', affectsMobility ? 'true' : 'false');
      formData.append('location_context', locationContext);
      formData.append('capture_source', captureSource);

      if (latitude != null) formData.append('latitude', latitude.toString());
      if (longitude != null) formData.append('longitude', longitude.toString());
      if (address.trim()) formData.append('address', address.trim());
      if (imageFile) formData.append('image', imageFile);

      const created = await reportsApi.createReport(formData);
      navigate(`/report/${created.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit report. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-28 md:pb-12">
      <div className="space-y-5 sm:space-y-6">
        {/* Mobile Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Mobile Incident Pipeline
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            Report Civic Hazard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Submit infrastructure issues. CivicMind runs on-device YOLO AI and calculates Human Impact priority.
          </p>
        </div>

        {/* Step Indicator Pills (Thumb-friendly mobile tabs) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-slate-800">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              currentStep === 1
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">1. Evidence</span>
            {imageFile && <CheckCircle2 className="w-3 h-3 text-emerald-300 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              currentStep === 2
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">2. Details</span>
            {title.length >= 3 && <CheckCircle2 className="w-3 h-3 text-emerald-300 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              currentStep === 3
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">3. Location</span>
            {latitude != null && <CheckCircle2 className="w-3 h-3 text-emerald-300 ml-0.5" />}
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: VISUAL EVIDENCE & REAL YOLO DETECTION */}
          <div className={currentStep === 1 ? 'block space-y-4' : 'hidden md:block md:space-y-4'}>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
              <CameraCaptureInput
                onFileSelect={handleFileSelect}
                selectedFile={imageFile}
                onCaptureSourceChange={setCaptureSource}
                detections={detections}
                scanStage={scanStage}
                scanMessage={scanMessage}
              />
            </div>

            {/* Mobile Next Button for Step 1 */}
            <div className="md:hidden flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 active:scale-98"
              >
                <span>Continue to Issue Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* STEP 2: ISSUE DETAILS & ACCESSIBILITY */}
          <div className={currentStep === 2 ? 'block space-y-5' : 'hidden md:block md:space-y-5'}>
            {/* Category Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Issue Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categoryOptions.map((opt) => {
                  const isSelected = category === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCategory(opt.id)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-500/20'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={isSelected ? 'text-cyan-400' : 'text-slate-400'}>
                          {opt.icon}
                        </span>
                        <span className="text-xs font-semibold line-clamp-1">{opt.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 line-clamp-1">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Title / Summary
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken Curb Ramp Obstructing Wheelchair Transit"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            {/* Severity & Context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Defect Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="CRITICAL">CRITICAL (Immediate physical hazard)</option>
                  <option value="HIGH">HIGH (Severe degradation / cavity)</option>
                  <option value="MEDIUM">MEDIUM (Moderate defect)</option>
                  <option value="LOW">LOW (Minor cosmetic wear)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Civic Location Context
                </label>
                <select
                  value={locationContext}
                  onChange={(e) => setLocationContext(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="HOSPITAL_CLINIC">🏥 Hospital / Medical Clinic Corridor</option>
                  <option value="TRANSIT_HUB">🚌 Transit Hub / Subway / Bus Arterial</option>
                  <option value="SCHOOL_ZONE">🏫 School Zone / Child Pedestrian Route</option>
                  <option value="COMMERCIAL">🛍️ Commercial Pedestrian Center</option>
                  <option value="RESIDENTIAL">🏡 Residential Street</option>
                  <option value="GENERAL">📍 General Municipal Zone</option>
                </select>
              </div>
            </div>

            {/* Accessibility Intelligence Box */}
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3.5">
              <div className="flex items-center gap-2">
                <Accessibility className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Accessibility & Universal Mobility Intelligence
                  </h3>
                  <p className="text-[11px] text-indigo-300/80">
                    Prioritize repairs for wheelchair users, elderly, and strollers.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Specific Barrier Type
                </label>
                <select
                  value={accessibilityBarrier}
                  onChange={(e) => setAccessibilityBarrier(e.target.value as AccessibilityBarrierType)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-400"
                >
                  {barrierOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={affectsMobility}
                  onChange={(e) => setAffectsMobility(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                />
                <span>
                  Blocks wheelchairs, motorized chairs, strollers, or cane/crutch users
                </span>
              </label>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Detailed Description
                </label>
                <span className="text-[10px] text-slate-400">
                  Mention impact to pedestrians or transit
                </span>
              </div>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the hazard and how it obstructs foot traffic or mobility..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition resize-y"
              />
            </div>

            {/* Mobile Step 2 Controls */}
            <div className="md:hidden flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-1/3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-2/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <span>Continue to Location</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* STEP 3: LOCATION PICKER & SUBMIT */}
          <div className={currentStep === 3 ? 'block space-y-4' : 'hidden md:block md:space-y-4'}>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-400" /> Geographic Location Pin
                </label>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {latitude != null ? 'GPS Corroborated' : 'Pin or Tap'}
                </span>
              </div>

              <LocationPickerMap
                latitude={latitude}
                longitude={longitude}
                onLocationChange={handleLocationChange}
                height="240px"
              />

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Street Address / Landmark <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Near Bus Terminus or Anna Salai crossroad"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            {/* Mobile Step 3 Back Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <div className="text-[11px] text-slate-400 flex-1 text-right">
                Ready for submission
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition transform active:scale-98 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Human Impact & Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit Community Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraCapture } from '../components/report/CameraCapture';
import { CategoryPicker } from '../components/report/CategoryPicker';
import { NearbyCheck } from '../components/report/NearbyCheck';
import { CapturedMedia } from '../hooks/useCamera';
import { useGeolocation } from '../hooks/useGeolocation';
import { useNearbyReports } from '../hooks/useNearbyReports';
import { IssueCategory, Issue } from '../types';
import { issuesApi } from '../services/api';
import { analyzeIssueImage, AIAnalysisResult } from '../services/aiAnalysis';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { Button } from '../components/common/Button';
import confetti from 'canvas-confetti';
import {
  Camera,
  CheckCircle2,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Wand2,
  Loader2,
  X,
} from 'lucide-react';

export const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { coords, address, landmark, accuracy, isMockSuspected, getLocationData, refreshLocation } = useGeolocation();
  const { issues: nearbyIssues, handleUpvote } = useNearbyReports(coords?.latitude, coords?.longitude, 400);
  const { addPoints } = useAuthStore();
  const { addToast } = useToastStore();

  // Multi-step flow state
  // 1 = Camera, 2 = Category & Details, 3 = Duplicate Check, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IssueCategory | null>(null);
  const [description, setDescription] = useState('');
  const [userLandmark, setUserLandmark] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdIssue, setCreatedIssue] = useState<Issue | null>(null);

  // AI Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [aiDismissed, setAiDismissed] = useState(false);

  // Step 1: Media Captured from on-device camera → trigger AI analysis
  const handleMediaCaptured = useCallback(async (media: CapturedMedia) => {
    setCapturedMedia(media);
    setStep(2);

    // Only analyze photos (not video blob URLs)
    if (media.type === 'photo' && media.dataUrl.startsWith('data:')) {
      setIsAnalyzing(true);
      setAiResult(null);
      setAiDismissed(false);

      try {
        const result = await analyzeIssueImage(media.dataUrl);
        if (result) {
          setAiResult(result);
          // Auto-fill form fields with AI suggestions (user can override)
          if (result.title) setTitle(result.title);
          if (result.category) setCategory(result.category);
          if (result.description) setDescription(result.description);
        }
      } catch {
        // Silent failure — user fills manually
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, []);

  // Step 2 to Step 3: Validate and proceed to duplicate check
  const handleProceedToDuplicateCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 5) {
      addToast({
        type: 'error',
        title: 'Title Required',
        message: 'Please provide a short title (at least 5 characters) for the issue.',
      });
      return;
    }
    if (!category) {
      addToast({
        type: 'error',
        title: 'Category Required',
        message: 'Please choose an issue category to proceed.',
      });
      return;
    }
    if (!description.trim() || description.trim().length < 8) {
      addToast({
        type: 'error',
        title: 'Description too short',
        message: 'Please provide at least a brief description of the issue.',
      });
      return;
    }

    // If there are nearby issues, show duplicate check step; otherwise directly submit
    if (nearbyIssues.length > 0) {
      setStep(3);
    } else {
      handleSubmitFinalReport();
    }
  };

  // Step 3: User confirms duplicate -> upvote and redirect
  const handleConfirmDuplicate = async (issueId: string) => {
    try {
      await handleUpvote(issueId);
      addToast({
        type: 'success',
        title: 'Upvote Registered',
        message: 'You supported an existing report instead of creating a duplicate! (+5 pts)',
      });
      navigate(`/tickets/${issueId}`);
    } catch {
      //
    }
  };

  // Final submission
  const handleSubmitFinalReport = async () => {
    if (!capturedMedia || !category) return;

    setIsSubmitting(true);
    try {
      const loc = getLocationData();
      const lat = coords?.latitude ?? loc.latitude;
      const lng = coords?.longitude ?? loc.longitude;
      const liveAddress = address || loc.address;

      const newIssue = await issuesApi.create({
        title: title.trim() || undefined,
        category,
        description,
        latitude: lat,
        longitude: lng,
        address: liveAddress,
        landmark: userLandmark || loc.landmark,
        is_anonymous: isAnonymous,
        photo_blob: capturedMedia.type === 'photo' ? capturedMedia.blob : null,
        photo_data_url: capturedMedia.dataUrl,
        video_blob: capturedMedia.type === 'video' ? capturedMedia.blob : null,
        video_data_url: capturedMedia.type === 'video' ? capturedMedia.dataUrl : undefined,
      });

      // Award gamification points!
      const bonusPoints = capturedMedia.type === 'video' ? 30 : 20;
      addPoints(bonusPoints, `Reported verified civic issue ${newIssue.tracking_id}`);

      // Trigger celebratory confetti effect
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#38bdf8', '#10b981', '#f59e0b'],
      });

      setCreatedIssue(newIssue);
      setStep(4);
    } catch (err: unknown) {
      const errorObj = err as Error;
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: errorObj.message || 'Could not file issue. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-2">
      {/* Step Indicator Header (Except for step 4 success) */}
      {step !== 4 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
            <span>Step {step} of 3</span>
            <span>
              {step === 1 && '1. Capture Live Camera Evidence'}
              {step === 2 && '2. Category & Location Details'}
              {step === 3 && '3. Duplicate Check'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
            <div
              className="bg-brand-600 h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 1: Live On-Device Camera Stream (No <input type="file">) */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Capture Live Photo or 3s Pan Video
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              Civic Connect requires direct camera verification to guarantee real-time evidence authenticity and GPS correlation.
            </p>
          </div>

          <CameraCapture
            onCapture={handleMediaCaptured}
            onCancel={() => navigate('/')}
          />
        </div>
      )}

      {/* STEP 2: Category & Description */}
      {step === 2 && capturedMedia && (
        <form onSubmit={handleProceedToDuplicateCheck} className="space-y-5">
          {/* Media Evidence Thumbnail Preview + AI Status */}
          <div className="bg-white rounded-lg p-3 border border-slate-300 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {capturedMedia.type === 'photo' ? (
                  <img
                    src={capturedMedia.dataUrl}
                    alt="Captured Evidence"
                    className="w-14 h-14 rounded object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <video
                    src={capturedMedia.dataUrl}
                    className="w-14 h-14 rounded object-cover border border-slate-200 shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
                    Verified {capturedMedia.type === 'photo' ? 'Photo' : '3s Pan Video'}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    Auto-stamped with municipal coordinates
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-white text-slate-800 border-slate-300 hover:bg-slate-100 font-semibold shadow-xs"
                onClick={() => setStep(1)}
                icon={<RotateCcw className="w-3.5 h-3.5 text-slate-600" />}
              >
                Retake
              </Button>
            </div>

            {/* AI Analysis Status Bar */}
            {isAnalyzing && (
              <div className="mt-3 flex items-center gap-2.5 px-3.5 py-2.5 bg-indigo-50 rounded border border-indigo-200">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                <span className="text-sm font-medium text-indigo-800">
                  AI analyzing your photo to suggest category & description...
                </span>
              </div>
            )}

            {/* AI Result Summary Badge (dismissible) */}
            {aiResult && !aiDismissed && !isAnalyzing && (
              <div className="mt-3 flex items-center justify-between gap-3 px-3.5 py-2.5 bg-amber-50 rounded border border-amber-200">
                <div className="flex items-center gap-2 min-w-0">
                  <Wand2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-sm font-medium text-amber-900 truncate">
                    AI suggestions auto-filled. You can edit any field.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAiDismissed(true)}
                  className="text-amber-700 hover:text-amber-900 shrink-0 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Issue Title (AI-generated or user-entered) */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Issue Title <span className="text-red-500">*</span>
              {aiResult && title === aiResult.title && !aiDismissed && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <Wand2 className="w-3 h-3" /> AI Suggested
                </span>
              )}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Deep pothole near school gate causing accidents"
              className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400"
              required
            />
          </div>

          {/* Category Picker */}
          <div>
            {aiResult && category === aiResult.category && !aiDismissed && (
              <div className="mb-2">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <Wand2 className="w-3 h-3" /> AI Suggested Category
                </span>
              </div>
            )}
            <CategoryPicker selectedCategory={category} onSelect={setCategory} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Issue Description <span className="text-red-500">*</span>
              {aiResult && description === aiResult.description && !aiDismissed && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <Wand2 className="w-3 h-3" /> AI Suggested
                </span>
              )}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what's wrong (e.g., Deep 2-foot pothole on left lane right outside school gate. Dangerous at night)."
              className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400 leading-relaxed"
              required
            />
          </div>

          {/* Landmark / Reference */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Landmark / Street Reference
            </label>
            <input
              type="text"
              value={userLandmark}
              onChange={(e) => setUserLandmark(e.target.value)}
              placeholder="E.g., Near Bus Stand / Opposite Market Gate"
              className="w-full px-3.5 py-2.5 rounded-md border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Live GPS Auto-Tagged Info Card */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between gap-3 text-sm">
            <div className="flex items-start gap-3 min-w-0">
              <MapPin className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">Incident Location</span>
                  <span className="text-xs font-medium px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    GPS Active
                  </span>
                </div>
                <p className="text-slate-800 font-medium text-sm mt-1 truncate">
                  {address || (coords ? `Coordinates: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` : 'Acquiring location...')}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {coords
                    ? `Lat: ${coords.latitude.toFixed(5)}, Lng: ${coords.longitude.toFixed(5)} (±${accuracy || 5}m)`
                    : 'Acquiring GPS fix...'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={refreshLocation}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 shrink-0 self-center underline"
            >
              Recalibrate
            </button>
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="anon"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
            />
            <label htmlFor="anon" className="text-sm font-medium text-slate-700">
              Submit anonymously (hide your name on public map)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setStep(1)}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
              className="flex-1"
            >
              Continue to Duplicate Check
            </Button>
          </div>
        </form>
      )}

      {/* STEP 3: Nearby Duplicate Prevention Check */}
      {step === 3 && (
        <div className="space-y-4">
          <NearbyCheck
            nearbyIssues={nearbyIssues}
            onConfirmDuplicate={handleConfirmDuplicate}
            onProceedAnyway={handleSubmitFinalReport}
            isUpvoting={isSubmitting}
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setStep(2)}
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Back to Edit Details
          </Button>
        </div>
      )}

      {/* STEP 4: Submission Confirmation & SLA Clock */}
      {step === 4 && createdIssue && (
        <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-300 shadow-xs text-center space-y-5">
          <div className="w-14 h-14 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-300">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 text-slate-800 border border-slate-300 text-xs font-mono font-medium mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>+20 Civic Points Earned</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Issue Successfully Logged</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Your grievance has been routed to Municipal Field Operations and assigned a real-time SLA countdown clock.
            </p>
          </div>

          {/* Ticket Tracking Badge Box */}
          <div className="p-4 bg-slate-50 rounded border border-slate-300 max-w-md mx-auto text-left space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Tracking Reference:</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                {createdIssue.tracking_id}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Guaranteed SLA Target:</span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {createdIssue.sla_hours} Hours SLA
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Assigned Ward:</span>
              <span className="font-bold text-slate-800">{createdIssue.location.ward}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(`/tickets/${createdIssue.id}`)}
              icon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Track Ticket SLA Live
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto"
            >
              Return to Feed
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

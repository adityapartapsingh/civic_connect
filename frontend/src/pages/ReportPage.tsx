import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraCapture } from '../components/report/CameraCapture';
import { CategoryPicker } from '../components/report/CategoryPicker';
import { NearbyCheck } from '../components/report/NearbyCheck';
import { CapturedMedia } from '../hooks/useCamera';
import { useGeolocation } from '../hooks/useGeolocation';
import { useNearbyReports } from '../hooks/useNearbyReports';
import { IssueCategory, Issue } from '../types';
import { issuesApi } from '../services/api';
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
} from 'lucide-react';

export const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { coords, ward, address, landmark, accuracy, isMockSuspected, getLocationData } = useGeolocation();
  const { issues: nearbyIssues, handleUpvote } = useNearbyReports(coords?.latitude, coords?.longitude, 400);
  const { addPoints } = useAuthStore();
  const { addToast } = useToastStore();

  // Multi-step flow state
  // 1 = Camera, 2 = Category & Details, 3 = Duplicate Check, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia | null>(null);
  const [category, setCategory] = useState<IssueCategory | null>(null);
  const [description, setDescription] = useState('');
  const [userLandmark, setUserLandmark] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdIssue, setCreatedIssue] = useState<Issue | null>(null);

  // Step 1: Media Captured from on-device camera
  const handleMediaCaptured = (media: CapturedMedia) => {
    setCapturedMedia(media);
    setStep(2);
  };

  // Step 2 to Step 3: Validate and proceed to duplicate check
  const handleProceedToDuplicateCheck = (e: React.FormEvent) => {
    e.preventDefault();
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

      const newIssue = await issuesApi.create({
        category,
        description,
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.address,
        landmark: userLandmark || loc.landmark,
        ward: loc.ward,
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
          {/* Media Evidence Thumbnail Preview */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              {capturedMedia.type === 'photo' ? (
                <img
                  src={capturedMedia.dataUrl}
                  alt="Captured Evidence"
                  className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0"
                />
              ) : (
                <video
                  src={capturedMedia.dataUrl}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0"
                />
              )}
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
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
              onClick={() => setStep(1)}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Retake
            </Button>
          </div>

          {/* Category Picker */}
          <CategoryPicker selectedCategory={category} onSelect={setCategory} />

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Issue Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what's wrong (e.g., Deep 2-foot pothole on left lane right outside metro gate 2. Dangerous at night)."
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400"
              required
            />
          </div>

          {/* Landmark / Reference */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Prominent Landmark / Street Note
            </label>
            <input
              type="text"
              value={userLandmark}
              onChange={(e) => setUserLandmark(e.target.value)}
              placeholder="E.g., In front of Reliance Smart / Near Bus Stand"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400"
            />
          </div>

          {/* GPS Auto-Tagged Info Card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3 text-xs">
            <MapPin className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-slate-900">
                {address || 'Koramangala 4th Block, Bengaluru'}
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Ward: <strong>{ward || 'Ward 18 - Koramangala'}</strong> · Accurate within ±{accuracy || 8}m
              </p>
            </div>
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anon"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
            />
            <label htmlFor="anon" className="text-xs font-semibold text-slate-700">
              Submit anonymously (hide your citizen name on public map)
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
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>+20 Civic Points Earned!</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">Issue Successfully Filed</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Your report has been logged with BBMP South Zone maintenance dispatch and assigned a real-time SLA countdown clock.
            </p>
          </div>

          {/* Ticket Tracking Badge Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-left space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Tracking Reference:</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {createdIssue.tracking_id}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Guaranteed SLA Target:</span>
              <span className="font-bold text-brand-600 flex items-center gap-1">
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

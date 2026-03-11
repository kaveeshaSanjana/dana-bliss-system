import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  profileImageApi,
  type ImageStatusResponse,
  type ImageHistoryEntry,
  type ImageHistoryResponse,
} from '@/api/profileImage.api';
import { getImageUrl } from '@/utils/imageUrlHelper';
import {
  Camera, Clock, CheckCircle2, XCircle, AlertCircle,
  History, ImageIcon, RefreshCw, ChevronDown, ChevronUp,
  Shield, Info,
} from 'lucide-react';
import ProfileImageUpload from '@/components/ProfileImageUpload';

interface ProfileImageSectionProps {
  currentImageUrl: string;
  onImageUpdate: (url: string) => void;
}

const STATUS_CONFIG = {
  PENDING: { icon: Clock, label: 'Under Review', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  VERIFIED: { icon: CheckCircle2, label: 'Verified', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  REJECTED: { icon: XCircle, label: 'Rejected', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const ProfileImageSection: React.FC<ProfileImageSectionProps> = ({ currentImageUrl, onImageUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<ImageStatusResponse | null>(null);
  const [history, setHistory] = useState<ImageHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [statusError, setStatusError] = useState(false);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setStatusError(false);
      const data = await profileImageApi.getImageStatus();
      setStatus(data);
    } catch (err) {
      console.log('Image status endpoint not available yet:', err);
      setStatusError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const data = await profileImageApi.getImageHistory();
      setHistory(data);
    } catch (err) {
      console.log('Image history endpoint not available yet:', err);
      toast({ title: 'Info', description: 'Image history is not available yet.', variant: 'default' });
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    if (showHistory && !history) {
      loadHistory();
    }
  }, [showHistory]);

  const canChange = status
    ? status.imageChangesRemaining > 0 && !status.pendingImage
    : true; // Allow change if status API not available

  const handleImageUploaded = (newUrl: string) => {
    onImageUpdate(newUrl);
    setShowUploadDialog(false);
    // Reload status after upload
    setTimeout(() => loadStatus(), 1000);
  };

  // If the status API is not available, show a simpler version
  if (statusError) {
    return (
      <div className="space-y-4">
        {/* Simple Image Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" /> Profile Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                <AvatarImage src={currentImageUrl} alt="Profile" className="object-cover" />
                <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                  {user?.firstName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {currentImageUrl ? 'Current profile image' : 'No image uploaded'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a clear passport-style photo. Max 5MB (JPEG, PNG, WebP).
                </p>
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => setShowUploadDialog(true)}
                >
                  <Camera className="h-3.5 w-3.5 mr-1.5" />
                  {currentImageUrl ? 'Change Photo' : 'Upload Photo'}
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50 border border-border/50">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Your image will be reviewed by an admin before it appears on your profile. You can change your image up to 3 times.
              </p>
            </div>
          </CardContent>
        </Card>

        <ProfileImageUpload
          currentImageUrl={currentImageUrl}
          onImageUpdate={handleImageUploaded}
          isOpen={showUploadDialog}
          onClose={() => setShowUploadDialog(false)}
          dialogOnly
        />
      </div>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" /> Profile Image
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={loadStatus} className="h-8">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Image + Change Counter */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 ring-2 ring-primary/20 shrink-0">
              <AvatarImage
                src={status?.currentVerifiedImage ? getImageUrl(status.currentVerifiedImage) : currentImageUrl}
                alt="Profile"
                className="object-cover"
              />
              <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                {user?.firstName?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs font-medium">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  {status?.imageChangesUsed || 0} / {status?.maxImageChanges || 3} changes used
                </Badge>
              </div>

              {status?.imageChangesRemaining !== undefined && status.imageChangesRemaining > 0 && (
                <p className="text-xs text-muted-foreground">
                  {status.imageChangesRemaining} change{status.imageChangesRemaining !== 1 ? 's' : ''} remaining
                </p>
              )}

              {status?.imageChangesRemaining === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  All image changes used. Contact support for assistance.
                </p>
              )}

              <Button
                size="sm"
                onClick={() => setShowUploadDialog(true)}
                disabled={!canChange}
                className="mt-1"
              >
                <Camera className="h-3.5 w-3.5 mr-1.5" />
                {currentImageUrl ? 'Change Photo' : 'Upload Photo'}
              </Button>
            </div>
          </div>

          {/* Pending Image Banner */}
          {status?.pendingImage && (
            <div className={`flex items-start gap-3 p-3 rounded-xl border ${STATUS_CONFIG.PENDING.border} ${STATUS_CONFIG.PENDING.bg}`}>
              <Clock className={`h-5 w-5 shrink-0 mt-0.5 ${STATUS_CONFIG.PENDING.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">New image under review</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your current verified image will remain visible until the new one is approved.
                </p>
                {status.pendingImage.uploadedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted: {new Date(status.pendingImage.uploadedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Info */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50 border border-border/50">
            <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Images are reviewed by an admin before appearing on your profile.</p>
              <p>Accepted formats: JPEG, PNG, WebP · Max size: 5MB</p>
              <p>Rejected images can be re-uploaded without using a change slot.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image History Toggle */}
      <Card>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors rounded-lg"
        >
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Image History</span>
            {history && (
              <Badge variant="secondary" className="text-xs">
                {history.totalChanges}/{history.maxChanges} changes
              </Badge>
            )}
          </div>
          {showHistory ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {showHistory && (
          <CardContent className="pt-0 pb-4">
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : !history || history.history.length === 0 ? (
              <div className="text-center py-8">
                <ImageIcon className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No image history yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.history.map((entry) => {
                  const cfg = STATUS_CONFIG[entry.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border ${entry.isCurrent ? cfg.border : 'border-border/50'} ${entry.isCurrent ? cfg.bg : 'bg-background'} transition-colors`}
                    >
                      {entry.imageUrl ? (
                        <Avatar className="h-12 w-12 shrink-0 rounded-lg">
                          <AvatarImage src={getImageUrl(entry.imageUrl)} alt={`Version ${entry.changeNumber}`} className="object-cover" />
                          <AvatarFallback className="rounded-lg bg-muted text-xs">V{entry.changeNumber}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-12 w-12 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                          <XCircle className="h-5 w-5 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground">
                            {entry.changeNumber === 0 ? 'Initial Upload' : `Change #${entry.changeNumber}`}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${cfg.badge}`}>
                            <StatusIcon className="h-3 w-3" />
                            {cfg.label}
                          </span>
                          {entry.isCurrent && (
                            <Badge variant="secondary" className="text-[10px]">Current</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploaded: {new Date(entry.uploadedAt).toLocaleDateString()}
                          {entry.verifiedAt && ` · Verified: ${new Date(entry.verifiedAt).toLocaleDateString()}`}
                        </p>
                        {entry.rejectionReason && (
                          <p className="text-xs text-red-500 mt-1 flex items-start gap-1">
                            <XCircle className="h-3 w-3 mt-0.5 shrink-0" />
                            {entry.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Upload Dialog */}
      <ProfileImageUpload
        currentImageUrl={currentImageUrl}
        onImageUpdate={handleImageUploaded}
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        dialogOnly
      />
    </div>
  );
};

export default ProfileImageSection;

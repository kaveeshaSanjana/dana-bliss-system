import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createLectureWithDocuments } from "@/services/api";
import { useS3Upload } from "@/hooks/useS3Upload";
import { validateFile, FILE_CONSTRAINTS } from "@/utils/fileValidation";
import { Progress } from "@/components/ui/progress";
import type { DocumentType } from "@/types/upload";
import { useUserRole } from "@/hooks/useUserRole";

interface CreateLectureFormProps {
  causeId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateLectureForm = ({ causeId, onSuccess, onCancel }: CreateLectureFormProps) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [venue, setVenue] = useState("");
  const [mode, setMode] = useState("online");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [liveLink, setLiveLink] = useState("");
  const [liveMode, setLiveMode] = useState("meet");
  const [recordingUrl, setRecordingUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [documents, setDocuments] = useState<File[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const { uploadFile, uploading, progress } = useS3Upload();
  const backendUrl = useUserRole((state) => state.backendUrl);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Validate each file
      for (const file of newFiles) {
        const validation = validateFile(file, FILE_CONSTRAINTS.LECTURE_DOCUMENT);
        if (!validation.valid) {
          toast.error(`${file.name}: ${validation.errors.join(', ')}`);
          return;
        }
      }
      
      setDocuments(prev => [...prev, ...newFiles]);
      setDocumentTypes(prev => [...prev, ...newFiles.map(() => 'OTHER' as DocumentType)]);
    }
  };

  const removeFile = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
    setDocumentTypes(prev => prev.filter((_, i) => i !== index));
  };

  const updateDocumentType = (index: number, type: DocumentType) => {
    setDocumentTypes(prev => {
      const newTypes = [...prev];
      newTypes[index] = type;
      return newTypes;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Combine date and time for start and end
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const startDateTime = new Date(startDate);
      startDateTime.setHours(startHours, startMinutes, 0, 0);
      
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      const endDateTime = new Date(endDate);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      // Step 1: Create lecture without documents first
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("content", content);
      formData.append("venue", venue);
      formData.append("mode", mode);
      formData.append("timeStart", startDateTime.toISOString());
      formData.append("timeEnd", endDateTime.toISOString());
      formData.append("liveLink", liveLink);
      formData.append("liveMode", liveMode);
      if (recordingUrl.trim()) {
        formData.append("recordingUrl", recordingUrl);
      }
      formData.append("isPublic", isPublic.toString());

      const lectureResponse = await createLectureWithDocuments(causeId, formData);
      const lectureId = lectureResponse.id;

      // Step 2: Upload documents to S3 if any
      if (documents.length > 0) {
        for (let i = 0; i < documents.length; i++) {
          const file = documents[i];
          const docType = documentTypes[i] || 'OTHER';
          const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

          try {
            await uploadFile(
              file,
              '/organization/api/v1/signed-urls/lecture/document',
              {
                lectureId: lectureId.toString(),
                documentType: docType,
                fileExtension,
                fileName: file.name
              }
            );
          } catch (uploadError) {
            console.error(`Failed to upload ${file.name}:`, uploadError);
            toast.error(`Failed to upload ${file.name}`);
          }
        }
      }

      toast.success("Lecture created successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error creating lecture:", error);
      toast.error("Failed to create lecture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter lecture title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter lecture description"
          required
        />
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter lecture content details"
        />
      </div>

      <div>
        <Label htmlFor="venue">Venue</Label>
        <Input
          id="venue"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          placeholder="Enter venue"
        />
      </div>

      <div>
        <Label htmlFor="mode">Mode</Label>
        <Select value={mode} onValueChange={setMode}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start Date & Time *</Label>
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>End Date & Time *</Label>
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="liveLink">Live Link</Label>
        <Input
          id="liveLink"
          value={liveLink}
          onChange={(e) => setLiveLink(e.target.value)}
          placeholder="Enter live meeting link"
        />
      </div>

      <div>
        <Label htmlFor="liveMode">Live Mode</Label>
        <Select value={liveMode} onValueChange={setLiveMode}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="meet">Google Meet</SelectItem>
            <SelectItem value="zoom">Zoom</SelectItem>
            <SelectItem value="teams">Microsoft Teams</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="recordingUrl">Recording URL</Label>
        <Input
          id="recordingUrl"
          value={recordingUrl}
          onChange={(e) => setRecordingUrl(e.target.value)}
          placeholder="Enter recording URL"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isPublic"
          checked={isPublic}
          onCheckedChange={setIsPublic}
        />
        <Label htmlFor="isPublic">Make lecture public</Label>
      </div>

      <div>
        <Label>Documents</Label>
        <div className="space-y-2">
          <Input
            type="file"
            multiple
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          {documents.length > 0 && (
            <div className="space-y-2">
              {documents.map((file, index) => (
                <div key={index} className="space-y-2 p-3 bg-muted rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Select
                    value={documentTypes[index]}
                    onValueChange={(value) => updateDocumentType(index, value as DocumentType)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESENTATION">Presentation</SelectItem>
                      <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                      <SelectItem value="READING_MATERIAL">Reading Material</SelectItem>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="AUDIO">Audio</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || uploading}>
          {uploading ? `Uploading... ${progress}%` : loading ? "Creating..." : "Create Lecture"}
        </Button>
      </div>

      {uploading && (
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">Uploading documents... {progress}%</p>
        </div>
      )}
    </form>
  );
};

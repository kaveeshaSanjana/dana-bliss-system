import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { updateLectureWithDocuments } from "@/services/api";

interface Lecture {
  lectureId: string;
  title: string;
  description: string;
  content?: string;
  venue: string;
  mode: string;
  timeStart: string;
  timeEnd: string;
  liveLink: string | null;
  liveMode: string | null;
  recordingUrl: string | null;
  isPublic: boolean;
}

interface UpdateLectureFormProps {
  lecture: Lecture;
  onSuccess: () => void;
  onCancel: () => void;
}

export const UpdateLectureForm = ({ lecture, onSuccess, onCancel }: UpdateLectureFormProps) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(lecture.title);
  const [description, setDescription] = useState(lecture.description);
  const [content, setContent] = useState(lecture.content || "");
  const [venue, setVenue] = useState(lecture.venue);
  const [mode, setMode] = useState(lecture.mode);
  const [startDate, setStartDate] = useState<Date>(new Date(lecture.timeStart));
  const [endDate, setEndDate] = useState<Date>(new Date(lecture.timeEnd));
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [liveLink, setLiveLink] = useState(lecture.liveLink || "");
  const [liveMode, setLiveMode] = useState(lecture.liveMode || "meet");
  const [recordingUrl, setRecordingUrl] = useState(lecture.recordingUrl || "");
  const [isPublic, setIsPublic] = useState(lecture.isPublic);
  const [documents, setDocuments] = useState<File[]>([]);

  useEffect(() => {
    // Extract time from the datetime
    const start = new Date(lecture.timeStart);
    const end = new Date(lecture.timeEnd);
    setStartTime(`${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`);
    setEndTime(`${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`);
  }, [lecture]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setDocuments(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      // Combine date and time for start and end
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const startDateTime = new Date(startDate);
      startDateTime.setHours(startHours, startMinutes, 0, 0);
      
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      const endDateTime = new Date(endDate);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

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
      
      documents.forEach((file) => {
        formData.append("uploadedDocuments", file);
      });

      await updateLectureWithDocuments(lecture.lectureId, formData);
      toast.success("Lecture updated successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error updating lecture:", error);
      toast.error("Failed to update lecture");
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
                  onSelect={(date) => date && setStartDate(date)}
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
                  onSelect={(date) => date && setEndDate(date)}
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
        <Label>Add New Documents</Label>
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
                <div key={index} className="flex items-center justify-between p-2 border rounded">
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
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Lecture"}
        </Button>
      </div>
    </form>
  );
};

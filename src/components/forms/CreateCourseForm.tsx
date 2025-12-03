import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { toast } from "sonner";
import { createCourseWithImage } from "@/services/api";
import { useS3Upload } from "@/hooks/useS3Upload";
import { validateFile, FILE_CONSTRAINTS } from "@/utils/fileValidation";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must be less than 200 characters"),
  description: z.string().refine(
    (val) => val === "" || (val.length >= 10 && val.length <= 5000),
    { message: "Description must be 10-5000 characters if provided" }
  ),
  introVideoUrl: z.string().refine(
    (val) => val === "" || /^https?:\/\//.test(val),
    { message: "URL must start with http:// or https://" }
  ),
  isPublic: z.boolean().optional().default(true),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CreateCourseFormProps {
  organizationId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateCourseForm = ({ organizationId, onSuccess, onCancel }: CreateCourseFormProps) => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { uploadFile, uploading, progress } = useS3Upload();

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      introVideoUrl: "",
      isPublic: true,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const validation = validateFile(file, FILE_CONSTRAINTS.CAUSE_IMAGE);
      if (!validation.valid) {
        toast.error(validation.errors.join(', '));
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");
  };

  const onSubmit = async (values: CourseFormValues) => {
    if (!organizationId || !/^\d+$/.test(organizationId)) {
      toast.error("Invalid organization ID");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = '';

      if (image) {
        const fileExtension = '.' + image.name.split('.').pop()?.toLowerCase();
        const uploadResult = await uploadFile(
          image,
          '/organization/api/v1/signed-urls/cause',
          {
            causeId: organizationId.toString(),
            fileExtension
          }
        );
        imageUrl = uploadResult.publicUrl;
      }

      await createCourseWithImage({
        title: values.title,
        description: values.description || undefined,
        organizationId,
        isPublic: values.isPublic ?? true,
        ...(values.introVideoUrl && { introVideoUrl: values.introVideoUrl }),
        ...(imageUrl && { imageUrl }),
      });
      toast.success("Course created successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="Enter course title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter course description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="introVideoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Intro Video URL</FormLabel>
              <FormControl>
                <Input placeholder="Enter intro video URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Course Image</FormLabel>
          <div className="space-y-2 mt-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0">Make course public</FormLabel>
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || uploading}>
            {uploading ? `Uploading... ${progress}%` : loading ? "Creating..." : "Create Course"}
          </Button>
        </div>

        {uploading && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">Uploading image... {progress}%</p>
          </div>
        )}
      </form>
    </Form>
  );
};

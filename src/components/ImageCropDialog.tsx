import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle } from "lucide-react";

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedImage: Blob) => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Set canvas size to 35mm x 45mm at 300 DPI (standard photo print resolution)
  // 35mm = 413px, 45mm = 531px at 300 DPI
  canvas.width = 413;
  canvas.height = 531;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Canvas is empty"));
      }
    }, "image/jpeg", 0.95);
  });
}

export const ImageCropDialog = ({ open, onOpenChange, imageSrc, onCropComplete }: ImageCropDialogProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const onCropCompleteHandler = useCallback(
    async (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // Generate preview when crop area changes (debounced)
  useEffect(() => {
    if (!croppedAreaPixels || !imageSrc) return;

    const generatePreview = async () => {
      setIsGeneratingPreview(true);
      try {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        const url = URL.createObjectURL(croppedImage);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsGeneratingPreview(false);
      }
    };

    const timer = setTimeout(generatePreview, 300);
    return () => clearTimeout(timer);
  }, [croppedAreaPixels, imageSrc]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClose = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Crop Profile Photo (35mm × 45mm)
          </DialogTitle>
          <DialogDescription>
            Position your face within the frame. This will be used for your ID card and official documents.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Crop Area */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Adjust Position</p>
            <div className="relative h-[400px] w-full bg-muted rounded-lg overflow-hidden border-2 border-border">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={1}
                aspect={35 / 45}
                onCropChange={setCrop}
                onCropComplete={onCropCompleteHandler}
                showGrid={true}
                cropShape="rect"
                objectFit="contain"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Drag the image to position your face in the center
            </p>
          </div>

          {/* Preview - Passport Style 2x2 Grid */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Preview (Passport Photo Style)</p>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border-2 border-border">
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((index) => (
                  <div 
                    key={index}
                    className="aspect-[35/45] bg-white dark:bg-gray-900 rounded shadow-md overflow-hidden flex items-center justify-center"
                  >
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground p-2">
                        <Camera className="w-6 h-6 mb-1 opacity-50" />
                        <span className="text-[10px]">Preview</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-3">
                Standard passport photo format (35mm × 45mm)
              </p>
            </div>

            {/* Guidelines */}
            <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
              <h4 className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Photo Guidelines
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Face should be clearly visible</li>
                <li>• Eyes open and looking at camera</li>
                <li>• Neutral expression preferred</li>
                <li>• Head centered in the frame</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="w-full sm:w-auto bg-gradient-primary"
            disabled={!croppedAreaPixels || isGeneratingPreview}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Save Photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

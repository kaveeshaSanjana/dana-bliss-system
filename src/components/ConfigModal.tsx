import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ConfigModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState(localStorage.getItem('api_base_url') || 'https://lms-923357517997.europe-west1.run.app');
  const [secondBaseUrl, setSecondBaseUrl] = useState(localStorage.getItem('api_second_base_url') || 'https://laas-backend-02-923357517997.europe-west1.run.app');
  const [thirdBaseUrl, setThirdBaseUrl] = useState(localStorage.getItem('api_third_base_url') || 'http://localhost:3002');
  const { toast } = useToast();

  const handleSave = () => {
    localStorage.setItem('api_base_url', baseUrl);
    localStorage.setItem('api_second_base_url', secondBaseUrl);
    localStorage.setItem('api_third_base_url', thirdBaseUrl);
    toast({
      title: "Configuration saved",
      description: "Backend URLs have been updated successfully.",
    });
    setIsOpen(false);
    window.location.reload(); // Reload to apply new config
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Backend URL
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Backend Configuration</DialogTitle>
          <DialogDescription>
            Configure the backend API URLs for your application.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseUrl">First Backend Base URL</Label>
            <Input
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://lms-923357517997.europe-west1.run.app"
            />
            <p className="text-sm text-muted-foreground">
              Enter the base URL for your primary backend API
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondBaseUrl">Second Backend Base URL</Label>
            <Input
              id="secondBaseUrl"
              value={secondBaseUrl}
              onChange={(e) => setSecondBaseUrl(e.target.value)}
              placeholder="https://laas-backend-02-923357517997.europe-west1.run.app"
            />
            <p className="text-sm text-muted-foreground">
              Enter the base URL for your secondary backend API
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="thirdBaseUrl">Third Backend Base URL</Label>
            <Input
              id="thirdBaseUrl"
              value={thirdBaseUrl}
              onChange={(e) => setThirdBaseUrl(e.target.value)}
              placeholder="http://localhost:3002"
            />
            <p className="text-sm text-muted-foreground">
              Enter the base URL for your organization backend API
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
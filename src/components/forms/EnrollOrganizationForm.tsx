import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EnrollOrganizationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const EnrollOrganizationForm = ({ onSuccess, onCancel }: EnrollOrganizationFormProps) => {
  const { backendUrl, accessToken } = useUserRole();
  const [organizationId, setOrganizationId] = useState("");
  const [enrollmentKey, setEnrollmentKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationId.trim() || !enrollmentKey.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!backendUrl || !accessToken) {
      toast.error("Authentication required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${backendUrl}/organization/api/v1/organizations/enroll`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            organizationId,
            enrollmentKey,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to enroll in organization');
      }

      const result = await response.json();
      
      if (result.enrollmentStatus === 'pending_verification') {
        toast.success(result.message || "Successfully enrolled. Awaiting verification.");
      } else {
        toast.success("Successfully enrolled in organization");
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to enroll in organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="organizationId">Organization ID</Label>
        <Input
          id="organizationId"
          type="text"
          value={organizationId}
          onChange={(e) => setOrganizationId(e.target.value)}
          placeholder="Enter organization ID"
          disabled={loading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="enrollmentKey">Enrollment Key</Label>
        <Input
          id="enrollmentKey"
          type="text"
          value={enrollmentKey}
          onChange={(e) => setEnrollmentKey(e.target.value)}
          placeholder="Enter enrollment key"
          disabled={loading}
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enroll
        </Button>
      </div>
    </form>
  );
};

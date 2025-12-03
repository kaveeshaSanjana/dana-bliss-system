import { useParams, useNavigate, Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function OrganizationLayout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendUrl, accessToken } = useUserRole();
  const [organization, setOrganization] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!backendUrl || !accessToken || !id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${backendUrl}/organization/api/v1/organizations/user/enrolled?page=1&limit=100`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch organizations');
        }

        const data = await response.json();
        const org = data.data.find((o: any) => o.organizationId === id);
        
        if (org) {
          setOrganization({ id: org.organizationId, name: org.name });
        } else {
          toast.error("Organization not found");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error('Error fetching organization:', error);
        toast.error("Failed to load organization");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [id, backendUrl, accessToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar 
          variant="organization" 
          currentOrganization={organization}
        />
        <Outlet context={{ organization }} />
      </div>
    </SidebarProvider>
  );
}

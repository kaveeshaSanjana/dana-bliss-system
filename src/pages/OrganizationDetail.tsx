import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell } from "lucide-react";

const OrganizationDetail = () => {
  const navigate = useNavigate();
  const { organization } = useOutletContext<{ organization: { id: string; name: string } | null }>();

  return (
    <main className="flex-1">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-4 px-6">
          <SidebarTrigger />
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Announcement</h1>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="p-6 rounded-full bg-primary/10">
              <Bell className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold">Announcements</h2>
          <p className="text-xl text-muted-foreground">Feature Coming Soon</p>
        </div>
      </div>
    </main>
  );
};

export default OrganizationDetail;

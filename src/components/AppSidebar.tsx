import { Building2, Users, BookOpen, Bell, UserCheck, UserX, LogOut, Globe, ChevronLeft, LayoutDashboard } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";

interface AppSidebarProps {
  currentOrganization?: { id: string; name: string } | null;
  currentCourse?: { id: string; name: string } | null;
  variant?: "main" | "organization" | "course";
}

export function AppSidebar({ currentOrganization, currentCourse, variant = "main" }: AppSidebarProps) {
  const navigate = useNavigate();
  const { getCurrentRole, user, logout } = useUserRole();
  const effectiveRole = currentOrganization ? getCurrentRole(currentOrganization.id) : null;

  const mainMenuItems = [
    { title: "Organizations", url: "/dashboard", icon: Building2 },
    { title: "Global Organizations", url: "/dashboard/global", icon: Globe },
  ];

  // Role-based organization menu
  const getOrganizationMenuItems = () => {
    const baseItems = [
      { title: "Announcement", url: `/organization/${currentOrganization?.id}`, icon: Bell },
      { title: "Courses", url: `/organization/${currentOrganization?.id}/courses`, icon: BookOpen },
    ];

    // Member and Moderator only see Gallery and Courses
    if (effectiveRole === 'MEMBER' || effectiveRole === 'MODERATOR') {
      return baseItems;
    }

    // President and Admin see all sections
    if (effectiveRole === 'PRESIDENT' || effectiveRole === 'ADMIN') {
      return [
        ...baseItems,
        { title: "Members", url: `/organization/${currentOrganization?.id}/members`, icon: UserCheck },
        { title: "Unverified Members", url: `/organization/${currentOrganization?.id}/unverified`, icon: UserX },
      ];
    }

    return baseItems;
  };

  const courseMenuItems = [
    { title: "Lectures", url: `/course/${currentCourse?.id}`, icon: BookOpen },
  ];

  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-blue-100/60 dark:bg-blue-100/10 text-gray-900 dark:text-white font-semibold" 
      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Sidebar className="border-r bg-white dark:bg-gray-950">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-semibold text-base truncate">Suraksha OMS</span>
            <span className="text-xs text-muted-foreground truncate">Organization Management System</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {(currentOrganization || currentCourse) && (
          <div className="mb-6 px-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-3 -ml-2 h-8 text-sm text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => navigate('/dashboard')}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">Current Selection</p>
              {currentOrganization && (
                <p className="text-sm text-muted-foreground">
                  Organization: <span className="font-medium text-foreground">{currentOrganization.name}</span>
                </p>
              )}
              {currentCourse && (
                <p className="text-sm text-muted-foreground">
                  Course: <span className="font-medium text-foreground">{currentCourse.name}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {variant === "course" && currentCourse && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-3">
              Course Management
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {courseMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-12">
                      <NavLink to={item.url} className={getNavClassName}>
                        <item.icon className="h-5 w-5 ml-2" />
                        <span className="ml-3 text-[15px]">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {variant === "organization" && currentOrganization && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-3">
              Organization
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {getOrganizationMenuItems().map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-12">
                      <NavLink to={item.url} end className={getNavClassName}>
                        <item.icon className="h-5 w-5 ml-2" />
                        <span className="ml-3 text-[15px]">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {variant === "main" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-3">
              Main
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {mainMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-12">
                      <NavLink to={item.url} end className={getNavClassName}>
                        <item.icon className="h-5 w-5 ml-2" />
                        <span className="ml-3 text-[15px]">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t mt-auto p-4">
        {user && (
          <div className="px-2 mb-3 space-y-1">
            <p className="text-xs text-muted-foreground">Logged in as:</p>
            <p className="text-sm font-medium">{user.name}</p>
            {currentOrganization && effectiveRole && (
              <p className="text-xs text-muted-foreground">Role: {effectiveRole}</p>
            )}
          </div>
        )}
        <Button 
          variant="ghost" 
          className="w-full justify-start h-11 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300 font-medium" 
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

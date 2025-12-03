import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Users, BookOpen } from "lucide-react";

const allCourses = [
  { id: "1", title: "Web Development Fundamentals", description: "Learn HTML, CSS, and JavaScript basics", duration: "12 weeks", students: 150, level: "Beginner", organizationId: "1" },
  { id: "2", title: "Advanced React Patterns", description: "Master React with advanced patterns and best practices", duration: "8 weeks", students: 89, level: "Advanced", organizationId: "1" },
  { id: "3", title: "UI/UX Design Principles", description: "Create beautiful and functional user interfaces", duration: "10 weeks", students: 120, level: "Intermediate", organizationId: "2" },
  { id: "4", title: "Database Design", description: "Learn to design efficient and scalable databases", duration: "6 weeks", students: 95, level: "Intermediate", organizationId: "3" },
];

const DashboardCourses = () => {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar variant="main" />
        
        <main className="flex-1">
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger />
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">All Courses</h1>
            </div>
          </header>

          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">All Available Courses</h2>
              <p className="text-muted-foreground">Browse and manage all courses across organizations</p>
            </div>

            <div className="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
              {allCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-[var(--shadow-card)] transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.duration}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {course.students}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {course.level}
                      </span>
                      <Button onClick={() => navigate(`/course/${course.id}`)}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Course
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardCourses;

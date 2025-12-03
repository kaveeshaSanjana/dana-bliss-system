import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, PlayCircle } from "lucide-react";

const allLectures = [
  { id: "1", title: "Introduction to HTML", description: "Learn the basics of HTML structure", duration: "45 min", courseId: "1", courseName: "Web Development Fundamentals" },
  { id: "2", title: "CSS Styling Basics", description: "Master CSS selectors and properties", duration: "60 min", courseId: "1", courseName: "Web Development Fundamentals" },
  { id: "3", title: "React Hooks Deep Dive", description: "Understanding useState, useEffect, and custom hooks", duration: "90 min", courseId: "2", courseName: "Advanced React Patterns" },
  { id: "4", title: "Context API and State Management", description: "Managing global state in React applications", duration: "75 min", courseId: "2", courseName: "Advanced React Patterns" },
  { id: "5", title: "Design Thinking Fundamentals", description: "Introduction to user-centered design", duration: "50 min", courseId: "3", courseName: "UI/UX Design Principles" },
];

const DashboardLectures = () => {
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
              <h1 className="text-lg font-semibold">All Lectures</h1>
            </div>
          </header>

          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">All Available Lectures</h2>
              <p className="text-muted-foreground">Browse and manage all lectures across courses</p>
            </div>

            <div className="grid gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
              {allLectures.map((lecture) => (
                <Card key={lecture.id} className="hover:shadow-[var(--shadow-card)] transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">{lecture.title}</CardTitle>
                    <CardDescription className="text-xs">{lecture.courseName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{lecture.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {lecture.duration}
                      </div>
                      <Button size="sm" onClick={() => navigate(`/course/${lecture.courseId}`)}>
                        <PlayCircle className="h-4 w-4 mr-1" />
                        View
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

export default DashboardLectures;

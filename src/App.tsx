
import { useEffect } from "react";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Payments from "./pages/Payments";
import CreatePayment from "./pages/CreatePayment";
import PaymentSubmissions from "./pages/PaymentSubmissions";
import MySubmissions from "./pages/MySubmissions";
import InstitutePayments from "./pages/InstitutePayments";
import SubjectPayments from "./pages/SubjectPayments";
import SubjectSubmissions from "./pages/SubjectSubmissions";
import SubjectPaymentSubmissions from "./pages/SubjectPaymentSubmissions";
import PaymentSubmissionsPage from "./pages/PaymentSubmissionsPage";
import HomeworkSubmissions from "./pages/HomeworkSubmissions";
import HomeworkSubmissionDetails from "./pages/HomeworkSubmissionDetails";
import { AuthProvider } from "@/contexts/AuthContext";
import UpdateHomework from '@/pages/UpdateHomework';
import UpdateLecture from '@/pages/UpdateLecture';
import CardDemo from '@/pages/CardDemo';
import ExamResults from '@/pages/ExamResults';
import CreateExamResults from '@/pages/CreateExamResults';
import ErrorBoundary from '@/components/ErrorBoundary';
import Transport from '@/pages/Transport';
import TransportAttendance from '@/pages/TransportAttendance';
import MyChildren from '@/pages/MyChildren';
import ChildDashboard from '@/pages/ChildDashboard';
import ChildResultsPage from '@/pages/ChildResultsPage';
import ChildAttendancePage from '@/pages/ChildAttendancePage';
import ChildTransportPage from '@/pages/ChildTransportPage';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Force light mode only
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    localStorage.setItem('theme', 'light');
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* ========== PUBLIC ROUTES ========== */}
              <Route path="/login" element={<Index />} />
              <Route path="/forgot-password" element={<Index />} />
              <Route path="/change-password" element={<Index />} />
              <Route path="/first-login" element={<Index />} />
              
              {/* ========== ROOT DASHBOARD ========== */}
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              
              {/* ========== INSTITUTE LEVEL ROUTES ========== */}
              <Route path="/institute/:instituteId/dashboard" element={<ProtectedRoute requireInstitute><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/users" element={<ProtectedRoute requireInstitute><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/classes" element={<ProtectedRoute requireInstitute><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/students" element={<ProtectedRoute requireInstitute><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/teachers" element={<ProtectedRoute requireInstitute><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/parents" element={<ProtectedRoute requireInstitute><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/organizations" element={<ProtectedRoute requireInstitute><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/attendance" element={<ProtectedRoute requireInstitute><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/payments" element={<ProtectedRoute requireInstitute><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/lectures" element={<ProtectedRoute requireInstitute><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/transport" element={<ProtectedRoute requireInstitute><Transport /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/settings" element={<ProtectedRoute requireInstitute><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/profile" element={<ProtectedRoute requireInstitute><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/gallery" element={<ProtectedRoute requireInstitute><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/sms" element={<ProtectedRoute requireInstitute><Index /></ProtectedRoute>} />
              
              {/* ========== CLASS LEVEL ROUTES ========== */}
              <Route path="/institute/:instituteId/class/:classId/dashboard" element={<ProtectedRoute requireInstitute requireClass><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/class/:classId/students" element={<ProtectedRoute requireInstitute requireClass><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/class/:classId/subjects" element={<ProtectedRoute requireInstitute requireClass><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/class/:classId/attendance" element={<ProtectedRoute requireInstitute requireClass><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/class/:classId/payments" element={<ProtectedRoute requireInstitute requireClass><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/class/:classId/homework" element={<ProtectedRoute requireInstitute requireClass><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/class/:classId/exams" element={<ProtectedRoute requireInstitute requireClass><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/class/:classId/results" element={<ProtectedRoute requireInstitute requireClass><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/class/:classId/lectures" element={<ProtectedRoute requireInstitute requireClass><Index /></ProtectedRoute>} />
              
              {/* ========== SUBJECT LEVEL ROUTES ========== */}
              <Route path="/institute/:instituteId/class/:classId/subject/:subjectId/dashboard" element={<ProtectedRoute requireInstitute requireClass requireSubject><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/class/:classId/subject/:subjectId/students" element={<ProtectedRoute requireInstitute requireClass requireSubject><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/class/:classId/subject/:subjectId/attendance" element={<ProtectedRoute requireInstitute requireClass requireSubject><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/class/:classId/subject/:subjectId/payments" element={<ProtectedRoute requireInstitute requireClass requireSubject><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/class/:classId/subject/:subjectId/homework" element={<ProtectedRoute requireInstitute requireClass requireSubject><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/class/:classId/subject/:subjectId/exams" element={<ProtectedRoute requireInstitute requireClass requireSubject><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/class/:classId/subject/:subjectId/results" element={<ProtectedRoute requireInstitute requireClass requireSubject><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/class/:classId/subject/:subjectId/lectures" element={<ProtectedRoute requireInstitute requireClass requireSubject><Index /></ProtectedRoute>} />
              
              {/* ========== CHILD ROUTES (for Parents) ========== */}
              <Route path="/child/:childId/dashboard" element={<ProtectedRoute requireChild><AppLayout><ChildDashboard /></AppLayout></ProtectedRoute>} />
              <Route path="/child/:childId/attendance" element={<ProtectedRoute requireChild><AppLayout><ChildAttendancePage /></AppLayout></ProtectedRoute>} />
              <Route path="/child/:childId/results" element={<ProtectedRoute requireChild><AppLayout><ChildResultsPage /></AppLayout></ProtectedRoute>} />
              <Route path="/child/:childId/transport" element={<ProtectedRoute requireChild><AppLayout><ChildTransportPage /></AppLayout></ProtectedRoute>} />
              
              {/* ========== LEGACY FLAT ROUTES (Redirects to hierarchical) ========== */}
              <Route path="/institutes" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/classes" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/subjects" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/students" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/teachers" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/parents" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/attendance" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="/homework" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/exams" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/results" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/lectures" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/my-children" element={<ProtectedRoute><AppLayout><MyChildren /></AppLayout></ProtectedRoute>} />
              
              {/* ========== OTHER PROTECTED ROUTES ========== */}
              <Route path="/profile" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/organizations" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/transport" element={<ProtectedRoute><Transport /></ProtectedRoute>} />
              <Route path="/transport/:transportId/attendance" element={<ProtectedRoute requireTransport><TransportAttendance /></ProtectedRoute>} />
              
              {/* ========== SPECIAL ROUTES ========== */}
              <Route path="/homework/update/:homeworkId" element={<ProtectedRoute><UpdateHomework /></ProtectedRoute>} />
              <Route path="/lecture/update/:lectureId" element={<ProtectedRoute><UpdateLecture /></ProtectedRoute>} />
              <Route path="/exams/:examId/results" element={<ProtectedRoute><ExamResults /></ProtectedRoute>} />
              <Route path="/exams/:examId/create-results" element={<ProtectedRoute><CreateExamResults /></ProtectedRoute>} />
              <Route path="/homework-submissions/:homeworkId" element={<ProtectedRoute><HomeworkSubmissions /></ProtectedRoute>} />
              <Route path="/homework/:homeworkId/submissions" element={<ProtectedRoute><HomeworkSubmissionDetails /></ProtectedRoute>} />
              <Route path="/payment-submissions/:paymentId" element={<ProtectedRoute><PaymentSubmissions /></ProtectedRoute>} />
              
              {/* ========== GENERIC CONTEXT ROUTES (Fallback to Index) ========== */}
              <Route path="/:page" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/:page" element={<ProtectedRoute requireInstitute><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/class/:classId/:page" element={<ProtectedRoute requireInstitute requireClass><Index /></ProtectedRoute>} />
              <Route path="/institute/:instituteId/class/:classId/subject/:subjectId/:page" element={<ProtectedRoute requireInstitute requireClass requireSubject><Index /></ProtectedRoute>} />

              {/* ========== CATCH-ALL ========== */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;

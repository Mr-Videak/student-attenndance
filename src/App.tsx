
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import ClassDetails from "./pages/ClassDetails";
import StudentDetails from "./pages/StudentDetails";
import TakeAttendance from "./pages/TakeAttendance";
import CreateClass from "./pages/CreateClass";
import AttendanceRecords from "./pages/AttendanceRecords";
import NotFound from "./pages/NotFound";
import AuthPage from "./components/auth/AuthPage";
import { AuthProvider } from "./components/auth/AuthProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Initialize app data
import { initializeAppData } from "./utils/data";
initializeAppData();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            
            <Route path="/class/:classId" element={
              <ProtectedRoute>
                <ClassDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/student/:rollNumber" element={
              <ProtectedRoute>
                <StudentDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/attendance/:classId" element={
              <ProtectedRoute>
                <TakeAttendance />
              </ProtectedRoute>
            } />
            
            <Route path="/attendance-records" element={
              <ProtectedRoute>
                <AttendanceRecords />
              </ProtectedRoute>
            } />
            
            <Route path="/create-class" element={
              <ProtectedRoute>
                <CreateClass />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

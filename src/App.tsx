
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
import { ThemeProvider } from "./hooks/use-theme";
import Classes from "./pages/Classes";
import EditClass from "./pages/EditClass";
import ViewAttendance from "./pages/ViewAttendance";

// Initialize app data
import { initializeAppData } from "./utils/data";
initializeAppData();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
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
              
              <Route path="/classes" element={
                <ProtectedRoute>
                  <Classes />
                </ProtectedRoute>
              } />
              
              <Route path="/class/:classId" element={
                <ProtectedRoute>
                  <ClassDetails />
                </ProtectedRoute>
              } />
              
              <Route path="/edit-class/:classId" element={
                <ProtectedRoute>
                  <EditClass />
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
              
              <Route path="/view-attendance/:recordId" element={
                <ProtectedRoute>
                  <ViewAttendance />
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
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

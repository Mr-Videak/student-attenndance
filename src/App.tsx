
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { ThemeProvider } from "./hooks/use-theme";
import Classes from "./pages/Classes";
import EditClass from "./pages/EditClass";
import ViewAttendance from "./pages/ViewAttendance";

// Initialize app data
import { initializeAppData } from "./utils/data";
initializeAppData();

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/class/:classId" element={<ClassDetails />} />
            <Route path="/edit-class/:classId" element={<EditClass />} />
            <Route path="/student/:rollNumber" element={<StudentDetails />} />
            <Route path="/attendance/:classId" element={<TakeAttendance />} />
            <Route path="/view-attendance/:recordId" element={<ViewAttendance />} />
            <Route path="/attendance-records" element={<AttendanceRecords />} />
            <Route path="/create-class" element={<CreateClass />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;

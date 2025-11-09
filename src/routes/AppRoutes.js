import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import HouseholdForm from '../components/HouseholdForm';
import NotFound from '../pages/NotFound';
import LoginForm from '../components/LoginForm';
import HouseholdDetailsPage from "../components/HouseholdDetailsPage";
import TripsPage from "../components/TripsPage";
import AddTripForm from "../components/AddTripForm";
import PreViewTripsPage from "../components/PreViewTripsPage";
import ProtectedRoute from '../components/ProtectedRoute';
import AdminDashboard from "../components/AdminDashboard";


const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* LandingPage بدون نیاز به لاگین */}
        <Route path="/" element={<LandingPage />} />
        
        {/* LoginForm */}
        <Route 
          path="/login" 
          element={
            localStorage.getItem("accessToken") 
              ? <Navigate to="/household/details" replace /> 
              : <LoginForm />
          } 
        />

        {/* مسیرهای محافظت شده */}
        <Route 
          path="/household/register" 
          element={
            <ProtectedRoute>
              <HouseholdForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/household/details" 
          element={
            <ProtectedRoute>
              <HouseholdDetailsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/trips/:memberId" 
          element={
            <ProtectedRoute>
              <TripsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/trips/:memberId/add" 
          element={
            <ProtectedRoute>
              <AddTripForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/previewtrips" 
          element={
            <ProtectedRoute>
              <PreViewTripsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
  path="/admin/dashboard" 
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>


        {/* مسیر نادیده */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;

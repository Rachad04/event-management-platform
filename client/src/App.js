import "./App.css";
import "./variables.css";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import UserPage from "./pages/UserPage/UserPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import EventsPage from "./pages/EventsPage/EventsPage";
import TicketingPage from "./pages/TicketingPage/TicketingPage";
import ManagerPage from "./pages/ManagerPage/ManagerPage";
import ProtectedRoute from "./Components/ProtectedRoute";
import NavigationBar from "./Components/NavigationBar/NavigationBar";
import EventDashboardPage from "./pages/EventDashboardPage/EventDashboardPage";
import ManagerSearchPage from "./pages/ManagerSearchPage/ManagerSearchPage";
import Page404 from "./pages/Page404/Page404";
import {
  ForgotPassword,
  ResetPassword,
} from "./Components/ForgotPassword/ForgotPassword";

function App() {
  return (
    <BrowserRouter>
      <NavigationBar />
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route exact path="*" element={<Page404 />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/manager" element={<ManagerPage />} />
        <Route path="/tickets/:eventId" element={<TicketingPage />} />
        <Route
          path="/company-management"
          element={
            <ProtectedRoute>
              <EventDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-company"
          element={
            <ProtectedRoute>
              <ManagerSearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/user/:user_id"
          element={
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

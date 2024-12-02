import "./App.css";
import "./variables.css";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import UserPage from "./pages/UserPage/UserPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import EventsPage  from "./pages/EventsPage/EventsPage";
import TicketingPage from "./pages/TicketingPage/TicketingPage";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/tickets/:eventId" element={<TicketingPage />} />

        <Route
          path="/users/user/:user_id" // Correct dynamic parameter path
          element={
            // <ProtectedRoute>
            <UserPage />
            // </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

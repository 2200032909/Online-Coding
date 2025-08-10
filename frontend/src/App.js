import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Landing from './pages/HomePage';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyOtp from './pages/verifyotp';
import AdminDashboard from './pages/AdminDashboard';
import Problempost from './pages/Problempost';
import AllProblem from './pages/AllProblem';
import UserDashboard from './pages/Userdashboard';
import ProblemView from './pages/ProblemView';
import UserProfile from './pages/UserProfile';
import CodeEditor from './pages/editorcode';
import Admin from './pages/admin';
import Usersubmissions from './pages/Usersubmissions';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/problempost" element={<Problempost />} />
        <Route path="/all" element={<AllProblem />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
<Route path="/users/user-submission" element={<Usersubmissions />} />
        <Route path="/userdetails" element={<Admin />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/problem/:id" element={<ProblemView />} />
        <Route path="/code-editor/:problemId" element={<CodeEditor />} />
      </Routes>
    </Router>
  );
}

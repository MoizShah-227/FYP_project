import { Routes, Route } from "react-router-dom";
import Welcome from "./components/Welcome";
import Login from "./components/Login";
import Feed from "./components/Post"; // Import your new screen
import Notifications from "./components/Notifications";
import Dashboard from "./components/Dashboard";
import AddEvent from "./components/AddEvents";
import Analytics from "./components/Analytics";
import Profile from "./components/Profile";
import ReactionSettings from "./components/ReactionSetting";
import FavouriteStudents from "./components/FavouriteStudents";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/feed" element={<Feed />} /> {/* New Route */}
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/add-event" element={<AddEvent />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/reaction-setting" element={<ReactionSettings />} />
      <Route path="/favourite-students" element={<FavouriteStudents />} />

      <Route path="*" element={
        <div style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#052730",
          color: "#FBFCFC",
          textAlign: "center"
        }}>
          <div>
            <h1>404 - Page Not Found</h1>
            <a href="/" style={{ color: "#FB9F24" }}>Go back home</a>
          </div>
        </div>
      } />
    </Routes>
  );
}

export default App;
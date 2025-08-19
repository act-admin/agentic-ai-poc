import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserWebpage from './components/UserWebpage.jsx';
import AdminConsole from './components/AdminConsole.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserWebpage />} />
        <Route path="/admin" element={<AdminConsole />} />
      </Routes>
    </Router>
  );
}

export default App;
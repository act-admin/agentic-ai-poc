import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

function AdminConsole() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [apiConfig, setApiConfig] = useState({ hrms: '', snowflake: '', zendesk: '' });

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoggedIn(true);
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiConfig),
      });
      if (response.ok) {
        alert('API Config Saved');
      } else {
        alert('Failed to save config');
      }
    } catch (error) {
      alert('Error saving config: ' + error.message);
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-white p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border p-2 w-full mb-2"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="border p-2 w-full mb-4"
        />
        <button onClick={handleLogin} className="bg-blue-500 text-white p-2">Login</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Console</h1>
      <input
        type="text"
        value={apiConfig.hrms}
        onChange={(e) => setApiConfig({ ...apiConfig, hrms: e.target.value })}
        placeholder="Oracle HRMS API Endpoint"
        className="border p-2 w-full mb-2"
      />
      <input
        type="text"
        value={apiConfig.snowflake}
        onChange={(e) => setApiConfig({ ...apiConfig, snowflake: e.target.value })}
        placeholder="Snowflake API Endpoint"
        className="border p-2 w-full mb-2"
      />
      <input
        type="text"
        value={apiConfig.zendesk}
        onChange={(e) => setApiConfig({ ...apiConfig, zendesk: e.target.value })}
        placeholder="Zendesk API Endpoint"
        className="border p-2 w-full mb-4"
      />
      <button onClick={handleSaveConfig} className="bg-blue-500 text-white p-2">Save Config</button>
    </div>
  );
}

export default AdminConsole;
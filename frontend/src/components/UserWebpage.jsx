import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:8000');

function UserWebpage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    socket.on('status_update', (data) => {
      setStatus(data.message);
    });
    socket.on('query_results', (data) => {
      setResults(data);
    });
    socket.on('action_confirmation', (data) => {
      alert(data.message);
    });
    socket.on('error', (data) => {
      alert(data.message);
    });
    return () => socket.disconnect();
  }, []);

  const handleQuery = async () => {
    socket.emit('user_query', { query });
  };

  const handleAddToProject = (employee) => {
    setSelectedEmployee(employee);
    socket.emit('user_action', { action: `Add ${employee.name} to Project X` });
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-4">Agentic AI Webpage</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter query, e.g., List employees with Java skills and 7+ years"
        className="border p-2 w-full mb-4"
      />
      <button onClick={handleQuery} className="bg-blue-500 text-white p-2">Submit Query</button>
      <p className="mt-4">Status: {status}</p>
      <table className="mt-4 w-full border">
        <thead><tr><th>Name</th><th>Skills</th><th>Experience</th><th>Action</th></tr></thead>
        <tbody>
          {results.map((emp, idx) => (
            <tr key={idx}>
              <td>{emp.name}</td><td>{emp.skills}</td><td>{emp.experience}</td>
              <td><button onClick={() => handleAddToProject(emp)} className="bg-blue-500 text-white p-1">Add to Project X</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserWebpage;
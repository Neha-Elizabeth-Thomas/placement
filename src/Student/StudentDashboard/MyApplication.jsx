import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyApplication = () => {
  const [applications, setApplications] = useState([]);
  const [selectedRounds, setSelectedRounds] = useState([]);
  const [round, setRound] = useState(false);
  const navigate = useNavigate();

 const handleRounds = async (drive_id) => {
   try {
    setSelectedRounds([]);
    const response = await axios.get(`http://localhost:3000/portal/get-drive-rounds/${drive_id}`);
    setSelectedRounds(response.data); 
    setRound(true);
  } catch (error) {
    console.error("Error fetching rounds:", error.response?.data?.message || error.message);
  }
};

  
  useEffect(() => {
    const fetchMyApplications = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found, please log in.");
          return;
        }

        const response = await axios.get("http://localhost:3000/portal/registered-drives", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setApplications(response.data); // Store the drives the student registered for
      } catch (error) {
        console.error("Error fetching applications:", error.response?.data?.message || error.message);
      }
    };

    fetchMyApplications();
  }, []);


  return (
    <div className="min-h-screen text-white flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-9 text-Navy">My Job Applications</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
        {applications.length === 0 ? (
          <p className="text-lg text-Navy">You haven't applied for any jobs yet.</p>
        ) : (
          applications.map((company, index) => (
            <div 
              key={index} 
              className="bg-white text-blue-950 p-10 min-h-[250px] rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:scale-105 flex flex-col items-center justify-center border-Navy border-2"
            >
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">{company.company_name}</h2>
                <p className="text-lg font-medium"><strong>Role:</strong> {company.job_role}</p>
                <p className="text-lg font-medium"><strong>Type:</strong> {company.drive_type}</p>
                <p className="text-gray-700 mb-4">{company.description}</p>
                <p className="text-gray-800 font-medium">
                  <strong>Location:</strong> {company.work_location}
                </p>
                <p className="text-gray-800 font-medium">
                  <strong>Salary:</strong> {company.permanent_package} LPA
                </p>
              </div>
            
               <div className="flex w-full gap-4 mt-4">
                <button
                  onClick={() => navigate(`/student-dashboard/Result/${company.drive_id}`)}
                  className="px-4 py-2 bg-blue-950 text-white font-semibold rounded-lg hover:bg-blue-800 transition w-1/2"
                >
                  Result
                </button>
                <button
                  onClick={() => handleRounds(company.drive_id)}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition w-1/2"
                >
                  View Rounds
                </button>
              </div>

            </div>
          ))
        )}
      </div>



      {round && (
  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-Navy p-6 w-1/2 text-white text-center rounded-lg shadow-lg border border-gray-400 max-h-[95vh] overflow-y-auto">
      <h2 className="text-3xl font-semibold mb-4 flex items-center justify-center">
        📢 Round Details
      </h2>
      <p className="mb-4 text-xl text-yellow-300">Brace yourself! Here comes the battle of rounds! ⚔️</p>
      <ul>
        {selectedRounds.map((round, index) => (
          <li key={index} className="mb-2  border-gray-300 pb-2 text-xl flex flex-col items-center">
            <h3 className="text-2xl font-semibold text-blue-300">🎯 {round.round_name}</h3>
            <p className="text-lg">📅 <strong>Date:</strong> {new Date(round.round_date).toLocaleDateString()}</p>
            <p className="text-lg">📍 <strong>Location:</strong> {round.location}</p>
            <p className="text-lg">💻 <strong>Mode:</strong> {round.mode}</p>
          </li>
        ))}
      </ul>
      <button 
        onClick={() => setRound(false)} 
        className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition w-full"
      >
        ❌ Close the battlefield
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default MyApplication;

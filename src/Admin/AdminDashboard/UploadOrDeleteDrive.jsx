import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2'; 


const UploadOrDeleteDrive = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [placementDriveData, setPlacementDriveData] = useState({
    company_id: "",
    job_role: "",
    num_of_rounds: "",
    training_package: "",
    permanent_package: "",
    last_date_to_submit: "",
    registration_link: "",
    work_location: "",
    duration: "",
    drive_mode: "On Campus",
    drive_type: "Dream",
    start_date: "",
    no_of_backlogs_permitted: "",
    supply_history_allowed: true,
    min_cgpa_required: "",
    focused_branches: [],
    description: "",
  });

  const [round, setRound] = useState(0);

  // Fetch company list on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("http://localhost:3000/portal/get-company");
        setCompanies(response.data.companies);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  // Ensure round state updates correctly
  useEffect(() => {
    setRound(Number(placementDriveData.num_of_rounds || 0));
  }, [placementDriveData.num_of_rounds]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked, multiple, options } = e.target;

    if (multiple) {
      // Handle multiple select inputs
      const selectedValues = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
      setPlacementDriveData((prevData) => ({ ...prevData, [name]: selectedValues }));
    } else if (type === "checkbox") {
      setPlacementDriveData((prevData) => ({ ...prevData, [name]: checked }));
    } else {
      setPlacementDriveData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  const roundCount = Number(placementDriveData.num_of_rounds || 0);
  console.log("Console is triggered !! Don't worry");

  try {
    const response = await axios.post("http://localhost:3000/portal/add-drive", placementDriveData);
    console.log("Drive successfully entered into database !!", response.data);

    if (response?.data?.drive?.drive_id && response.data.drive.drive_mode === "On Campus") {
      navigate(`/Admin-dashboard/AddRounds/${roundCount}/${response.data.drive.drive_id}`);
    } else {
       Swal.fire({
              icon: 'success',
              title: 'Off Campus Drive Updated Successfully!',
              
              showConfirmButton: false,
              timer: 2000,  // Auto close after 2 sec
            });
      navigate("/Admin-dashboard")
      console.error("Drive ID not found in response!");
    }
  } catch (error) {
    console.log("There is an error for insertion :", error);
  }
};


  return (
    <div className="p-8 flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#005f69]">Register Placement Drive</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Company ID */}
          <div className="mb-6">
            <label className="text-[#005f69] font-semibold">Company:</label>
            <select
              name="company_id"
              value={placementDriveData.company_id}
              onChange={handleChange}
              className="w-full text-gray-800 bg-white border border-[#005f69] rounded-lg focus:outline-none focus:ring focus:ring-blue-500 p-2"
              required
            >
              <option value="" disabled>Select a company</option>
              {companies.map((company) => (
                <option key={company.company_id} value={company.company_id}>
                  {company.company_id} - {company.company_name}
                </option>
              ))}
            </select>
          </div>

          {/* Job Role */}
          <div className="mb-6">
            <label className="text-[#005f69] font-semibold">Job Role:</label>
            <input
              type="text"
              name="job_role"
              value={placementDriveData.job_role}
              onChange={handleChange}
              className="w-full text-gray-800 bg-white border border-[#005f69] rounded-lg focus:outline-none focus:ring focus:ring-blue-500 p-2"
              required
            />
          </div>

          {/* Number of Rounds */}
          <div className="mb-6">
            <label className="text-[#005f69] font-semibold">Number of Rounds:</label>
            <input
              type="number"
              name="num_of_rounds"
              value={placementDriveData.num_of_rounds}
              onChange={handleChange}
              className="w-full text-gray-800 bg-white border border-[#005f69] rounded-lg focus:outline-none focus:ring focus:ring-blue-500 p-2"
              required
              min="1"
            />
          </div>

          {/* Training Package */}
      <div className="mb-6">
        <label className="text-[#005f69] font-semibold">Training Package (₹)(LPA):</label>
        <input type="number" name="training_package" value={placementDriveData.training_package} onChange={handleChange} className="w-full text-gray-800 bg-white border border-[#005f69] rounded-lg focus:outline-none focus:ring focus:ring-blue-500 p-2" required min="0" />
      </div>

      {/* Permanent Package */}
      <div className="mb-6">
        <label className="text-[#005f69] font-semibold">Permanent Package (₹)(LPA):</label>

        <input type="number" name="permanent_package" value={placementDriveData.permanent_package} onChange={handleChange} className="w-full text-gray-800 bg-white border border-[#005f69] rounded-lg focus:outline-none focus:ring focus:ring-blue-500 p-2" required min="0" />

        
      </div>

          {/* Drive Mode */}
          <div className="mb-6">
            <label className="text-[#005f69] font-semibold">Drive Mode:</label>
            <select
              name="drive_mode"
              value={placementDriveData.drive_mode}
              onChange={handleChange}
              className="w-full bg-white text-gray-800 border border-[#005f69] rounded-lg focus:outline-none focus:ring focus:ring-blue-500 p-2"
              required
            >
              <option value="On Campus">On Campus</option>
              <option value="Off Campus">Off Campus</option>
            </select>
          </div>

          {/* Drive Type */}
          <div className="mb-6">
            <label className="text-[#005f69] font-semibold">Drive Type:</label>
            <select
              name="drive_type"
              value={placementDriveData.drive_type}
              onChange={handleChange}
              className="w-full bg-white text-gray-800 border border-[#005f69] rounded-lg focus:outline-none focus:ring focus:ring-blue-500 p-2"
              required
            >
              <option value="Dream">Dream</option>
              <option value="Open">Open</option>
              <option value="Core">Core</option>
              <option value="IT">IT</option>
            </select>
          </div>
      {/*registration link */}
            <div className="mb-6">
        <label className="text-[#005f69] font-semibold">Registration Link:</label>
        <input type="url" name="registration_link" value={placementDriveData.registration_link} onChange={handleChange} className="w-full text-gray-800 bg-white border border-[#005f69] rounded-lg focus:outline-none focus:ring focus:ring-blue-500 p-2" required />
          </div>
          
           {/* Work Location */}
      <div className="mb-6">
        <label className="text-[#005f69] font-semibold">Work Location:</label>
        <input type="text" name="work_location" value={placementDriveData.work_location} onChange={handleChange} className="w-full text-gray-800 bg-white border border-[#005f69] rounded-lg focus:outline-none focus:ring focus:ring-blue-500 p-2" required />
          </div>
          
            {/* No. of Backlogs Permitted */}
      <div className="mb-6">
        <label className="text-[#005f69] font-semibold">No. of Backlogs Permitted:</label>
        <input type="number" name="no_of_backlogs_permitted" value={placementDriveData.no_of_backlogs_permitted} onChange={handleChange} className="w-full text-gray-800 bg-white border border-[#005f69] rounded-lg focus:outline-none focus:ring focus:ring-blue-500 p-2" required min="0" />
          </div>
          
            {/* Supply History Allowed */}
      <div className="mb-6">
        <label className="text-[#005f69] font-semibold">Supply History Allowed:</label>
        <input type="checkbox" name="supply_history_allowed" checked={placementDriveData.supply_history_allowed} onChange={handleChange} className="ml-2" />
      </div>

      {/* Minimum CGPA Required */}
      <div className="mb-6">
        <label className="text-[#005f69] font-semibold">Minimum CGPA Required:</label>
        <input type="text" name="min_cgpa_required" value={placementDriveData.min_cgpa_required} onChange={handleChange} className="w-full text-gray-800 bg-white border border-[#005f69] rounded-lg focus:outline-none focus:ring focus:ring-blue-500 p-2" required />
      </div>

          
             {/* Duration */}
      <div className="mb-6">
        <label className="text-[#005f69] font-semibold">Duration:</label>
        <input type="text" name="duration" value={placementDriveData.duration} onChange={handleChange} className="w-full text-gray-800 bg-white border border-[#005f69] rounded-lg focus:outline-none focus:ring focus:ring-blue-500 p-2" required />
          </div>
          

          {/* Start Date */}
          <div className="mb-6">
            <label className="text-[#005f69] font-semibold">Start Date:</label>
            <input
              type="date"
              name="start_date"
              value={placementDriveData.start_date}
              onChange={handleChange}
              className="w-full text-gray-800 bg-white border border-[#005f69] rounded-lg focus:outline-none focus:ring focus:ring-blue-500 p-2"
              required
            />
          </div>

           {/* Last Date to Submit */}
      <div className="mb-6">
        <label className="text-[#005f69] font-semibold">Last Date to Submit:</label>
        <input type="date" name="last_date_to_submit" value={placementDriveData.last_date_to_submit} onChange={handleChange} className="w-full text-gray-800 bg-white border border-[#005f69] rounded-lg focus:outline-none focus:ring focus:ring-blue-500 p-2" required />
      </div>


          {/* Focused Branches */}
          <div className="mb-6">
            <label className="text-[#005f69] font-semibold">Focused Branch:</label>
            <select
              multiple
              name="focused_branches"
              value={placementDriveData.focused_branches}
              onChange={handleChange}
              className="w-full bg-white text-gray-800 border border-[#005f69] rounded-lg focus:outline-none focus:ring focus:ring-blue-500 p-2"
              required
            >
              <option value="CSE">CSE</option>
              <option value="CE">CE</option>
              <option value="ME">ME</option>
              <option value="MCA">MCA</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="Robotics">Robotics</option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="text-[#005f69] font-semibold">Job Description:</label>
            <textarea
              name="description"
              value={placementDriveData.description}
              onChange={handleChange}
              className="w-full text-gray-800 bg-white border border-[#005f69] rounded-lg focus:outline-none focus:ring focus:ring-blue-500 p-2"
              rows="3"
              required
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="px-6 py-2 bg-[#005f69] text-white rounded hover:bg-[#004b52] transition"
             
            >
              Register Drive
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadOrDeleteDrive;

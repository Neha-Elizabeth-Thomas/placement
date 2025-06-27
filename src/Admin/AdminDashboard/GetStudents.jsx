import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";


const GetStudents = () => {
  const navigate = useNavigate();
  const [onCampusDrives, setOnCampusDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState("");
  const [students, setStudents] = useState([]);



const exportPlacedExcel = async (drive_id) => {
    try {
        const response = await axios.get(`http://localhost:3000/portal/drive-results/${drive_id}`);
        let data = response.data;

        if (!Array.isArray(data)) {
            alert("Unexpected data format received!");
            return;
        }

        // Filter only selected students
        data = data.filter(student => student.result === "Selected");

        if (data.length === 0) {
            alert("No selected students available to download!");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Placed Students");

        const fileName = `placed_students_drive_${drive_id}.xlsx`;
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });

        saveAs(fileData, fileName);
    } catch (error) {
        console.log("Error in getting placed students' data for Excel:", error);
    }
};


  const exportToExcel = async (drive_id) => {
    try {
      const response = await axios.get(`http://localhost:3000/portal/Getstudents/${drive_id}`);
      const data = response.data;

      if (data.length === 0) {
        alert("No data available to download!");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

      const fileName = `students_drive_${drive_id}.xlsx`;
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });

      saveAs(fileData, fileName);
    } catch (error) {
      console.log("Error in getting data for Excel:", error);
    }
  };

  useEffect(() => {
    let url = "http://localhost:3000/portal/getdrives"; // Default URL

    if (selectedDrive === "On-Going-drive") {
      url = "http://localhost:3000/portal/drives/ongoing";
    } else if (selectedDrive === "Up-coming-Drives") {
      url = "http://localhost:3000/portal/drives/upcoming";
    } else if (selectedDrive === "Completed-drives") {
      url = "http://localhost:3000/portal/drives/past";
    }

    axios
      .get(url)
      .then((response) => {
        console.log("Fetched drives:", response.data);
        if (Array.isArray(response.data.drives)) {
          const drives = response.data.drives || [];
          const formattedDrives = drives.map(drive => ({
            ...drive,
            start_date: new Date(drive.start_date).toISOString().split("T")[0],
            last_date_to_submit: new Date(drive.last_date_to_submit).toISOString().split("T")[0]
          }));
          setOnCampusDrives(formattedDrives);
        } else {
          console.error("Drives data is not an array:", response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching drives:", error);
      });
  }, [selectedDrive]); // ✅ Dependency ensures re-fetching when selectedDrive changes

  return (
    <div className="mt-9 px-4">
      <h3 className="text-2xl font-bold mb-2 text-[#005f69]">
        Manage student applications for drives: View details, update, or delete drives effortlessly. 🚀
      </h3>
      <select
        name="course"
        className="w-50 border-[#005f69] text-black border-b rounded-lg focus:outline-none focus:ring focus:ring-blue-500 p-2 my-9"
        onChange={(e) => setSelectedDrive(e.target.value)}
        required
      >
        <option value="">All Drives</option>
        <option value="On-Going-drive">On-Going Drive</option>
        <option value="Up-coming-Drives">Upcoming Drives</option>
        <option value="Completed-drives">Completed Drives</option>
      </select>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {onCampusDrives.map((drive) => (
          <div
            key={drive.drive_id}
            className="flex flex-col items-center p-6 border-[#005f69] border-5 rounded-2xl shadow-lg text-white transform transition-all hover:-translate-y-2 hover:shadow-xl"
          >
            <span className="font-bold text-2xl text-[#005f69]">
              {drive.company_name} - {drive.job_role}- DriveId : {drive.drive_id}
            </span>
            <hr className="border-blue-500 w-full my-2" />
            <p className="text-[#005f69] text-center break-words w-full overflow-hidden">
              {drive.description}
            </p>
            <p className="text-[#005f69] text-center">{drive.start_date}</p>

           
            
          <div className="flex flex-col gap-4 w-full">
  <div className="flex gap-7 w-full">
    <button
  onClick={() => exportToExcel(drive.drive_id)}
  className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 flex items-center justify-center gap-2"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4v12m0 0l-3-3m3 3l3-3M6 20h12"
    />
  </svg>
  Applied
</button>

  <button
  onClick={() => exportPlacedExcel(drive.drive_id)}
  className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 flex items-center justify-center gap-2"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4v12m0 0l-3-3m3 3l3-3M6 20h12"
    />
  </svg>
  placed
                </button>
                

                 <button
                  onClick={() =>
                    navigate(`/Admin-dashboard/Drives/${drive.drive_id}`, { state: { drive } })
                  
                  }
                  className="px-6 py-3 w-full bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300">
      More Details
                </button>
   
  </div>
  
</div>



          </div>
        ))}
      </div>


    </div>
  );
};

export default GetStudents;

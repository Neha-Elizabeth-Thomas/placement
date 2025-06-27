import React, { useState , useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Data } from "../AdminDashboard/ExcelComponent/Data";

const PublishResult = () => {
    const navigate = useNavigate();
    const [excelFile, setExcelFile] = useState(null);
    const [excelFileError, setExcelFileError] = useState(null);
    const [excelData, setExcelData] = useState(null);
    const [fileName, setFileName] = useState("");

    const [company_name, setCompanyName] = useState("");
    const [job_role, setJobRole] = useState("");
    const [year, setYear] = useState("");
    const [round_number, setRoundNumber] = useState("");

    const [filters, setFilters] = useState({
            company: "",
            jobRole: "",
            year: ""
        });
    const [filteredDrives, setFilteredDrives] = useState({
    loading: false,
    data: [],
    error: null
    }); 
    const [loading, setLoading] = useState(false);
    const [roundResults, setRoundResults] = useState({});
    const [expandedRound, setExpandedRound] = useState(null);

    const [viewMode, setViewMode] = useState("publish"); // "publish" or "delete"

    const FileType = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const handleFile = (e) => {
        let selectedFile = e.target.files[0];
        if (selectedFile) {
            setFileName(selectedFile.name);
            if (FileType.includes(selectedFile.type)) {
                let reader = new FileReader();
                reader.readAsArrayBuffer(selectedFile);
                reader.onload = (event) => {
                    setExcelFileError(null);
                    setExcelFile(event.target.result);
                };
                reader.onerror = () => {
                    setExcelFileError("Error reading the file");
                    setExcelFile(null);
                };
            } else {
                setExcelFileError("Please select a valid Excel file");
                setExcelFile(null);
                setFileName("");
            }
        } else {
            setExcelFileError("No file selected");
            setFileName("");
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const selectedFile = e.dataTransfer.files[0];
        if (selectedFile) {
            handleFile({ target: { files: [selectedFile] } });
        }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!excelFile) {
        setExcelData(null);
        Swal.fire({
            icon: "error",
            title: "Operation Failed!",
            text: "No file selected",
        });
        return;
    }

    try {
        const workbook = XLSX.read(excelFile, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        let data = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        data = data.map((row) => {
            if (row.Date && typeof row.Date === 'number') {
                row.Date = new Date((row.Date - 25569) * 86400 * 1000)
                    .toISOString()
                    .split("T")[0];
            }
            return row;
        });

        setExcelData(data);

        let allSuccess = true;
        for (const row of data) {
            if (!row.ktu_id || !row.round_status) {
                console.error('Missing required fields in row:', row);
                allSuccess = false;
                continue;
            }

            try {
                console.log(`Processing KTU ID: ${row.ktu_id} for ${company_name}`);
                const { data: driveResponse } = await axios.get(
                    `http://localhost:3000/portal/drive-id/${company_name}/${job_role}/${year}`
                );

                if (!driveResponse?.driveId) {
                    console.error(`Drive ID not found for:`, row);
                    allSuccess = false;
                    continue;
                }

                const roundResultPayload = {
                    driveId: driveResponse.driveId,
                    roundNumber: round_number,
                    ktuId: row.ktu_id,
                    status: row.round_status,
                };

                await axios.post("http://localhost:3000/portal/round-result", roundResultPayload);
                console.log(`✅ Successfully posted round result for KTU ID: ${row.ktu_id}`);
            } catch (error) {
                console.error(`❌ Error processing row:`, row, error?.response?.data ?? error?.message ?? 'Unknown error');
                allSuccess = false;
            }
        }

        if (allSuccess) {
            Swal.fire({
                icon: "success",
                title: "Result Entered Into Database Successfully!",
                showConfirmButton: false,
                timer: 2000,
            });
            setTimeout(() => navigate("/Admin-dashboard"), 2000);
        } else {
            Swal.fire({
                icon: "warning",
                title: "Partial Success",
                text: "Some rows could not be processed. Check the console for details.",
            });
        }
    } catch (error) {
        console.error('Error processing file:', error);
        Swal.fire({
            icon: "error",
            title: "Operation Failed!",
            text: "Something went wrong",
        });
    }
};
    // Auto-fetch when filters change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (Object.values(filters).some(val => val)) {
                fetchFilteredDrives();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [filters]);

    const fetchFilteredDrives = async () => {
    setFilters(prev => ({...prev, loading: true}));
    try {
        const queryParams = new URLSearchParams();
        
        if (filters.year) queryParams.append('year', filters.year);
        if (filters.jobRole) queryParams.append('jobRole', filters.jobRole);
        if (filters.company) queryParams.append('company', filters.company);

        const response = await axios.get(
        `http://localhost:3000/portal/filter-drives?${queryParams.toString()}`
        );

        if (response.data.success) {
        setFilteredDrives({
            loading: false,
            data: response.data.data, // Access the 'data' array from response
            error: null
        });
        } else {
        throw new Error('Failed to fetch drives');
        }
    } catch (error) {
        setFilteredDrives(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || error.message
        }));
        Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to fetch drives",
        });
    }
    };

    const fetchAndCacheRoundResults = async (driveId) => {
    try {
        const response = await axios.get(`http://localhost:3000/portal/fetch-round-results/${driveId}`);
        setRoundResults(prev => ({
        ...prev,
        [driveId]: response.data
        }));
        return response.data;
    } catch (error) {
        console.error("Error fetching round results:", error);
        return {};
    }
    };

    /*const fetchRoundResults = async (driveId) => {
        try {
            const response = await axios.get(`http://localhost:3000/portal/round-results/${driveId}`);
            setRoundResults(prev => ({ ...prev, [driveId]: response.data }));
        } catch (error) {
            console.error("Error fetching round results", error);
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Failed to fetch round results",
            });
        }
    };*/

    const toggleRoundResults = async (driveId, roundNumber) => {
        const key = `${driveId}-${roundNumber}`;
        
        if (expandedRound === key) {
            setExpandedRound(null);
        } else {
            // Ensure we have the latest results
            if (!roundResults[driveId] || !roundResults[driveId][roundNumber]) {
            await fetchAndCacheRoundResults(driveId);
            }
            setExpandedRound(key);
        }
    };

    /*const deleteRoundResult = async (driveId, roundNumber) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: `This will delete all results for round ${roundNumber} of this drive!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                await axios.delete(`http://localhost:3000/portal/delete-round-result`, {
                    data: { driveId, roundNumber }
                });

                // Refresh the data
                fetchRoundResults(driveId);
                fetchFilteredDrives();

                Swal.fire(
                    'Deleted!',
                    `Round ${roundNumber} results have been deleted.`,
                    'success'
                );
            }
        } catch (error) {
            console.error("Error deleting round result", error);
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Failed to delete round results",
            });
        }
    };*/

    const deleteAllResults = async (driveId) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: 'This will delete ALL round results for this drive!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete all!'
            });

            if (result.isConfirmed) {
                await axios.delete(`http://localhost:3000/portal/delete-all-rounds/${driveId}`);

                // Refresh the data
                setExpandedRound(null);
                fetchFilteredDrives();

                Swal.fire(
                    'Deleted!',
                    'All round results have been deleted.',
                    'success'
                );
            }
        } catch (error) {
            console.error("Error deleting all results", error);
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Failed to delete all results",
            });
        }
    };
    const handleDeleteResult = async () => {
        if (!company_name || !job_role || !year) {
            Swal.fire({
                icon: "error",
                title: "Missing Fields!",
                text: "Please enter Company Name, Job Role, and Year to delete results",
            });
            return;
        }

        try {
            const response = await axios.delete("http://localhost:3000/portal/delete-result", {
                data: { company_name, job_role, year },
            });

            if (response.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Results Deleted Successfully!",
                    showConfirmButton: false,
                    timer: 2000,
                });

                setCompanyName("");
                setJobRole("");
                setYear("");
            } else {
                throw new Error("Deletion failed");
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: error.response?.data?.message || "Failed to delete results",
            });
        }
    };

    return (
        <div className="container mx-auto p-6">
            {/* Buttons to switch between Publish & Delete */}
            <div className="flex justify-center gap-4 mb-6">
                <button
                    onClick={() => setViewMode("publish")}
                    className={`px-6 py-2 rounded-md font-bold ${
                        viewMode === "publish" ? "bg-[#005f69] text-white" : "bg-gray-300"
                    }`}
                >
                    Publish Result
                </button>
                <button
                    onClick={() => setViewMode("delete")}
                    className={`px-6 py-2 rounded-md font-bold ${
                        viewMode === "delete" ? "bg-red-600 text-white" : "bg-gray-300"
                    }`}
                >
                    Delete Result
                </button>
            </div>

            {viewMode === "publish" ? (
                <>
                   <div className="container mx-auto p-6">


            <div className="flex gap-8">
            <input
                type="text"
                className="flex-1 rounded-md border-[#005f69] border-3"
                placeholder="Company Name"
                value={company_name}
                onChange={(e) => setCompanyName(e.target.value)}
            />
            <input
                type="text"
                className="flex-1 rounded-md border-[#005f69] border-3"
                placeholder="Job Role"
                value={job_role}
                onChange={(e) => setJobRole(e.target.value)}
            />
            <input
                type="text"
                className="flex-1 rounded-md border-[#005f69] border-3"
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
            />
            <input
                type="text"
                className="flex-1 rounded-md border-[#005f69] border-3"
                placeholder="Round Number"
                value={round_number}
                onChange={(e) => setRoundNumber(e.target.value)}
            />
            </div>
            


            {/* Drag and Drop File Section */}
            <div
                className="border-2 border-dashed border-Navy p-6 text-center rounded-lg mt-6"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <label className="block text-xl font-semibold text-gray-700 mb-4">
                    Drag and Drop Result File
                </label>
                <p className="text-gray-500 mb-4">Or click to select a file</p>
                <input
                    type="file"
                    onChange={handleFile}
                    className="hidden"
                    id="fileInput"
                />
                <button
                    type="button"
                    onClick={() => document.getElementById("fileInput").click()}
                    className="mt-4 px-6 py-2 bg-[#005f69] text-white rounded-md hover:bg-Navy"
                >
                    Choose File
                </button>

                {/* Display Selected File Name */}
                {fileName && (
                    <p className="text-green-500 mt-4">Selected File: {fileName}</p>
                )}
                {excelFileError && (
                    <p className="text-red-500 text-sm mt-2">{excelFileError}</p>
                )}
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-center">
                <button
                    type="submit"
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-[#005f69] text-white rounded-md hover:bg-blue-600 w-1/2 font-extrabold"
                >
                    Submit
                </button>
            </div>

            <hr className="my-6" />

            {/* Display Excel Data */}
            <h3 className="text-2xl font-semibold text-gray-800">View Excel Data</h3>
            {excelData === null ? (
                <p className="text-gray-500">No File Selected!</p>
            ) : (
                <div className="overflow-x-auto shadow-md rounded-lg border-Navy">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-[#005f69] text-left text-white border-Navy">
                                
                                <th className="px-4 py-2">Ktu id</th>
                                
                                <th className="px-4 py-2">Round status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <Data excelData={excelData} />
                        </tbody>
                    </table>
                </div>
            )}
        </div>
                </>
            ) : (
    <>
        {/* View/Delete Results Section */}
        <div className="text-center p-6 rounded-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">View and Delete Round Results</h2>
            
            {/* Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <input 
                    type="text" 
                    placeholder="Company Name" 
                    className="p-2 border rounded w-full" 
                    value={filters.company}
                    onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                />
                <input 
                    type="text" 
                    placeholder="Job Role" 
                    className="p-2 border rounded w-full" 
                    value={filters.jobRole}
                    onChange={(e) => setFilters({ ...filters, jobRole: e.target.value })}
                />
                <input 
                    type="text" 
                    placeholder="Year" 
                    className="p-2 border rounded w-full" 
                    value={filters.year}
                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                />
            </div>

            {/* Results Table */}
            {filteredDrives.loading ? (
            <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#005f69]"></div>
                <p className="mt-2">Loading drives...</p>
            </div>
            ) : filteredDrives.error ? (
            <p className="text-red-500 text-center">{filteredDrives.error}</p>
            ) : filteredDrives.data.length > 0 ? (
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full bg-white">
                <thead className="bg-[#005f69] text-white">
                    <tr>
                    <th className="px-6 py-3">Company</th>
                    <th className="px-6 py-3">Job Role</th>
                    <th className="px-6 py-3">Start Date</th>
                    <th className="px-6 py-3">Drive ID</th>
                    <th className="px-6 py-3">Rounds</th>
                    <th className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {filteredDrives.data.map((drive) => (
                    <React.Fragment key={drive.drive_id}>
                        <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4">{drive.company_name}</td>
                        <td className="px-6 py-4">{drive.job_role}</td>
                        <td className="px-6 py-4">
                            {new Date(drive.start_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">{drive.drive_id}</td>
                        <td className="px-6 py-4">
                        {roundResults[drive.drive_id] ? (
                            Object.keys(roundResults[drive.drive_id]).map(roundNumber => (
                            <button
                                key={roundNumber}
                                onClick={() => toggleRoundResults(drive.drive_id, roundNumber)}
                                className={`mx-1 px-3 py-1 rounded ${
                                expandedRound === `${drive.drive_id}-${roundNumber}`
                                    ? 'bg-[#005f69] text-white'
                                    : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                            >
                                Round {roundNumber}
                            </button>
                            ))
                        ) : (
                            <button
                            onClick={async () => {
                                const results = await fetchAndCacheRoundResults(drive.drive_id);
                                if (Object.keys(results).length === 0) {
                                Swal.fire({
                                    icon: 'info',
                                    title: 'No Results Published',
                                    text: 'No round results have been published for this drive yet'
                                });
                                }
                            }}
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                            Check Rounds
                            </button>
                        )}
                        </td>
                        <td className="px-6 py-4">
                            <button
                            onClick={() => deleteAllResults(drive.drive_id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                            Delete All
                            </button>
                        </td>
                        </tr>
                        {/* Expanded row for round results */}
                        {expandedRound && expandedRound.startsWith(`${drive.drive_id}-`) && (
                        <tr>
                            <td colSpan="6" className="px-6 py-4 bg-gray-50">
                            {roundResults[drive.drive_id]?.[expandedRound.split('-')[1]] ? (
                                <div className="overflow-x-auto">
                                <h4 className="font-semibold mb-2">
                                    Results for Round {expandedRound.split('-')[1]}
                                </h4>
                                <table className="min-w-full bg-white border">
                                    <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2">Student Name</th>
                                        <th className="px-4 py-2">KTU ID</th>
                                        <th className="px-4 py-2">Status</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {roundResults[drive.drive_id][expandedRound.split('-')[1]].map((result, idx) => (
                                        <tr key={idx} className="border-t">
                                        <td className="px-4 py-2">{result.student_name}</td>
                                        <td className="px-4 py-2">{result.ktu_id}</td>
                                        <td className="px-4 py-2">{result.status}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                </div>
                            ) : (
                                <p>No results available for this round</p>
                            )}
                            </td>
                        </tr>
                        )}
                    </React.Fragment>
                    ))}
                </tbody>
                </table>
            </div>
            ) : (
            <p className="text-gray-500 mt-4">
                {Object.values(filters).some(val => val) 
                ? 'No drives found matching your criteria' 
                : 'Enter filter criteria to view drives'}
            </p>
            )}
        </div>
    </>
)}
        </div>
    );
};

export default PublishResult;

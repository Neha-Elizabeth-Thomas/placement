import * as DriveServices from "../services/DriveServices.js"

// Controller function to handle student insertion
export const addDrive = async (req, res) => {
  try {
    const driveData = req.body; // JSON object received from frontend
    const newDrive = await DriveServices.insertDrive(driveData);
    res.status(201).json({ message: "Drive added successfully", drive: newDrive });
  } catch (error) {
    console.error("Error inserting drive:", error);
    res.status(500).json({ error: "Failed to add drive" });
  }
};
export const getAllDrives = async (req, res) => {
  try {
      const drives = await DriveServices.getAllDrives();
      return res.status(200).json({ drives });
  } catch (error) {
      console.error('Error fetching upcoming drives:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
  }
}
export const getUpcomingDrivesController = async (req, res) => {
    try {
        const drives = await DriveServices.getUpcomingDrives();
        return res.status(200).json({ drives });
    } catch (error) {
        console.error('Error fetching upcoming drives:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getPastDrivesController = async (req, res) => {
    try {
        const drives = await DriveServices.getPastDrives();
        return res.status(200).json({ drives });
    } catch (error) {
        console.error('Error fetching past drives:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const deleteDrive = async (req, res) => {
    try {
        const { drive_id } = req.params; // Get drive_id from the route params
        const deletedDrive = await DriveServices.deleteDrive(drive_id);

        if (!deletedDrive) {
            return res.status(404).json({ message: 'Drive not found' });
        }

        return res.status(200).json({
            message: 'drive deleted successfully',
            
        });
    } catch (error) {
        console.error('Error deleting error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};


export const getOngoingDrivesController = async (req, res) => {
    try {
        const drives = await DriveServices.getOngoingDrives();
        return res.status(200).json({ drives });
    } catch (error) {
        console.error('Error fetching ongoing drives:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const updateDrive = async (req, res) => {
    try {
        const drive_id = parseInt(req.body.drive_id, 10);
        if (isNaN(drive_id)) {
            return res.status(400).json({ error: "Invalid drive_id" });
        }

        const { drive_id: _, ...driveData } = req.body; // Remove drive_id from data

        // Ensure null-safe values
        const safeValue = (value) => (value === undefined || value === "" ? null : value);
        const updatedData = Object.fromEntries(
            Object.entries(driveData).map(([key, value]) => [key, safeValue(value)])
        );

        const updatedDrive = await DriveServices.updateDrive(drive_id, updatedData);

        res.status(200).json({ message: "Drive updated successfully", updatedDrive });
    } catch (error) {
        console.error("Error updating Drive:", error.message);
        res.status(500).json({ error: error.message || "Failed to update Drive" });
    }
};

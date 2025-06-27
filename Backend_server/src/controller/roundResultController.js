import * as roundResultService from "../services/roundResultServices.js";

export const fetchRoundResults = async (req, res) => {
    try {
        const { driveId } = req.params;

        if (!driveId) {
            return res.status(400).json({ message: "Drive ID is required" });
        }

        const results = await roundResultService.getRoundResultsByDrive(driveId);

        if (!results || Object.keys(results).length === 0) {
            return res.status(404).json({ message: "No round results found for this drive" });
        }

        return res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching round results:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteRoundResults = async (req, res) => {
    try {
        const { driveId } = req.params;

        if (!driveId) {
            return res.status(400).json({ message: "Drive ID is required" });
        }

        const deletedCount = await roundResultService.deleteRoundResultsByDrive(driveId);

        if (deletedCount === 0) {
            return res.status(404).json({ message: "No round results found for this drive" });
        }

        return res.status(200).json({ message: "Round results deleted successfully", deletedCount });
    } catch (error) {
        console.error("Error deleting round results:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
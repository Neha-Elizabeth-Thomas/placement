import { query } from "../db.js";

export const getRoundResultsByDrive = async (driveId) => {
    const roundResultsQuery = `
        SELECT rr.round_number, rr.ktu_id, s.student_name, rr.status
        FROM round_result rr
        JOIN student s ON rr.ktu_id = s.ktu_id
        WHERE rr.drive_id = $1
        ORDER BY rr.round_number, rr.ktu_id;
    `;

    const { rows } = await query(roundResultsQuery, [driveId]);

    // Group by round number
    const resultsByRound = {};
    rows.forEach((row) => {
        const { round_number, ktu_id, student_name, status } = row;
        if (!resultsByRound[round_number]) {
            resultsByRound[round_number] = [];
        }
        resultsByRound[round_number].push({ ktu_id, student_name, status });
    });

    return resultsByRound;
};

export const deleteRoundResultsByDrive = async (driveId) => {
    const deleteQuery = `
        DELETE FROM round_result
        WHERE drive_id = $1;
    `;

    const { rowCount } = await query(deleteQuery, [driveId]);

    return rowCount; // Returns the number of rows deleted
};
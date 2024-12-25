const { getConnection } = require('../config/api'); 

const express = require('express');
const router = express();

//  API to get projects Data
router.get('/get_data', async (req, res) => {
	
	let connection;
	try {
		// db connection
		connection = await getConnection();

		// sql query
		const sqlStr = `SELECT key, project_name, client, status, version, technology, details, project_layout, details, project_layout, creator,
							TO_CHAR(curr_timestamp, 'DD-Mon-YYYY') CURR_TIMESTAMP
						FROM VW_DISPLAY_INFO, ( SELECT MAX(project_version) maxver, project_key pk
												FROM VW_DISPLAY_INFO 
												GROUP BY project_key ) 
						WHERE project_key = pk 
						AND REGEXP_LIKE(status,'(IN_PROGRESS)|(IN_APPROVAL)|(COMPLETED)|(CANCELLED)')
						ORDER BY MAX(key) OVER ( PARTITION BY project_key ) DESC, version DESC, status`;

		const result = await connection.execute(sqlStr);
		const data = { rows: result.rows };
		res.json(data);

	} 
	catch (err) {
		console.error('Error executing query:', err);
		return res.status(500).json({ error: 'Internal Server Error' });
	} 
	finally {
		if (connection) {
			try {
				await connection.close();
			} catch (err) {
				console.error('An error occurred while retrieving the data.', err);
			}
		}
	}
});


module.exports = router;
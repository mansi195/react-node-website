const { getConnection } = require('../config/api'); 

const express = require('express');
const router = express();

// API to get Setup Data
router.get('/get_data', async (req, res) => {
	
	let connection;
	try {

		// db connection
		connection = await getConnection();

		// sql query
		const sqlStr = `SELECT 
						CLIENT_NAME, WORKSHOP, EQUIPMENT_TYPE, TECH, FILM_TYPE, MACHINE_CATEGORY, MASK_CATEGORY, QUALITY, CODE_IDENTIFIER, FILM_COMPONENT
						FROM VW_SETUP_DATA
						ORDER BY FILM_COMPONENT_KEY`;

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



router.post('/add_setup_data_from_csv', async (req, res) => {
	
	const { data } = req.body;

	if (!data) {
		return res.status(400).json({ error: 'Data parameter not set!' });
	}

	const parsedData = JSON.parse(data);
	let error = null;

	// db connection
	const connection = await connectToDB();
	try {
		for (const item of parsedData) {
			
			// Handle "ANYVALUE" replacement for empty fields or 'any' text
			item[0] = item[0] && item[0].toLowerCase() !== 'any' ? item[0] : 'ANYVALUE'; // client
			item[1] = item[1] && item[1].toLowerCase() !== 'any' ? item[1] : 'ANYVALUE'; // workshop
			item[2] = item[2] && item[2].toLowerCase() !== 'any' ? item[2] : 'ANYVALUE'; // equipment type
			item[3] = item[3] && item[3].toLowerCase() !== 'any' ? item[3] : 'ANYVALUE'; // tech
			item[4] = item[4] && item[4].toLowerCase() !== 'any' ? item[4] : 'ANYVALUE'; // film type
			item[5] = item[5] && item[5].toLowerCase() !== 'any' ? item[5] : 'ANYVALUE'; // machine category
			item[6] = item[6] && item[6].toLowerCase() !== 'any' ? item[6] : 'ANYVALUE'; // mask category
			item[7] = item[7] && item[7].toLowerCase() !== 'any' ? item[7] : 'ANYVALUE'; // quality
			item[8] = item[8] && item[8].toLowerCase() !== 'any' ? item[8] : 'ANYVALUE'; // code identifier
			item[9] = item[9] && item[9].toLowerCase() !== 'any' ? item[9] : 'ANYVALUE'; // film component

			// PL/SQL string for inserting the data
			const plsql_str = `BEGIN
								project_pkg.ins_setup_data(
									:client, :workshop, :equipment_type, :tech, :film_type, :machine_category, :mask_category, :quality, :code_identifier, 
									:film_component, :v_res, :v_msg
								);
							END;`;

			try {
				// Execute PL/SQL with bind variables
				const result = await connection.execute(
					plsql_str,
					{
						client: item[0],
						workshop: item[1],
						equipment_type: item[2],
						tech: item[3],
						film_type: item[4],
						machine_category: item[5],
						mask_category: item[6],
						quality: item[7],
						code_identifier: item[8],
						film_component: item[9],
						v_res: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
						v_msg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 400 }
					},
					{ autoCommit: true }
				);

				if (result.outBinds.v_msg !== null) {
					error = result.outBinds.v_msg;
					break;
				}
			} 
			catch (err) {
				error = err.message;
				break;
			}
		}

		if (error) {
			return res.status(500).json({ error });
		}

		return res.status(200).json({ message: 'Data inserted successfully!' });

	} catch (err) {
		console.error('Error in processing data:', err);
		return res.status(500).json({ error: 'An error occurred while inserting the data.' });
	} finally {
		await connection.close();
	}
});


// DELETE ssetup data
router.get('/delete_data', async (req, res) => {
	try {
		const { key } = req.query;
		if (!key) return res.status(400).json({ error: 'Key parameter not set!' });

		// db connection
		const connection = await oracledb.getConnection();

		// PL/SQL string for deleting the data
		const plsql_str = `BEGIN project_pkg.del_setup_data(:key,  :v_res, :v_msg); END;`;
		const result = await connection.execute(
			plsql_str,
			{
				key: { val: key },
				v_res: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
				v_msg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 400 }
			},
			{ autoCommit: true }
		);

		// Check if there's any error message returned
		if (result.outBinds.v_msg) {
			return res.status(500).json({ error: result.outBinds.v_msg });
		}

		// Send the success message
		res.json({ message: 'Data deleted successfully', result: result.outBinds.v_msg });
		await connection.close();
	} 
	catch (error) {
		console.error('Error during deleteData API call:', error);
		res.status(500).json({ error: 'An error occurred while deleting the data.' });
	}
});


// RANKING TABLE 
router.get('/get_rank_data', async (req, res) => {
	
	let connection;
	try {

		// db connection
		connection = await getConnection();

		// sql query
		const sqlStr = `SELECT rank, film_selector FROM vw_selector_rank ORDER BY rank`;

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


// Endpoint to handle 'edit Ranking Data'
router.get('/update_rank_data', async (req, res) => {
	try {
		const { data } = req.body;

		if (!data) {
			return res.status(400).json({ error: 'Data parameter not set!' });
		}

		const parsedData = JSON.parse(data);
		let error = null;

		// db connection
		const connection = await oracledb.getConnection();

		// PL/SQL string for deleting the data
		const plsql_str = `BEGIN project_pkg.upd_selector_rank(:rank, :film_selector :v_res, :v_msg); END;`;
		const result = await connection.execute(
			plsql_str,
			{
				rank: parsedData['rank'],
                film_selector: parsedData['film_selector'],
				v_res: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
				v_msg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 400 }
			},
			{ autoCommit: true }
		);

		// Check if there's any error message returned
		if (result.outBinds.v_msg) {
			return res.status(500).json({ error: result.outBinds.v_msg });
		}

		// Send the success message
		res.json({ message: 'Data updated successfully', result: result.outBinds.v_msg });
		await connection.close();
	} 
	catch (error) {
		console.error('Error during API call:', error);
		res.status(500).json({ error: 'An error occurred while updating the data.' });
	}
});



module.exports = router;
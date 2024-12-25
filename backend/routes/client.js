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
        const sqlStr = `SELECT *
                        FROM vw_customer
                        ORDER BY customer_name`;

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



router.post('/save_data', async (req, res) => {
    
    try {
        const { data } = req.body;

        if (!data) {
            return res.status(400).json({ error: 'Data parameter not set!' });
        }
    
        const parsedData = JSON.parse(data);
        let error = null;

        // db connection
        const connection = await oracledb.getConnection();

        // PL/SQL string for inserting the data
		const plsql_str = `project_pkg.ins_customer(':name',':long_name', :v_res,:v_msg);\n;END;`;

        try {
            // Execute PL/SQL with bind variables
            const result = await connection.execute(
                                plsql_str,
                                {
                                    name: parsedData['name'],
                                    long_name: parsedData['long_name'],
                                    v_res: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                                    v_msg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 400 }
                                },
                                { autoCommit: true }
                            );

            if (result.outBinds.v_msg !== null) {
                error = result.outBinds.v_msg;
            }
        } 
        catch (err) {
            error = err.message;
        }

        if (result.outBinds.v_msg) {
            return res.status(500).json({ error: result.outBinds.v_msg });
        }

        return res.status(200).json({ message: 'Data inserted successfully!' });
    } 
    catch (err) {
		console.error('Error in processing data:', err);
		return res.status(500).json({ error: 'An error occurred while inserting the data.' });
	} finally {
		await connection.close();
	}
});

module.exports = router;
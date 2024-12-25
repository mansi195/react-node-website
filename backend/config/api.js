const oracledb = require('oracledb');

// Oracle DB connection configuration
const dbConfig = {
  user: 'db_username',       
  password: 'db_password',   
  connectString: 'localhost:1521'   
};

// Function to get the Oracle DB connection
async function getConnection() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Error connecting to the Oracle database:', error);
    throw error; 
  }
}

// Export the configuration and connection function
module.exports = { getConnection };
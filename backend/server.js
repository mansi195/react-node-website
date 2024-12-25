const express = require('express');
const app = express();

const cors = require('cors');                                                               // handling cors

app.use(cors());                                                                            // For cross-origin requests if needed
app.use(express.json()); 

const clientRoutes = require('./routes/client');
const projectsRoutes = require('./routes/projects');
const setupRoutes = require('./routes/setup');


// Using routes
app.use('/api', usersRoutes);  
app.use('/api', productsRoutes);  
app.use('/api', clientsRoutes); 


// Server setup
const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
# react-node-webapp

The web application enables users to create and set up a project, incorporating CRUD (Create, Read, Update, Delete) functionalities for managing customer and project setup data.
The application also offers the ability to securely store and retrieve both configuration details  and client-specific details (like contact information, and status etc). These records are stored in a centralized database.

# Frontend Technologies
  - React
  - React Router
  - Axios (for API calls)
  - CSS/Bootstrap for styling
  - Typescript

# Backend Technologies
  - Node.js
  - Express.js
  - Oracle DB
  - Javascript

# Frontend File & Content Description
    - /src
        - /components
            - DisplayAllProjects.tsx    
                (List every project set it up for clients using the "Infinite Scroll Technique." When I learnt this method, I wrote a [Medium article]([url](https://medium.com/@mansi952/infinite-scroll-technique-dc5231dc7ba6)).)
            - Setup.tsx                 (CSV Upload and Download functionality is used to save the data using "React Papaparse".)
            - Client.tsx                ('CRUD Operations' was used to onboard client information.)
        - /modals
            - AddClient.tsx             (Using the 'React JS Bootstrap' modal to add additional customers)
            - RankingTableModal.tsx     (Configuration setting for projects requires configuration ranking. 'React JS Bootstrap' modal was used to create)
        - /helpers
            - config.tsx                (Configuring backend API calls)
            - DeleteConfirmModal.tsx    (Delete Modal with options 'Yes/No' options created. Pulled in many components.)
            - LoadingSpinner.tsx        (Loading spinner created using 'React Loader Spinner' pulled in many components while fetching data via APIs )
        - /css
            - DisplayAllProjecs.css
            - Setup.css
            - Spinner.css
        - index.tsx
        - index.css

# Backend File & Content Description
    - /backend
        - /config
            - api.js                    (Setting up for API calls to connect with Oracle database)  
        - /routes
            - client.js                 (Client.tsx API call connects to client.js router)
            - project.js                (DisplayAllProjects.tsx API call connects to project.js router)
            - setup.js                  (Setup.tsx API call connects to setup.js router)
        - server.js                     (All the abover routers are wrapped up in server.js file)

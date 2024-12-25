// Determine the base path based on the environment
export const basePath: string = (process.env.NODE_ENV === 'development') ? process.env.PUBLIC_URL || '' : window['runConfig']?.basePath || '';

// Define the api_url variable with the correct type
let api_url: { url: string };

// Conditionally assign the API URL based on the base path
if (basePath.includes("/prod/")) {
    api_url = { url: "https://prod/api" };
} else {
    api_url = { url: "https://dev/api" };
}

// Export the api object with the url property
export const api = api_url;

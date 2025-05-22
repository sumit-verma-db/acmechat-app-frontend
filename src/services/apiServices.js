import axios from "axios";
// import Cookies from "js-cookie";
// import { showToast } from "../uiComponents/ToastServices.tsx";

// Base API URL
const BASE_URL = process.env.REACT_APP_API_URL;
// const BASE_URL = "http://192.168.1.47:5000";

// Create an Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  // withCredentials: true,
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to handle logout and redirection
const handleLogout = () => {
  // Cookies.remove("authToken"); // Remove token
  // showToast("error", "Session expired. Please log in again.");
  // Redirect only if the user is not already on the login page
  if (window.location.pathname !== "/auth/login") {
    window.location.href = "/auth/login";
  }
};

// Attach Bearer token dynamically before every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // Use sessionStorage for better security
    // If token is missing, force logout
    if (!token) {
      handleLogout();
      // return Promise.reject({
      //   status: 401,
      //   message: "No authentication token. Redirecting to login.",
      // });
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No token found. User might be logged out.");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors globally
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const status = error.response?.status;

//     if (status === 401) {
//       console.error("Unauthorized! Redirecting to login...");
//       Cookies.remove("authToken"); // Clear token

//       // Prevent infinite loop by checking current page
//       if (window.location.pathname !== "/signin") {
//         window.location.href = "/signin"; // Redirect to login
//       }
//     }

//     return Promise.reject({
//       status,
//       message: error.response?.data?.message || "An error occurred",
//       originalError: error,
//     });
//   }
// );

// Handle response errors globally
// api.interceptors.response.use(
//   (response) => response, // Return response if successful
//   (error) => {
//     const status = error.response?.status;
//     const data = error.response?.data || {};
//     console.log(error, data, status, "APIIIIII====>");
//     const token = localStorage.getItem("authToken");

//     if (status === 401 && !error.config._retry) {
//       error.config._retry = true;

//       try {
//         const refreshToken = localStorage.getItem("refreshToken");

//         // Try to get a new access token
//         const res = await axios.post(`${BASE_URL}/auth/refresh-token`, {
//           refreshToken,
//         });

//         if (res.data?.accessToken) {
//           // Save new access token
//           localStorage.setItem("authToken", res.data.accessToken);

//           // Retry original request with new token
//           error.config.headers["Authorization"] = `Bearer ${res.data.accessToken}`;
//           return api(error.config);
//         }
//       } catch (refreshError) {
//         console.error("🔁 Refresh token failed. Logging out...");
//         localStorage.removeItem("authToken");
//         localStorage.removeItem("refreshToken");
//         localStorage.removeItem("userId");
//         if (window.location.pathname !== "/signin") {
//           window.location.href = "/signin";
//         }
//       }

//     } else if (status === 400) {
//       // showToast(
//       //   "error",
//       //   data.message || "Bad request. Please check your input."
//       // );
//     } else if (status === 404) {
//       // showToast("warning", data.message);
//     } else if (status >= 500) {
//       // showToast("error", data.message);
//     } else {
//       // showToast(
//       //   "error",
//       //   `${error.message}. Please check your internet connection.`
//       // );
//     }

//     return Promise.reject({
//       status,
//       message: data.message || "An error occurred",
//       originalError: error,
//     });
//   }
// );
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const data = error.response?.data || {};
    console.log(error, data, status, "APIIIIII====>");
    const token = localStorage.getItem("authToken");

    if (status === 401 && !error.config._retry) {
      error.config._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const res = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        if (res.data?.accessToken) {
          localStorage.setItem("authToken", res.data.accessToken);
          error.config.headers[
            "Authorization"
          ] = `Bearer ${res.data.accessToken}`;
          return api(error.config); // retry original request
        }
      } catch (refreshError) {
        console.error("🔁 Refresh token failed. Logging out...");
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        if (window.location.pathname !== "/signin") {
          window.location.href = "/signin";
        }
      }
    }

    return Promise.reject({
      status,
      message: data.message || "An error occurred",
      originalError: error,
    });
  }
);

/** 🔹 Generic API Methods **/

// 🔹 POST request
const postFetch = async (endpoint, body = {}, config = {}) => {
  try {
    const response = await api.post(endpoint, body, config);
    return response;
  } catch (error) {
    console.error("POST Error:", error.message);
    throw error;
  }
};

// 🔹 GET request
const axiosGet = async (endpoint, config = {}) => {
  try {
    const response = await api.get(endpoint, config);
    return response.data;
  } catch (error) {
    console.error("GET Error:", error.message);
    throw error;
  }
};

// 🔹 GET request with query parameters
const AxiosGetWithParams = async (endpoint, params = {}, config = {}) => {
  try {
    const response = await api.get(endpoint, {
      ...config,
      params,
    });
    return response.data;
  } catch (error) {
    console.error("GET With Params Error:", error.message);
    throw error;
  }
};

// 🔹 POST request with query parameters
const AxiosPostWithParams = async (
  endpoint,
  params = {},
  body = {},
  config = {}
) => {
  try {
    const response = await api.post(endpoint, body, {
      ...config,
      params,
    });
    return response.data;
  } catch (error) {
    console.error("POST With Params Error:", error.message);
    throw error;
  }
};

// Export everything
export { api, postFetch, axiosGet, AxiosGetWithParams, AxiosPostWithParams };

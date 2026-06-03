import axios from "axios";
import { useErrorStore } from "../states/ErrorState";

const apiClient = axios.create({
  baseURL: "",
});

// Add a response interceptor to catch errors and set error state
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = "An unknown error occurred";
    if (error.response) {
      // Server responded with a status code outside 2xx range
      errorMessage = error.response.data?.message || error.response.statusText;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = "No response from server";
    } else {
      // Error in setting up the request
      errorMessage = error.message;
    }

    // Set error in the global error state
    useErrorStore.getState().setError(errorMessage);

    // Return rejected promise so calling code can still handle the error if needed
    return Promise.reject(error);
  },
);

export default apiClient;

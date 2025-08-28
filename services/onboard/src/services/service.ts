
const BASE_URL = process.env.BASE_URL

const BASE_URL_FOR_LOGO = process.env.BASE_URL_FOR_LOGO



// Register Payload and Response Interfaces
export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  organisation: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: any; // Modify based on the actual API response structure
}

// Function to register an organization
export const registerOrganization = async (
  data: RegisterPayload,
): Promise<RegisterResponse> => {
  const url = `${BASE_URL}/register`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Check if the response is not OK (status code outside the 200-299 range)
    if (!response.ok) {
      let errorDetails = {};
      try {
        // Try parsing the response JSON to extract error details
        errorDetails = await response.json();
      } catch {
        // If parsing fails, leave errorDetails as an empty object
      }

      // Construct an enriched error object
      const error: any = new Error(
        errorDetails?.detail ||
          `Error: ${response.status} ${response.statusText}`,
      );
      error.response = { data: errorDetails }; // Attach parsed details to the error
      throw error; // Throw the enriched error
    }

    // Parse and return the successful response
    const responseData: RegisterResponse = await response.json();
    return responseData;
  } catch (error: any) {
    console.error("Error during registration:", error);

    if (error instanceof Error) {
      // Re-throw known error objects with enriched details
      throw error;
    } else {
      // Throw a generic error for unexpected cases
      throw new Error(
        "An unexpected error occurred while registering the organization.",
      );
    }
  }
};

// Login Payload and Response Interfaces
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string; // You can adjust this based on your API response
  user?: any; // Optional, depends on the structure of the API response
}

// Function to log in a user
export const loginUser = async (data: LoginPayload): Promise<LoginResponse> => {
  const url = `${BASE_URL}/login`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const responseData: LoginResponse = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

export const sendOtp = async (payload: { email: string; otp: number }) => {
  const url = `${BASE_URL}/verifyOTP`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: payload.email,
        otp: payload.otp,
      }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.json();
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

export interface CompleteProfilePayload {
  email: string;
  role: string;
  interests: string[];
  team_size: string;
  subscriptions: {
    ambiguity_checkcer: boolean;
    mind_maps: boolean;
    test_scenarios: boolean;
  };
  org_name: string;
}

export interface CompleteProfileResponse {
  success: boolean;
  message: string;
  data?: any; // Modify based on the actual API response structure
}

// Function to complete the user profile
export const completeProfile = async (
  data: CompleteProfilePayload,
): Promise<CompleteProfileResponse> => {
  const url = `${BASE_URL}/completeProfile`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Check for successful response
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const responseData: CompleteProfileResponse = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error during completing profile:", error);
    throw error;
  }
};

interface LogoResponse {
  logoUrl: string; // Assuming the response contains the logo URL
}

/**
 * Set Logo - Uploads the logo image to the server.
 *
 * @param {File} file The file object representing the logo image to be uploaded.
 * @returns {Promise<LogoResponse>} Response data containing the logo URL or error message
 */
export const setLogo = async (file: File): Promise<LogoResponse> => {
  const formData = new FormData();
  formData.append("file", file); // Append the file to the FormData object

  try {
    const response = await fetch(`${BASE_URL_FOR_LOGO}/setLogo`, {
      method: "POST",
      body: formData, // Send the FormData with the logo file
    });

    if (!response.ok) {
      throw new Error("Failed to upload logo");
    }

    return await response.json(); // Assuming the response is JSON
  } catch (error) {
    console.error("Error setting logo:", error);
    throw error; // Propagate the error to the calling function
  }
};

/**
 * Get Logo - Fetches the logo image from the server using the image name.
 *
 * @param {string} imageName The name of the logo image to be fetched (e.g., 'logo.jpg').
 * @returns {Promise<LogoResponse>} Response containing the image URL or error message
 */
export const getLogo = async (imageName: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `${BASE_URL_FOR_LOGO}/getLogo?image_name=${imageName}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch logo");
    }

    // Check the Content-Type of the response to determine if it's an image or JSON
    const contentType = response.headers.get("Content-Type");

    // If the response is an image (binary data)
    if (contentType && contentType.includes("image")) {
      const blob = await response.blob();
      return URL.createObjectURL(blob); // Return a blob URL to display the image
    } else {
      // If it's JSON, parse it and look for the logoUrl field
      const data = await response.json();
      if (data && data.logoUrl) {
        return data.logoUrl; // Return the logoUrl from the JSON response
      } else {
        throw new Error("Logo URL not found in response");
      }
    }
  } catch (error) {
    console.error("Error getting logo:", error);
    return null; // Fallback in case of error
  }
};

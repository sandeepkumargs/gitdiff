// service.ts
import { saveAs } from "file-saver";
import { header } from "framer-motion/client";

const BASE_URL = process.env.BASE_URL
const ETL_API_BASE_URL = process.env.ETL_API_BASE_URL
const ORG_API_BASE_URL = process.env.ORG_API_BASE_URL
const BASE_URL_FOR_LOGO = process.env.BASE_URL_FOR_LOGO

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

// Utility function to check token validity
const getAuthHeaders = () => {
  const token = localStorage.getItem("refresh_token");
  if (!token) {
    console.error("No authentication token found");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const registerOrganization = async (
  data: RegisterPayload,
): Promise<RegisterResponse> => {
  const url = `${BASE_URL}/auth/api/v1/register`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error(`Error: ${response.statusText}`);
    }

    const responseData: RegisterResponse = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

export interface LoginPayload {
  email: string;
  otp: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export const loginUser = async (data: LoginPayload): Promise<LoginResponse> => {
  const url = `${BASE_URL}/auth/api/v2/login`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        email: data.email,
        otp: data.otp,
      },
      body: JSON.stringify({}), // No need to send the body if headers are used for authentication
    });

    if (!response.ok) {
      let errorDetails = {};
      try {
        errorDetails = await response.json(); // Parse error details from the response
      } catch {
        // Ignore JSON parse errors
      }

      const error: any = new Error(
        errorDetails?.detail ||
          `Error: ${response.status} ${response.statusText}`,
      );
      error.response = { data: errorDetails }; // Attach error details to the error object
      throw error; // Throw enriched error
    }

    return await response.json(); // Return response JSON if successful
  } catch (error) {
    console.error("Error during login:", error);
    throw error; // Re-throw the error for the caller to handle
  }
};

export const sendOtp = async (email: string) => {
  const url = `${BASE_URL}/auth/api/v2/sendOTP`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        email: email,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      let errorDetails = {};
      try {
        errorDetails = await response.json(); // Parse backend error details
      } catch {
        // If response JSON cannot be parsed, ignore
      }

      const error: any = new Error(
        errorDetails?.detail ||
          `Error: ${response.status} ${response.statusText}`,
      );
      error.response = { data: errorDetails }; // Attach error details to the error object
      throw error; // Throw the enriched error object
    }

    return await response.json(); // Return response JSON if successful
  } catch (error: any) {
    console.error("Error in sendOtp:", error);

    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred while sending OTP.");
    }
  }
};

export const registerUser = async (
  email: string,
  token: string,
  portfolio_id: string,
  project_id: string,
  type: string,
  read_write_access: boolean,
) => {
  const url = `${ORG_API_BASE_URL}/org/api/v1/invite`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email,
        portfolio_id,
        project_id,
        type,
        read_write_access,
      }),
    });

    if (!response.ok) {
      console.error("Failed to register user");
    }

    return response.json();
  } catch (error) {
    console.error("Error in registerUser:", error);
    throw error;
  }
};

export const fetchPortfolios = async () => {
  const url = `${ORG_API_BASE_URL}/org/api/v1/portfolio/list`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.error("Network response was not ok");
    }

    const data = await response.json();
    return data.map((item: any) => ({
      id: item._id,
      name: item.name,
      description: item.description,
      projectCount: item.projects,
    }));
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    throw error;
  }
};

export const fetchProjectsByPortfolioId = async (portfolioId: string) => {
  const url = `${ORG_API_BASE_URL}/org/api/v1/project/list?portfolio_id=${portfolioId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.error("Network response was not ok");
    }

    const data = await response.json();
    console.log("API Response:", data);
    console.log("Type of data:", typeof data);
    console.log("Is data an array?", Array.isArray(data));
    
    // If it's an object, show the keys
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      console.log("Object keys:", Object.keys(data));
    }

    return data.map((item: any) => ({
      id: item._id,
      name: item.name,
      description: item.description,
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const addPortfolio = async (portfolio: {
  name: string;
  description: string;
  tags: string[];
  credits: number;
}) => {
  const url = `${ORG_API_BASE_URL}/org/api/v1/portfolio/add`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(portfolio),
    });

    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Failed to add portfolio:", error);
    throw error;
  }
};

// service.ts

interface NewProject {
  name: string;
  totalUserStories: number;
  overall_status: string;
  tags: string[];
  platform: string[];
  credits: number;
  portfolio_id: string;
}

export const addProject = async (project: NewProject): Promise<void> => {
  const response = await fetch(`${ORG_API_BASE_URL}/org/api/v1/project/add`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(project),
  });

  if (!response.ok) {
    console.error("Failed to add project.");
  }
};

const API_BASE_URL = "/etl/api/v1"; // Base URL for API

export const postJiraImport = async (data: {
  url: string;
  email: string;
  project: string;
  issueType: string;
  token: string;
  project_id: string;
}) => {
  try {
    const response = await fetch(`${ETL_API_BASE_URL}/etl/api/v1/jira`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
 
    // Handle non-2xx responses as errors
    if (!response.ok) {
      const errorData = await response.json(); // Parse the error response
      const errorMessage = errorData?.detail || errorData?.message || `Error: ${response.status} ${response.statusText}`;
      console.error("API Error:", errorMessage);
      throw new Error(errorMessage);
    }
 
    // Return the JSON response if successful
    return await response.json();
  } catch (error) {
    console.error("Error importing from Jira:", error);
    throw error; // Re-throw error to be handled by the calling function
  }
};

//  /org/api/v1/getUser

export const getUser = async () => {
  try {
    const response = await fetch(`${ORG_API_BASE_URL}/org/api/v1/getUser`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user :", error);
    throw error;
  }
};

export const getProject = async (projectid: String) => {
  try {
    const response = await fetch(
      `${ORG_API_BASE_URL}/org/api/v1/project/get?project_id=${projectid}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );
    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error getting Projecet:", error);
    throw error;
  }
};

export const getPortfolio = async (portfolioid: String) => {
  try {
    const response = await fetch(
      `${ORG_API_BASE_URL}/org/api/v1/portfolio/get?portfolio_id=${portfolioid}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );
    if (!response.ok) {
      console.error(`Error,${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error getting Projecet:", error);
    throw error;
  }
};

export const getProjectMetrics = async (project_id: string) => {
  try {
    const response = await fetch(
      `${ORG_API_BASE_URL}/org/api/v1/project/metrics?project_id=${project_id}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );
    if (!response.ok) {
      console.error(`Error,${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error getting Projecet:", error);
    throw error;
  }
};

// service.ts
export const uploadExcel = async (file: File, projectId: string) => {
  const url = `${ETL_API_BASE_URL}/etl/api/v1/excel?project_id=${projectId}`;
  const token = localStorage.getItem("refresh_token");
 
  if (!token) {
    console.error("No authentication token found");
    throw new Error("No authentication token found");
  }
 
  const formData = new FormData();
  formData.append("file", file);
 
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
 
    if (!response.ok) {
      let errorDetails = {};
      try {
        errorDetails = await response.json(); // Attempt to parse error details if available
      } catch {
        // Ignore any parsing errors
      }
 
      const error: any = new Error(
        errorDetails?.message ||
          `Error: ${response.status} ${response.statusText}`,
      );
      error.response = { data: errorDetails }; // Attach error details to the error object
      throw error;
    }
 
    const result = await response.json();
    return result; // Return successful result
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error; // Re-throw error to be handled by the caller
  }
};

export const fetchDataByProjectId = async (projectId: string) => {
  const url = `${ETL_API_BASE_URL}/etl/api/v1/data?project_id=${projectId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
    }

    // Assuming the response is a file (likely an XLSX)
    const blob = await response.blob();
    saveAs(blob, "user_story_data.zip");
  } catch (error) {
    console.error("Error fetching data by project ID:", error);
    throw error;
  }
};

export const fetchCollaborators = async (
  portfolioId: string,
  projectId: string,
) => {
  const url = `${ORG_API_BASE_URL}/org/api/v1/get_collaborators?pf_id=${portfolioId}&pr_id=${projectId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.error("Network response was not ok");
    }

    const data = await response.json();
    // Map the response to your desired format
    return data.map((collaborator: any) => ({
      name: `${collaborator.first_name} ${collaborator.last_name}`,
      email: collaborator.email,
      role: collaborator.role,
      username: collaborator.email, // Assuming the username is the email
      organization: "Your Organization", // Can be added based on your data structure
      invitedBy: collaborator.invited_by || "N/A",
      joinedAt: collaborator.joined_at,
      accessLevel: collaborator.access_level,
      firstName: collaborator.first_name,
      lastName: collaborator.last_name,
      imageUrl: "", // Placeholder for image URL
    }));
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    throw error;
  }
};

export const getUserRole = async (projectId: string, portfolioId: string) => {
  const url = `${ORG_API_BASE_URL}/org/api/v1/get_role?pr_id=${projectId}&pf_id=${portfolioId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user current role:", error);
    throw error;
  }
};

export const getAllInvites = async () => {
  const url = `${ORG_API_BASE_URL}/org/api/v1/get_all_invites`;

  const options = {
    method: "GET",
    headers: getAuthHeaders(),
  };
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      console.error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was an error fetching the invites:", error);
  }
};

export const acceptInvite = async (inviteId: string) => {
  const token = localStorage.getItem("access_token"); // Assuming you're storing the token in local storage

  if (!token) {
    console.error("No authorization token found");
  }

  try {
    const response = await fetch(
      `${ORG_API_BASE_URL}/org/api/v1/accept_invite?ivt_id=${inviteId}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      },
    );

    if (!response.ok) {
      console.error("Failed to accept invite");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error accepting invite:", error);
    throw error;
  }
};

export const deleteUser = async (user: {
  portfolio_id: string;
  project_id: string;
  user_email: string;
  type: string;
  role: string;
}) => {
  const url = `${ORG_API_BASE_URL}/org/api/v1/delete_user`;
  const options = {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(user),
  };
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error importing from Jira:", error);
    throw error;
  }
};

interface LogoResponse {
  logoUrl: string; // Assuming the response contains the logo URL
}

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
      console.error("Failed to fetch logo");
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
        console.error("Logo URL not found in response");
      }
    }
  } catch (error) {
    console.error("Error getting logo:", error);
    return null; // Fallback in case of error
  }
};

// export const addUserStory = async (userStory) => {
//   const url = `${ETL_API_BASE_URL}/etl/api/v1/addManual`;

//   const response = await fetch(url, {
//     method: "POST",
//     headers: getAuthHeaders(),
//     body: JSON.stringify(userStory),
//   });

//   if (!response.ok) {
//     console.error("Failed to add user story");
//   }

//   const data = await response.json();
//   return data;
// };

export const validateStory = async (userStory) => {
  const validationUrl = `${BASE_URL}/api/sentence_validation`;
  const userStoryText = userStory?.story;
  const validationResponse = await fetch(validationUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_story: [userStoryText] }),
  });

  if (!validationResponse.ok) {
    throw new Error("Validation API request failed");
  }
  const validationData = await validationResponse.json();
  return validationData;
}

export const addUserStory = async (userStory, shouldProceed = false, existingStories = []) => {
  const validationUrl = `${BASE_URL}/api/sentence_validation`;
  const secondValidationUrl = `${BASE_URL}/api/us_validation`;
  const similarityCheckUrl = `${BASE_URL}/api/similarity_checker`;
  const userStoryText = userStory?.story;

  // **First Validation Request**
  const validationResponse = await fetch(validationUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_story: [userStoryText] }),
  });

  if (!validationResponse.ok) {
    throw new Error("Validation API request failed");
  }

  const validationData = await validationResponse.json();

  if (validationData.output[0] === "False") {
    throw new Error("User Story does not seem to be a valid sentence");
  }

  // **Second Validation Request**
  const secondValidationResponse = await fetch(secondValidationUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_story: [userStoryText] }),
  });

  if (!secondValidationResponse.ok) {
    throw new Error("Second validation API request failed");
  }

  const secondValidationData = await secondValidationResponse.json();

  if (secondValidationData.output[0] === "False" && !shouldProceed) {
    return { requiresConfirmation: true };
  }

  // **Third Validation: Similarity Check**
  const similarityResponse = await fetch(similarityCheckUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      existing_stories: existingStories,
      new_stories: [userStoryText],
    }),
  });

  if (!similarityResponse.ok) {
    throw new Error("Similarity check API request failed");
  }

  const similarityData = await similarityResponse.json();
  if (similarityData?.similarity_results[0]?.is_similar) {
    const similarStory = similarityData.similarity_results[0].similar_to;
    const error = new Error("User Story is too similar to an existing one.");
    error.similarTo = similarStory;
    throw error;
  }
  

  // **Final Step: Add User Story**
  const url = `${ETL_API_BASE_URL}/etl/api/v1/addManual`;
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(userStory),
  });

  if (!response.ok) {
    throw new Error("Failed to add user story");
  }

  return await response.json();
};



export const getUserStories = async (projectid) => {
  // const url = `${BASE_URL}/etl/api/v1/getStories?project_id=${projectid}`;
  const url = `${ETL_API_BASE_URL}/etl/api/v1/getStories?project_id=${projectid}`;
  const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
  });

  if (!response.ok) {
      console.error('Failed to fetch user stories');
  }

  const data = await response.json();
  return data;
}

export const investScoringCheck = async (userStories: string[]) => {
  const url = `${BASE_URL}/api/scoring_user_story`;

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              user_story: userStories // Send an array of stories
          })
      });

      if (!response.ok) {
          throw new Error('Unable to fetch scores');
      }

      const data = await response.json();
      return data.output; // Expecting an array of scores
  } catch (error) {
      console.error('Error fetching invest scores:', error);
      return userStories.map(() => null); // Return nulls for failed requests
  }
};

export const validateUserStories = async (userStories: string[]) => {
  const url = `${BASE_URL}/api/us_validation`;

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              user_story: userStories // Send an array of stories
          })
      });

      if (!response.ok) {
          throw new Error('Unable to validate user stories');
      }

      const data = await response.json();
      return data.output; // Expecting an array of validation results
  } catch (error) {
      console.error('Error validating user stories:', error);
      return userStories.map(() => null); // Return nulls for failed requests
  }
};

export const sendUserStories = async (userStories) => {
  try {
    const response = await fetch('/api/user-stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userStories }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending user stories:', error);
    throw error;
  }
};

export const updateStory = async (data) => {
  const url = `${ETL_API_BASE_URL}/etl/api/v1/update`;

  const response = await fetch(url, {
      method: 'POST',
      headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'  // Ensure JSON format
      },
      body: JSON.stringify(data),  // Convert `data` to JSON
  });

  if (!response.ok) {
      console.error('Failed to update story:', response.status, await response.text());
      throw new Error('Failed to update story');
  }

  return await response.json();
};

export interface JiraExportResponse {
  status: number;
  message: string;
  results: {
    total_stories: number;
    updated: number;
    created: number;
    failed: number;
    failed_stories?: Array<{ story_id: string; error: string }>;
  };
}

export const exportToJira = async (projectId: string): Promise<JiraExportResponse> => {
  try {
    const response = await fetch(`${ETL_API_BASE_URL}/etl/api/v1/jira/export`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ project_id: projectId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to export to Jira');
    }

    const data = await response.json();
    return {
      ...data,
      // Map the new response format to the expected one
      exported_count: (data.results?.updated || 0) + (data.results?.created || 0)
    };
  } catch (error) {
    console.error('Error exporting to Jira:', error);
    throw error;
  }
};


export const userLogout = async () => {
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");

  console.log("Access Token:", accessToken);
  console.log("Refresh Token:", refreshToken);

  if (!accessToken && !refreshToken) {
    console.warn("No tokens found — skipping logout API calls");
    return;
  }

  const logoutCall = async (token, label) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/api/v2/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(`Logout failed (${label}):`, error.detail || "Unknown error");
      } else {
        console.log(`Logout successful for ${label}`);
      }
    } catch (err) {
      console.error(`Logout error (${label}):`, err);
    }
  };

  if (accessToken) await logoutCall(accessToken, "access_token");
  if (refreshToken) await logoutCall(refreshToken, "refresh_token");
};




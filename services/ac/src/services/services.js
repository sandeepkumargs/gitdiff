import FileSaver from 'file-saver';

const BASE_URL = process.env.BASE_URL
const ETL_API_BASE_URL = process.env.ETL_API_BASE_URL
const ORG_API_BASE_URL = process.env.ORG_API_BASE_URL
const BASE_URL_FOR_LOGO = process.env.BASE_URL_FOR_LOGO

//192.168.29.95:5003

const getAuthHeaders = () => {
    const token = localStorage.getItem('refresh_token');
    if (!token) {
        throw new Error('No authentication token found');
    }
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
};

// const getUserStories = async (sessionId) => {
//     const url = `${BASE_URL}/test/app/v1/user-story/getAll?session_id=${sessionId}`;
//     const response = await fetch(url);

//     if (!response.ok) {
//         throw new Error('Failed to fetch user stories');
//     }

//     const data = await response.json();
//     return data;
// };

const getUserStories = async (projectid) => {
    // const url = `${BASE_URL}/etl/api/v1/getStories?project_id=${projectid}`;
    const url = `${BASE_URL}/etl/api/v1/getStories?project_id=${projectid}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user stories');
    }

    const data = await response.json();
    return data;
}

const getMindMap = async (sessionId, storyId) => {
    const url = `${BASE_URL}/test1/app/v1/getMap?session_id=${sessionId}&story_id=${storyId}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch mind maps');
    }
    const data = await response.json();
    return data;
};

const getTestScenario = async (storyId) => {
    const url = `${BASE_URL}/test3/app/v1/test-scenario/fetch?story_id=${storyId}`;
    const response = await fetch(url, {
        "Accept": "application/json"
    });

    if (!response.ok) {
        throw new Error('Failed to fetch test scenarios');
    }
    const data = await response.json();
    return data;
};

const addUserStory = async (userStory) => {
    const url = `${BASE_URL}/etl/api/v1/addManual`;

    const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userStory)
    });

    if (!response.ok) {
        throw new Error('Failed to add user story');
    }

    const data = await response.json();
    return data;
};

// const processAllUserStories = async (sessionId, userStories) => {
//     const url = `${BASE_URL}/test/app/v1/user-story/processAll?session_id=${sessionId}`;

//     const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             session_id: sessionId,
//             user_stories: userStories
//         })
//     });
//     if (!response.ok) {
//         throw new Error('Failed to process user stories');
//     }

//     return await response.json();
// };

const processAllUserStories = async (userStories) => {
    const url = `${BASE_URL}/ac/api/v1/process`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userStories)
    });
    if (!response.ok) {
        console.error('Failed to process user stories');
    }

    return await response.json();
}

export const generateMindMap = async (sessionId, type, userStory) => {
    const url = `${BASE_URL}/test1/app/v1/generateMindMap`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            session_id: sessionId,
            type,
            user_story: userStory
        })
    });

    if (!response.ok) {
        throw new Error('Failed to generate mind map');
    }

    return await response.json();
};

export const generateTestScenario = async (userStory) => {
    const url = `${BASE_URL}/test3/app/v1/test-scenario/generate`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userStory)
    });

    if (!response.ok) {
        throw new Error('Failed to generate test scenarios');
    }

    return await response.json();
};

const getProcessingStatus = async (sessionId) => {
    const url = `${BASE_URL}/test/app/v1/user-story/getProcessingStatus?session_id=${sessionId}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch processing status');
    }

    return await response.json();
};

const refineUserStory = async (userStory) => {
    const url = `${BASE_URL}/ac/api/v1/refine`;

    const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userStory)
    });

    if (!response.ok) {
        throw new Error('Failed to refine user story');
    }

    const data = await response.json();
    return data;
};

const downloadExcelDoc = async (sessionId) => {
    const url = `${BASE_URL}/test/app/v1/getExcelDoc?session_id=${sessionId}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const blob = await response.blob();
        FileSaver.saveAs(blob, 'user_stories.xlsx');
    } catch (error) {
        console.error('Error downloading the Excel file:', error);
    }
};

const importJiraDump = async (sessionId, email, projectURL, token, projectkey) => {
    const url = `${BASE_URL}/test/app/v1/user-story/jiraDump?session_id=${sessionId}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                project_url: projectURL,
                email: email,
                token: token,
                key: projectkey,
                issue_type: "Story"
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Success:', data);
            // Handle success (e.g., show a success message)
        } else {
            console.error('Error:', response.statusText);
            // Handle error (e.g., show an error message)
        }
    } catch (error) {
        console.error('Error:', error);
        // Handle error (e.g., show an error message)
    }
};

const getStory = async (_id)=> {
    const url =`${ETL_API_BASE_URL}/etl/api/v1/getStory?story_id=${_id}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        console.error('Failed to generate mind map');
    }

    return await response.json();
}

const investScoringCheck = async (userStory) => {
    const url = `${BASE_URL}/api/scoring_user_story`
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_story: [userStory]
        })
    });
    if (!response.ok) {
        throw new Error('Unable to give score');
    }
    return await response.json();
}

// const updateStory = async (data) => {
//     const url = `${ETL_API_BASE_URL}/etl/api/v1/update`;

//     const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//             ...getAuthHeaders(),
//             'Content-Type': 'application/json'  // Ensure JSON format
//         },
//         body: JSON.stringify(data),  // Convert `data` to JSON
//     });

//     if (!response.ok) {
//         console.error('Failed to update story:', response.status, await response.text());
//         throw new Error('Failed to update story');
//     }

//     return await response.json();
// };


const updateStory = async (data) => {
    // Step 1: Similarity check
    const similarityCheckUrl = `${BASE_URL}/api/similarity_checker`;

    const allManualAC = data?.manual_acceptance_criteria || [];
    const allAC = data?.acceptance_criteria || [];
    
    const newStories = [allManualAC.slice(-1)[0]];
    const existingStories = [...allAC, ...allManualAC.slice(0, -1)];
    

    const similarityResponse = await fetch(similarityCheckUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            existing_stories: existingStories,
            new_stories: newStories,
        }),
    });

    if (!similarityResponse.ok) {
        console.error('Similarity check failed:', similarityResponse.status, await similarityResponse.text());
        throw new Error('Similarity check failed');
    }

    const similarityResult = await similarityResponse.json();
    console.log("Similarity Check Result:", similarityResult);
    
    const { is_similar, similar_to } = similarityResult.similarity_results?.[0] || {};
    
    if (is_similar) {
        throw new Error(`This acceptance criteria is similar to: "${similar_to}"`);
    }

    // Step 3: Proceed with update
    const url = `${ETL_API_BASE_URL}/etl/api/v1/update`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        console.error('Failed to update story:', response.status, await response.text());
        throw new Error('Failed to update story');
    }

    return await response.json();
};


const updateUserStory = async (data) => {
    const url = `${ETL_API_BASE_URL}/etl/api/v1/update`;
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        console.error('Failed to update user story:', response.status, await response.text());
        throw new Error('Failed to update user story');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error in updateUserStory:', error);
      throw error;
    }
  };
  




export { 
    getUserStories, 
    addUserStory, 
    processAllUserStories, 
    refineUserStory, 
    getProcessingStatus, 
    downloadExcelDoc, 
    getMindMap, 
    importJiraDump, 
    generateTestScenario, 
    getTestScenario,
    getStory,
    investScoringCheck,
    updateStory,
    updateUserStory
};

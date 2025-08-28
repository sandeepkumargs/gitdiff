import FileSaver from 'file-saver';

const BASE_URL = process.env.BASE_URL
const ETL_API_BASE_URL = process.env.ETL_API_BASE_URL
const ORG_API_BASE_URL = process.env.ORG_API_BASE_URL
const BASE_URL_FOR_LOGO = process.env.BASE_URL_FOR_LOGO


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
        throw new Error('Failed to process user stories');
    }

    return await response.json();
}

export const generateMindMap = async (userStory) => {
    const url = `${BASE_URL}/mm/api/v1/generate`;

    const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userStory)
    });

    if (!response.ok) {
        throw new Error('Failed to generate mind map');
    }

    return await response.json();
};

export const isFunctionalCheck = async (userStory) => {
    const url = `${BASE_URL}/api/story_type`;
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
        throw new Error('validation failed');
    }
    return await response.json();
}


export const getStory = async (_id)=> {
    const url =`${ETL_API_BASE_URL}/etl/api/v1/getStory?story_id=${_id}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        throw new Error('Failed to generate mind map');
    }

    return await response.json();
}

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

const refineUserStory = async (sessionId, userStory) => {
    const url = `${BASE_URL}/test/app/v1/user-story/refine`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            session_id: sessionId,
            user_story: userStory
        })
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
    getTestScenario 
};

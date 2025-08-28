import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
/// import { useNavigate } from 'react-router-dom';
// @ts-ignore
import { getUserStories, addUserStory, processAllUserStories, getProcessingStatus, downloadExcelDoc } from '../../services/services.js'; // Import your service functions
import { nanoid } from 'nanoid';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ProgressBar } from 'primereact/progressbar';
// import igs_logo from '../../assets/IGS_LOGO.png';

import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
// import Disclaimer from '../../components/Disclaimer';

interface Ambiguity {
    ambi_val: string;
    status: boolean;
}

interface UserStoryData {
    _id: string;
    context: string;
    story: string;
    status: string;
    ambiguities: {};
    refined_story: string;
    acc_criteria: string[];
    assumptions: string[];
}

const UserStory: React.FC = () => {
    // const navigate = useNavigate();
    const [userStories, setUserStories] = useState<UserStoryData[]>([]);
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [userStory, setUserStory] = useState<string>('');
    const [context, setContext] = useState<string>('');
    const [sessionId, setSessionId] = useState<string>('lasdkfjlasjkf'); //  lasdkfjlasjkf laskdjflaks
    const [loading, setLoading] = useState<boolean>(true);
    const [processing, setProcessing] = useState<boolean>(false);
    const [selectedProducts, setSelectedProducts] = useState<UserStoryData[]>([]);

    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);

    // const igsLogo = {
    //     backgroundImage: `url(${igs_logo})`,
    //     backgroundSize: '10%',
    //     backgroundRepeat: 'no-repeat',
    //     backgroundPosition: 'right',
    //     paddingTop: '80px',
    // }

    const onPageChange = (event: any) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    const toast = useRef<Toast>(null);

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchProcessingStatus, 2000); // Polling interval of 2 seconds
        return () => clearInterval(intervalId); // Clean up on unmount
    }, [sessionId]);

    const fetchData = async () => {
        try {
            const data = await getUserStories(sessionId);
            if (data == null) {
                setUserStories([]);
            } else {
                setUserStories(data);
            }
        } catch (error) {
            console.error('Error fetching user stories:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProcessingStatus = async () => {
        try {
            const response = await getProcessingStatus(sessionId);
            if (response.length === 2) {
                const [newCount, totalCount] = response;
                setUserStories(prevUserStories => {
                    return prevUserStories.map(story => {
                        if (story.status === 'new' && newCount === 0) {
                            return { ...story, status: 'pending' };
                        } else if (story.status === 'new' && newCount > 0) {
                            return { ...story, status: 'new' };
                        } else {
                            return { ...story }; // For other statuses, keep unchanged
                        }
                    });
                });
            } else {
                console.error('Invalid response format from getProcessingStatus API');
            }
            fetchData(); // Fetch updated data after status update
        } catch (error) {
            console.error('Error fetching processing status:', error);
        }
    };

    const statusBodyTemplate = (rowData: UserStoryData) => {
        const statusClass = rowData.status === 'pending' ? 'text-orange-500' : 'text-green-500';
        return (
            <span className={`font-bold ${statusClass}`}>
                {(rowData.status === 'processing' || rowData.status === 'refining') ? <>
                 <>
                            <p className='text-md'>Processing ....</p>
                            <ProgressBar mode="indeterminate" />
                            </>
                </> : rowData.status}
            </span>
        );
    };

    const openDialog = () => {
        setShowDialog(true);
    };

    const hideDialog = () => {
        setShowDialog(false);
    };

    const saveUserStory = async () => {
        try {
            const newStory = {
                _id: nanoid(),
                context: context,
                story: userStory,
                status: 'new',
                ambiguities: {},
                refined_story: '',
                acc_criteria: [],
                assumptions: []
            };

            toast.current?.show({ severity: 'success', summary: 'Success', detail: 'User Story Added Successfully', life: 3000 });
            await addUserStory(sessionId, newStory);
            fetchData();
            hideDialog();
        } catch (error) {
            console.error('Error saving user story:', error);
        }
    };

    // const redirectToChecker = (rowData: UserStoryData) => {
    //     if (rowData.status !== 'new' && rowData.status !== 'processing') {
    //         navigate(`/app/checker/${rowData._id}`, {
    //             state: {
    //                 _id: rowData._id,
    //                 userStory: rowData.story,
    //                 context: rowData.context,
    //                 status: rowData.status,
    //                 ambiguities: rowData.ambiguities, // Sending the whole ambiguities object
    //                 acc_criteria: rowData.acc_criteria,
    //                 assumptions: rowData.assumptions,
    //                 refined_story: rowData.refined_story,
    //                 sessionId: sessionId
    //             }
    //         });
    //     }
    // };

    const handleProcessUserStories = async () => {
        const storiesToSend = userStories.filter(story => story.status === 'new').map(story => ({
            _id: story._id,
            story: story.story,
            context: story.context,
            status: story.status
        }));

        if (storiesToSend.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'No New Stories', detail: 'There are no new user stories to process.', life: 3000 });
            return;
        }

        try {
            setProcessing(true); // Disable the button while processing
            toast.current?.show({ severity: 'info', summary: 'Processing', detail: 'Stories are being processed.', life: 3000 });

            // Initiate the POST request to process all user stories
            await processAllUserStories(sessionId, storiesToSend);

            // After processing is completed, fetch updated data
            fetchData();
            // toast.current.show({ severity: 'success', summary: 'Completed', detail: 'Processing completed successfully.', life: 3000 });
        } catch (e) {
            console.error('Error processing user stories:', e);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to process user stories.', life: 3000 });
        } finally {
            setProcessing(false); // Enable the button after processing is complete
        }
    };

    function countAmbiguities(ambiguities: any) {
        let counts = 0;
        for (const key in ambiguities) {
            if (ambiguities.hasOwnProperty(key)) {
                counts += ambiguities[key].length;
            }
        }
        return counts;
    }

    return (
        <div className="p-6 mt-[50px]">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <ProgressSpinner />
                </div>
            ) : (
                <>
                    {userStories.length === 0 ? (
                        <div className='flex items-center justify-center h-full' style={{ minHeight: 'calc(60vh - 4rem)' }}>
                        <div className='flex flex-col items-center p-8 rounded-lg'>
                            <p className='text-4xl font-bold mb-4'>No data Present</p>
                            <p className='text-xl text-gray-600 mb-6'>(No User Stories Present)</p>
                            <Button 
                                label="Add" 
                                icon="pi pi-plus" 
                                className="p-button-primary p-3 bg-indigo-800 rounded-md text-white" 
                                onClick={openDialog} 
                            />
                        </div>
                    </div>
                    ) : (
                        <>
                            {/* <img src={igs_logo} className='h-[100px] w-[100px] absolute right-0 top-0 mr-[42px]' /> */}

                            <div className='flex justify-between mb-5'>
                                <h2 className="text-4xl font-bold mb-4">User Stories</h2>
                                <div className="flex space-x-4 justify-end">
                                <Button label="Add" icon="pi pi-plus" className="p-button-primary p-3 bg-indigo-800 rounded-md text-white" onClick={openDialog} />
                                <Button label="Download" icon="pi pi-save" className="p-button-success p-3 bg-indigo-800 rounded-md text-white" onClick={() => { downloadExcelDoc(sessionId) }} />
                                 </div>
                            </div>
                            <DataTable
                                value={userStories}
                                className="w-full mb-4 border-b border-gray-200"
                                selectionMode="multiple"
                                selection={selectedProducts}
                                onSelectionChange={(e) => setSelectedProducts(e.value)}
                                paginator
                                paginatorPosition="top"
                                rows={rows}
                                first={first}
                                onPage={onPageChange}
                                rowsPerPageOptions={[5, 10, 20]} // Options for rows per page
                                showGridlines
                                >
                                <Column selectionMode="multiple" headerStyle={{ textAlign: 'center' }} style={{ width: '5%' }}></Column>
                                <Column
                                    field="story"
                                    header={<span className="text-black">User Story</span>}
                                    className="w-4/12"
                                    body={(rowData) => (
                                        <span
                                            className="cursor-pointer text-black"
                                            // onClick={() => redirectToChecker(rowData)}
                                        >
                                            {rowData.story}
                                        </span>
                                    )}
                                />
                                <Column field="ambiguities" header="Ambiguity Count" body={(rowData) => countAmbiguities(rowData.ambiguities)} className="w-2/12" />
                                <Column field="status" header="Status" body={statusBodyTemplate} className="w-2/12" />
                            </DataTable>
                            <div className="flex space-x-4 justify-end">
                                <Button label="Process" icon="pi pi-check" className="p-button-success p-3 bg-indigo-800 rounded-md ml-5 text-white" onClick={handleProcessUserStories} disabled={processing} />
                                
                            </div>
                        </>
                    )}
                </>
            )}
            <Dialog header="Add User Story" visible={showDialog} maximizable style={{ width: '100%', height: '100%' }} onHide={hideDialog} className="w-1/3">
    <div className="flex flex-col items-center justify-center">
        <div className="mb-4 w-full">
            <textarea
                placeholder="User Story"
                value={userStory}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUserStory(e.target.value)}
                className="w-full p-inputtext p-component p-[20px] pb-40 mt-3 h-32"
            />
        </div>
        <div className="mb-4 w-full">
            <textarea
                placeholder="Context"
                value={context}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContext(e.target.value)}
                className="w-full p-inputtext p-component p-[20px] pb-40 h-32"
            />
        </div>
        <Button label="Save" icon="pi pi-save" className="p-button-success p-3 bg-indigo-800 rounded-md text-white" onClick={saveUserStory} />
    </div>
</Dialog>

            <Toast ref={toast} />
            {/* <Disclaimer /> */}
        </div>
    );
};

export default UserStory;

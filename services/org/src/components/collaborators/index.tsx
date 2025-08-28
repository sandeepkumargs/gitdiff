import React, { useContext, useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Sidebar } from 'primereact/sidebar';
import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { fetchPortfolios, fetchProjectsByPortfolioId, fetchCollaborators, getUser, getUserRole, registerUser, deleteUser } from '../../pages/services/service';
import { AppContext } from '../../routing/appContext';
import { InputText } from 'primereact/inputtext';
import { RadioButton } from 'primereact/radiobutton';
import { Toast } from 'primereact/toast';


interface Collaborator {
    name: string;
    email: string;
    role: string;
    username: string;
    organization: string;
    invitedBy: string;
    joinedAt: string;
    accessLevel: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
}

interface Portfolio {
    id: string;
    name: string;
    description: string;
    projectCount: number;
    credits: number;
    tags: string[];
}

interface Project {
    id: string;  // Use string here to store the project ID
    name: string;
    description: string;
}

interface InviteData {
    email: string,
    portfolio_id: string,
    project_id: string,
    type: string,
    read_write_access: boolean
}



const Collaborators: React.FC = () => {
    const { data, setData } = useContext(AppContext);
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [filteredCollaborators, setFilteredCollaborators] = useState<Collaborator[]>([]);
    const [selectedPortfolio, setSelectedPortfolio] = useState<string>(data?.portfolioDetails.id);
    const [selectedProject, setSelectedProject] = useState<string>(data?.projectDetails.id);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [collaboratorToDelete, setCollaboratorToDelete] = useState<Collaborator | null>(null);
    const [addMemberDialog, setAddMemberDialog] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [inviteData, setInviteData] = useState<InviteData>({
        email: "",
        portfolio_id: selectedPortfolio,
        project_id: selectedProject,
        type: "",
        read_write_access: true
    });
    const [myRole, setMyRole] = useState<string>("");
    const toast = useRef<Toast>(null);
    const [isDialogVisible, setIsDialogVisible] = useState(false);

    // Fetch portfolios
    useEffect(() => {
        const loadPortfolios = async () => {
            try {
                const data = await fetchPortfolios();
                setPortfolios(data);
            } catch (error) {
                console.error('Failed to load portfolios', error);
            }
        };

        loadPortfolios();
    }, []);

    useEffect(() => {
        const getCurrentRole = async () => {
            try {
                const role = await getUserRole(selectedProject, selectedPortfolio);
                setMyRole(role);
            } catch (error) {
                console.error('Failed to load portfolios', error);
            }
        }
        getCurrentRole()
    })


    // Fetch projects based on selected portfolio
    useEffect(() => {
        const fetchProjects = async () => {
            if (selectedPortfolio !== 'All') {
                try {
                    const fetchedProjects = await fetchProjectsByPortfolioId(selectedPortfolio);
                    setProjects(fetchedProjects);
                } catch (error) {
                    console.error('Failed to load projects', error);
                }
            } else {
                setProjects([]);
            }
        };

        fetchProjects();
    }, [selectedPortfolio]);

    // Fetch collaborators based on selected portfolio and project
    useEffect(() => {
        const fetchData = async () => {
            if (selectedPortfolio) {
                try {
                    const collaboratorsData = await fetchCollaborators(selectedPortfolio, selectedProject);
                    setCollaborators(collaboratorsData);
                } catch (error) {
                    console.error('Failed to load collaborators', error);
                }
            }
        };

        fetchData();
    }, [selectedPortfolio, selectedProject]); // Re-fetch data when either selectedPortfolio or selectedProject changes

    useEffect(() => {
        const searchResults = collaborators.filter((collaborator) =>
            collaborator.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredCollaborators(searchResults);
    }, [searchQuery, collaborators]);

    // useEffect(() => {
    //     const roleFilteredResults = collaborators.filter((collaborator) =>
    //         selectedRole ? collaborator.role === selectedRole : true
    //     );
    //     setFilteredCollaborators(roleFilteredResults);
    // }, [selectedRole, collaborators]);

    const handleRowClick = (collaborator: Collaborator) => {
        setSelectedCollaborator(collaborator);
        setSidebarVisible(true);
    };

    const confirmDelete = (collaborator: Collaborator) => {
        setCollaboratorToDelete(collaborator);
        setDeleteDialogVisible(true);
    };

    const deleteCollaborator = () => {
        if (collaboratorToDelete) {
            setCollaborators(collaborators.filter(c => c.email !== collaboratorToDelete.email));
            setDeleteDialogVisible(false);
        }
    };

    const cancelDelete = () => {
        setDeleteDialogVisible(false);
    };

    const handleInviteDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setInviteData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleAccessLevelChange = (access: boolean) => {
        setInviteData((prevData) => ({
            ...prevData,
            read_write_access: access,
        }));
    };

    const invite_type = [
        { label: 'Portfolio', value: 'portfolio' },
        { label: 'Project', value: 'project' },
        { label: 'User', value: 'user' },
    ];

    const handleInvite = async () => {
        if (!inviteData.email || !inviteData.type) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Please provide an email and select an invite type.', life: 3000 });
            return;
        }

        setLoading(true); // Start loading spinner

        const token = localStorage.getItem('refresh_token');
        if (!token) {
            alert('Authorization token is missing');
            setLoading(false);
            return;
        }

        try {
            const result = await registerUser(
                inviteData.email,
                token,
                inviteData.portfolio_id,
                inviteData.project_id,
                inviteData.type,
                inviteData.read_write_access
            );
            console.log('Registration successful:', result);
            toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Invite sent successfully!', life: 3000 });
            setAddMemberDialog(false);
        } catch (error) {
            console.error('Error registering user:', error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to register user. Please try again.', life: 3000 });
        } finally {
            setLoading(false); // Stop loading spinner
        }
        setAddMemberDialog(false)
        setInviteData({
            email: "",
            portfolio_id: selectedPortfolio,
            project_id: selectedProject,
            type: "",
            read_write_access: true
        })
    };

    const handleCancelAddMember = () => {
        setAddMemberDialog(false)
        setInviteData({
            email: "",
            portfolio_id: selectedPortfolio,
            project_id: selectedProject,
            type: "",
            read_write_access: true
        })
    }

    const showDialog = () => {
        setIsDialogVisible(true);
      };
    
      // Hide the dialog
      const hideDialog = () => {
        setIsDialogVisible(false);
      };
      const type = collaboratorToDelete?.accessLevel === 'Portfolio Admin' ? 'portfolio' : 'project';


      const handleDelete = async () => {
        if (collaboratorToDelete) {
            try {
                setLoading(true); // Start loading
                const userToDelete = {
                    portfolio_id: selectedPortfolio,
                    project_id: selectedProject,
                    user_email: collaboratorToDelete.email,
                    type: type,
                    role: collaboratorToDelete.accessLevel,
                };

                const result = await deleteUser(userToDelete);

                // If deletion was successful, update the state
                setCollaborators(collaborators.filter((collaborator) => collaborator.email !== collaboratorToDelete.email));
                toast.current?.show({
                    severity: 'success',
                    summary: 'Deleted Successfully',
                    detail: `${collaboratorToDelete.name} has been deleted.`,
                    life: 3000,
                });
                hideDialog();
            } catch (error) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete the user. Please try again.',
                    life: 3000,
                });
            } finally {
                setDeleteDialogVisible(false); // Close the dialog after the action
                setLoading(false); // Stop loading
            }
        }
    };

    return (
        <div className="p-4">
            <Toast ref={toast} />

            <h2 className="text-2xl font-bold mb-4 text-orange-600">Collaborators</h2>

            <div className="flex items-center justify-between mb-4 space-x-4">
                <div>
                    <Dropdown
                        value={selectedPortfolio}
                        options={[{ label: 'All', value: 'All' }, ...portfolios.map(p => ({ label: p.name, value: p.id }))]}
                        onChange={(e) => setSelectedPortfolio(e.value)}
                        placeholder="Select Portfolio"
                        className="w-40"
                    />
                    <Dropdown
                        value={selectedProject}
                        options={[{ label: '-', value: '' }, ...projects.map(p => ({ label: p.name, value: p.id }))]} // Pass the project ID here
                        onChange={(e) => setSelectedProject(e.value)}
                        placeholder="Select Project"
                        className="w-40 ml-[30px]"
                    />
                </div>
                {/* <div className="flex items-center mb-4 space-x-4">
                <InputText
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name"
                    className="p-inputtext-sm w-40"
                />
                </div> */}
                <Button style={{ backgroundColor: '#1E3A8A', color: 'white' }}
            size='small'
 label={'Add Members'} icon="pi pi-plus" className="p-button-primary ml-auto" onClick={() => setAddMemberDialog(true)} />
            </div>

            <DataTable
                value={collaborators}
                paginator
                rows={10}
                className="shadow-lg rounded-lg bg-white overflow-hidden"
                onRowClick={(e) => handleRowClick(e.data)}
                rowClassName="hover:bg-gray-100 transition-colors duration-200 ease-in-out"
            >
                <Column
                    field="name"
                    header="Name"
                    body={(rowData) => (
                        <div className="flex items-center space-x-3">
                            <Avatar
                                label={rowData.firstName.charAt(0) + rowData.lastName.charAt(0)}
                                className="mr-2 bg-indigo-500 text-white"
                                shape="circle"
                            />
                            <span className="font-medium text-gray-800">{rowData.name}</span>
                        </div>
                    )}
                />
                <Column
                    header="Email"
                    field="email"
                    body={(rowData) => (
                        <span className="text-sm text-gray-500">{rowData.email}</span>
                    )}
                />
                <Column
                    header="Role"
                    field="role"
                    body={(rowData) => (
                        <span className="text-sm text-gray-600 font-semibold">{rowData.role}</span>
                    )}
                />
                {myRole !== 'user' && (
                <Column
                    body={(rowData) => (
                        <Button
                            icon="pi pi-trash"
                            style={{ backgroundColor: '#1E3A8A', color: 'white' }}
                            rounded
                            className="p-button-rounded p-button-text text-red-600 hover:bg-red-100 transition-all duration-200"
                            onClick={(e) => {
                                e.stopPropagation();  // Prevent row click event from firing when clicking the button
                                confirmDelete(rowData);
                                showDialog();
                            }}
                        />
                    )}
                    headerStyle={{ width: '5rem' }}
                />
            )}
            </DataTable>

            <Dialog
        header="Confirm Deletion"
        visible={isDialogVisible}
        onHide={hideDialog}
        style={{ width: '400px', borderRadius: '10px' }} // Custom width and rounded corners
        footer={
          <div className="flex justify-between">
            <Button
              label="No"
              icon="pi pi-times"
              onClick={hideDialog}
              size="small"
              style={{ backgroundColor: '#1E3A8A', color: 'white' }}
              className='mr-6'
            />
            <Button
              label="Yes"
              icon="pi pi-check"
              size="small"
              onClick={handleDelete}
              autoFocus
              style={{ backgroundColor: '#1E3A8A', color: 'white' }}
            />
          </div>
        }
      >
        <p className="text-sm font-semibold">Are you sure you want to delete this User?</p>
        <p className="text-sm text-gray-500">This action cannot be undone.</p>
      </Dialog>

            <Dialog
                visible={addMemberDialog}
                style={{ width: '100%', maxWidth: '600px' }}  // Ensuring max width but responsive to smaller screens
                header="Invite New Member"
                modal
                onHide={() => setAddMemberDialog(false)}
                className="p-fluid"
            >
                <div className="flex-col">
                    <div className='mt-3'>
                        <label htmlFor="email" className="p-d-block p-mb-2">Email</label>
                        <InputText
                            id="email"
                            name="email"
                            value={inviteData.email}
                            onChange={handleInviteDataChange}
                            placeholder="Enter email"
                            className="p-inputtext p-component"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className='mt-3'>
                        <label htmlFor="portfolio_id" className="p-d-block p-mb-2">Select Portfolio</label>
                        <Dropdown
                            id="portfolio_id"
                            name="portfolio_id"
                            value={inviteData.portfolio_id}
                            options={[{ label: 'Select Portfolio', value: '' }, ...portfolios.map((p) => ({ label: p.name, value: p.id }))]}
                            onChange={e => handleInviteDataChange(e)}
                            placeholder="Select Portfolio"
                            className="p-dropdown p-component"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className='mt-3'>
                        <label htmlFor="project_id" className="p-d-block p-mb-2">Select Project</label>
                        <Dropdown
                            id="project_id"
                            name="project_id"
                            value={inviteData.project_id}
                            options={[{ label: '-', value: '' }, ...projects.map((p) => ({ label: p.name, value: p.id }))]}
                            onChange={e => handleInviteDataChange(e)}
                            placeholder="Select Project"
                            className="p-dropdown p-component"
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className='mt-3'>
                        <label htmlFor="type" className="p-d-block p-mb-2">Invite Type</label>
                        <Dropdown
                            id="type"
                            name="type"
                            value={inviteData.type}
                            options={invite_type}
                            onChange={handleInviteDataChange}
                            placeholder="Select Invite Type"
                            className="p-dropdown p-component"
                            style={{ width: '100%' }}
                        />
                    </div>

                    {inviteData.type === 'user' && (
                        <div className='mt-3'>
                            <div className="flex justify-start gap-5">
                                <div>
                                    <RadioButton
                                        name="accessLevel"
                                        value={false}
                                        checked={!inviteData.read_write_access}
                                        onChange={() => handleAccessLevelChange(false)}
                                        inputId="readOnly"
                                    />
                                    <label htmlFor="readOnly" className="p-ml-2">Read Only</label>
                                </div>
                                <div>
                                    <RadioButton
                                        name="accessLevel"
                                        value={true}
                                        checked={inviteData.read_write_access}
                                        onChange={() => handleAccessLevelChange(true)}
                                        inputId="readWrite"
                                    />
                                    <label htmlFor="readWrite" className="p-ml-2">Read Write</label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer buttons */}
                <div className="w-full flex justify-between mt-5">
                    <Button
                        label="Cancel"
                        icon="pi pi-times"
                        onClick={() => handleCancelAddMember()}
                        size="small"
                    />
                    <Button
                        label={loading ? 'Sending Invite...' : 'Invite'}
                        icon="pi pi-check"
                        onClick={() => handleInvite()}
                        size='small'
                    />
                </div>
            </Dialog>





            <Sidebar
                visible={sidebarVisible}
                position="right"
                onHide={() => setSidebarVisible(false)}
                className="p-sidebar-lg"
                style={{
                    width: '700px',
                    height: '700px',
                    borderTopLeftRadius: '20px',
                    borderBottomLeftRadius: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Transparent background
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
                    backdropFilter: 'blur(6px)', // Blurred background effect
                }}
            >
                {selectedCollaborator && (
                    <div className="p-6 space-y-8">
                        {/* Close Button */}
                        <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 p-2 rounded-full"
                            onClick={() => setSidebarVisible(false)}
                            aria-label="Close Sidebar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Header with Avatar and Name */}
                        <div className="flex items-center space-x-4 mb-6">
                            <Avatar
                                label={selectedCollaborator.firstName.charAt(0) + selectedCollaborator.lastName.charAt(0)}
                                size="xlarge"
                                shape="circle"
                                style={{ backgroundColor: '#1A237E', color: '#FFF' }}
                            />
                            <div>
                                <h3 className="text-3xl font-semibold text-gray-900">{selectedCollaborator.name}</h3>
                                <span className="text-lg text-gray-600">{selectedCollaborator.email}</span>
                            </div>
                        </div>

                        {/* Information Grid */}
                        <div className="grid grid-cols-2 gap-8 mt-8 text-sm">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Username</label>
                                <p className="text-lg font-semibold text-gray-800">{selectedCollaborator.username}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Organization</label>
                                <p className="text-lg font-semibold text-gray-800">{selectedCollaborator.organization}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Role</label>
                                <p className="text-lg font-semibold text-gray-800">{selectedCollaborator.role}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Access Level</label>
                                <p className="text-lg font-semibold text-gray-800">{selectedCollaborator.accessLevel}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Joined At</label>
                                <p className="text-lg font-semibold text-gray-800">{selectedCollaborator.joinedAt}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Invited By</label>
                                <p className="text-lg font-semibold text-gray-800">{selectedCollaborator.invitedBy}</p>
                            </div>
                            <div className="col-span-2">
                                <Divider className="my-0" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">First Name</label>
                                <p className="text-lg font-semibold text-gray-800">{selectedCollaborator.firstName}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Last Name</label>
                                <p className="text-lg font-semibold text-gray-800">{selectedCollaborator.lastName}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Sidebar>

        </div>
    );
};

export default Collaborators;

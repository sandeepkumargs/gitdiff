





import React, { useState, useEffect, useContext, useRef } from 'react';
import { Menubar } from 'primereact/menubar';
import { Avatar } from 'primereact/avatar';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { fetchProjectsByPortfolioId, fetchPortfolios, getUser, getAllInvites, acceptInvite, getUserRole, getLogo } from '../../pages/services/service';
import { AppContext } from '../../routing/appContext';
import { Menu } from 'primereact/menu';
import { useAuth } from '../../hooks/useAuth';
import { Toast } from 'primereact/toast';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import igs_logo from "../../assets/logo.png"
import './style.css';

const TopNavBar: React.FC = () => {

  interface User {
    verified: boolean;
    is_individual: boolean;
    default_portfolio_id: string;
    first_name: string; // Assuming user has first_name
  }

  const { logout } = useAuth();
  const [selectedDropdownItem, setSelectedDropdownItem] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [invites, setInvites] = useState<any[]>([]);
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useContext(AppContext);
  const menuRef = useRef<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<string | null>(null);
  const op = useRef(null);
  const toast = useRef(null);
  const [myRole, setMyRole] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [confirmAction, setConfirmAction] = useState<{ id: string; type: 'accept' | 'reject' } | null>(null);

  const homeDropdownItems = [
    { label: 'Home', value: 'Home' },
    { label: 'Kill Ambiguity', value: 'Kill Ambiguity' },
    { label: 'Mind Maps', value: 'Mind Maps' },
    { label: 'Test Scenarios', value: 'Test Scenarios' },
  ];

  const getDropdownValueFromPath = (path: string) => {
    switch (path) {
      case '/dashboard':
        return 'Home';
      case '/dashboard/ac/table':
        return 'Kill Ambiguity';
      case '/dashboard/mm/table':
        return 'Mind Maps';
      case '/dashboard/ts/table':
        return 'Test Scenarios';
      default:
        return null;
    }
  };

  useEffect(() => {
    const dropdownValue = getDropdownValueFromPath(location.pathname);
    if (dropdownValue) {
      setSelectedDropdownItem(dropdownValue);
      localStorage.setItem('selectedDropdownItem', dropdownValue);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Fetch the logo from the API
    const fetchLogo = async () => {
      try {
        const response = await getLogo('logo.png');  // Pass the image name you need
        console.log(response, 'blob');

        if (response) {
          setLogoUrl(response); // Set the logo URL to state if the API is successful
        } else {
          setLogoUrl(null); // If no logo URL is returned, fall back to the default logo
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
        setLogoUrl(null);  // Fallback to default logo if there's an error
      }
    };

    fetchLogo();  // Call the API when the component mounts
  }, []);

  useEffect(() => {
    const getCurrentRole = async () => {
      if (projects.length > 0 && portfolioId) {
        try {
          const role = await getUserRole(projects[0].id, portfolioId);
          console.log(role)
          // Map the API role to a human-readable role
          let mappedRole = '';
          switch (role) {
            case 'org admin':
              mappedRole = 'Org Admin';
              break;
            case 'portfolio admin':
              mappedRole = 'Portfolio Admin';
              break;
            case 'project admin':
              mappedRole = 'Project Admin';
              break;
            case 'read only user':
              mappedRole = 'User (Read Only)';
              break;
            default:
              mappedRole = 'User (Read & Write)';
          }

          setMyRole(mappedRole);
        } catch (error) {
          console.error('Failed to load role', error);
        }
      }
    };

    getCurrentRole();
  }, [projects, portfolioId]);
  useEffect(() => {
    const fetchInvites = async () => {
      const response = await getAllInvites(); // Assuming getAllInvites is a function that returns the invites array
      setInvites(response);

      const pendingInvites = response.filter(invite => invite?.status === 'Pending');
      setPendingCount(pendingInvites?.length); // Set the count of pending invites
    };

    fetchInvites();
  }, []);

  useEffect(() => {
    const loadPortfoliosAndProjects = async () => {
      try {
        const portfolios = await fetchPortfolios();
        if (portfolios.length > 0) {
          const selectedPortfolioId = portfolios[0].id;
          setPortfolioId(selectedPortfolioId);
          const selectedPortfolio = portfolios[0].name;
          setPortfolio(selectedPortfolio);
          const projectData = await fetchProjectsByPortfolioId(selectedPortfolioId);
          setProjects(projectData);
        }
      } catch (error) {
        console.error('Error loading portfolios and projects:', error);
      }
    };

    const fetchUser = async () => {
      const fetchedUser = await getUser(); // Fetch user data
      setUser(fetchedUser); // Set user in state
    };

    loadPortfoliosAndProjects();
    fetchUser();
  }, []);



  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      // Call the acceptInvite function from the service
      const result = await acceptInvite(inviteId);
      console.log(result);  // Do something with the result if necessary

      // Remove the accepted invite from the list
      setInvites((prevInvites) => prevInvites.filter(invite => invite?._id !== inviteId));
      setPendingCount((prevCount) => prevCount - 1);  // Update pending count
    } catch (error) {
      console.error('Error accepting invite:', error);
      // Handle the error (maybe show a toast notification)
    }
  };

  const handleRejectInvite = (inviteId: string) => {
    // Handle the invite reject logic here
    setInvites(prevInvites => prevInvites.filter(invite => invite?._id !== inviteId));
    setPendingCount(prevCount => prevCount - 1);
  };

  const handleConfirmAction = () => {
    if (confirmAction?.type === 'accept') {
      handleAcceptInvite(confirmAction.id);
    } else if (confirmAction?.type === 'reject') {
      handleRejectInvite(confirmAction.id);
    }
    setConfirmAction(null); // Reset confirmation state
  };

  const handleDropdownChange = (e: any) => {
    setSelectedDropdownItem(e.value);
    localStorage.setItem('selectedDropdownItem', e.value);
    handleNavigation(e.value);
  };

  const handleNavigation = (value: string) => {
    if (!data?.projectDetails || Object.keys(data.projectDetails).length === 0) {
      // Show warning toast if project details are missing
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a project first.',
        life: 3000, // Toast will disappear after 3 seconds
      });
      return; // Exit early, preventing navigation
    }

    switch (value) {
      case 'Home':
        navigate('/dashboard', { state: data.projectDetails });
        break;
      case 'Kill Ambiguity':
        navigate('/dashboard/ac/table', { state: data.projectDetails });
        break;
      case 'Mind Maps':
        navigate('/dashboard/mm/table', { state: data.projectDetails });
        break;
      case 'Test Scenarios':
        navigate('/dashboard/ts/table', { state: data.projectDetails });
        break;
      default:
        break;
    }
  };



  const items = [
    {
      label: 'Portfolio',
      icon: 'pi pi-folder',
      items: [
        { label: 'View Portfolio', icon: 'pi pi-eye', command: () => navigate('/dashboard/portfolio') },
      ],
    },
  ];

  
  const userItems = [
    {
      label: "User",
      icon: "pi pi-user",
      items: [
        
        // {
        //   label: "Access Level",
        //   icon: "pi pi-info-circle",
        //   command: () => {}, // Placeholder for any command if needed
        //   template: () => (
        //     <p className="text-md font-semibold px-4 py-2 inline-block">
        //       <span className="text-blue-600">{myRole}</span>
        //     </p>
        //   ),
        // },
        // {
        //   label: 'Credits',
        //   icon: 'pi pi-sitemap',
        //   command: () => setShowCreditsDialog(true)
        // },
        {
          label: "Logout",
          icon: "pi pi-sign-out",
          command: handleLogout,
        },
      ],
    },
  ];

  const start = (
    <div className="flex items-center space-x-2">
      <div>
        <img
          src={logoUrl || igs_logo}
          alt="Logo"
          className="h-16 w-16 lg:h-[30px] lg:w-[30px]"
        />
        {/* <div className="text-3xl font-bold text-blue-900">IGS Qualizen</div> */}
      </div>
      <div>
        <span className="ml-2 text-xl font-bold tracking-wide text-gray-100 uppercase mr-4">
          <span style={{ color: "#262C66FF" }}>Quali</span>
          <span style={{ color: "#DE3840FF" }}>Zen</span>
        </span>
      </div>
      {!user?.is_individual && user && (
        <Button
          label="View Portfolio"
          icon="pi pi-eye"
          size='small'
          onClick={() => navigate('/dashboard/portfolio')}
          style={{ backgroundColor: '#1a2668', borderColor: '#1a2668', height: '35px'}}
          className="text-white"
        />
      )}
    </div>
  );

  const end = (
    <div className="flex items-center space-x-6">
      {/* Conditionally render Dropdown based on pathname */}
      {!['/dashboard/project', '/dashboard/portfolio'].includes(location.pathname) && (
        <Dropdown
          value={selectedDropdownItem}
          options={homeDropdownItems}
          onChange={handleDropdownChange}
          placeholder="Home"
          className="rounded-lg border-blue-800 bg-blue-50 text-blue-800"
        />
      )}
      {/* <i className="pi pi-cog text-gray-700 text-xl cursor-pointer hover:text-gray-900 transition-colors"></i> */}
      <i
        className="pi pi-bell text-gray-700 text-xl cursor-pointer hover:text-gray-900 transition-colors relative"
        onClick={(e) => op.current.toggle(e)}
      >
        {pendingCount > 0 && (
          <Badge
            value={pendingCount}
            severity="danger"
            className="absolute bottom-3 left-2 w-6 h-6 text-sm rounded-full flex items-center justify-center"
          />
        )}
      </i>
      <OverlayPanel ref={op} className="p-6 bg-white rounded-2xl shadow-2xl max-w-lg mx-auto transition-all duration-300 ease-in-out transform">
        <div>
          {invites?.length === 0 ? (
            <p className="text-center text-gray-500 font-semibold">No pending invites.</p>
          ) : (
            invites?.map((invite) =>
              invite?.status === 'Pending' && (
                <div
                  key={invite?._id}
                  className="p-6 mb-6 border border-gray-200 rounded-2xl shadow-lg bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 hover:from-blue-50 hover:via-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="text-xl font-bold text-gray-800 mb-3">Pending Invite</div>
                  <div className="text-sm text-gray-700 space-y-3">
                    <div>
                      <strong className="text-gray-900">Email:</strong> {invite?.email}
                    </div>
                    <div>
                      <strong className="text-gray-900">Invited By:</strong> {invite?.invited_by}
                    </div>
                    <div>
                      <strong className="text-gray-900">Type:</strong> {invite?.type}
                    </div>
                    <div>
                      <strong className="text-gray-900">Status:</strong>
                      <span className="text-yellow-500 font-semibold">{invite?.status}</span>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4 mt-4">
                    <Button
                      label="Accept"
                      icon="pi pi-check"
                      className="p-button-success p-button-outlined rounded-xl shadow-xl px-6 py-2 transition-all duration-300 transform hover:scale-105 hover:bg-green-500 hover:text-white focus:ring-4 focus:ring-green-300"
                      onClick={() => handleAcceptInvite(invite?._id)}
                    />
                  </div>
                </div>
              )
            )
          )}
        </div>
      </OverlayPanel>



      <Menu model={userItems} popup ref={menuRef} id="user-menu" />
      <div className="flex items-center space-x-3 cursor-pointer" onClick={(event) => menuRef.current?.toggle(event)} >
        <Avatar icon="pi pi-user" shape="circle" size="large" />
        <div className="text-gray-800 font-medium">{user ? user.first_name : "User"}</div>
      </div>
    </div>
  );



  return (
    <>
      <Menubar
        start={start}
        end={end}
        className="bg-white border-b border-gray-200 rounded-b-lg shadow-lg sticky top-0 z-50"
      />



      {/* <Dialog
        header="Credits Information"
        visible={showCreditsDialog}
        style={{ width: '30vw' }}
        onHide={() => setShowCreditsDialog(false)}
      >
        <p className="text-lg">
          You have <span className="font-bold">500</span> remaining credits left.
        </p>
      </Dialog> */}

      <Dialog
        header={`Are you sure you want to ${confirmAction?.type}?`}
        visible={confirmAction !== null}
        footer={
          <div>
            <Button label="No" icon="pi pi-times" onClick={() => setConfirmAction(null)} />
            <Button label="Yes" icon="pi pi-check" onClick={handleConfirmAction} />
          </div>
        }
        onHide={() => setConfirmAction(null)}
      />
    </>
  );
};

export default TopNavBar;





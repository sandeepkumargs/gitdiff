import React, { useContext, useEffect, useState } from 'react';
import logo from "../../assets/logo.png";
import logo2 from "../../assets/logo2.png"
import { useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { getUser } from '../../pages/services/service';
import { Avatar } from 'primereact/avatar';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { AppContext } from '../../routing/appContext';
import { userLogout } from '../../pages/services/service';

function MenuItem({ icon, label, isDropdown, children, onClick, isCollapsed }) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s, color 0.2s',
                    color: 'white',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#1c2255';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'white';
                }}
                onClick={() => {
                    if (isDropdown) {
                        setIsExpanded((prev) => !prev);
                    }
                    if (onClick) {
                        onClick();
                    }
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <i
                        className={`${icon}`}
                        style={{
                            fontSize: '1rem',
                            marginRight: isCollapsed ? '0' : '12px',
                        }}
                    ></i>
                    {!isCollapsed && <span style={{ fontSize: '0.875rem' }}>{label}</span>}
                </div>
                {!isCollapsed && isDropdown && (
                    <i
                        className={`pi ${isExpanded ? 'pi-angle-up' : 'pi-angle-down'}`}
                        style={{ fontSize: '1rem' }}
                    ></i>
                )}
            </div>

            {/* {isDropdown && isExpanded && !isCollapsed && (
                <div style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                    {children}
                </div>
            )} */}


            {(isDropdown && (isExpanded || isCollapsed)) && (
    <div style={{ marginLeft: isCollapsed ? '0' : '1.5rem', marginTop: '0.5rem' }}>
        {children}
    </div>
)}

        </div>
    );
}

export default function SideNav({ isCollapsed, setIsCollapsed }) {
    const ONBOARDING_URL = process.env.ONBOARDING_URL
    interface User {
        verified: boolean;
        is_individual: boolean;
        default_portfolio_id: string;
        first_name: string;
    }

    const { logout } = useAuth();
    const navigate = useNavigate();
    const [appName, setAppname] = useState<string>();
    const [user, setUser] = useState<User | null>(null);
    const [isLogoutVisible, setIsLogOutVisible] = useState(false);
    const { data } = useContext(AppContext);
    // const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const fetchedUser = await getUser();
            setUser(fetchedUser);
        };
        fetchUser();
    }, []);

    const handleNavigation = (path: string) => {
        navigate(path, { state: data?.projectDetails });
    };

    const handleLogout = async () => {
        await userLogout();
        sessionStorage.clear();
        logout();
        setIsLogOutVisible(false);
        navigate("/login");
    };

    return (
        <div
        style={{
            // background: 'linear-gradient(180deg, #1a1a1a 0%, #000000 100%)',

            backgroundColor: 'black',
        //   backgroundColor: '#1c2255',
          color: 'white',
          height: '100vh',
          width: isCollapsed ? '4rem' : '18rem',
          position: 'fixed',
          left: 0,
          top: 0,
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
          zIndex: 1000, // Add this line
        }}
      >
            {/* Header with Collapse Toggle */}
            <div
    style={{
        display: 'flex',
        alignItems: 'center',
        padding: '1rem',
        flexDirection: isCollapsed ? 'column' : 'row', // Stack vertically when collapsed
        justifyContent: isCollapsed ? 'center' : 'space-between',
    }}
>
    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: isCollapsed ? 'column' : 'row', // Align vertically when collapsed
            textAlign: isCollapsed ? 'center' : 'left',
        }}
    >
        <img
            src={logo2}
            alt="Qualizen Logo"
            style={{
                width: isCollapsed ? '32px' : '50px',
                height: isCollapsed ? '32px' : '50px',
                marginBottom: isCollapsed ? '8px' : '0', // Space when collapsed
            }}
        />
        {!isCollapsed && (
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', marginLeft: '12px' }}>
                Qualizen
            </h1>
        )}
    </div>

    {/* Move the button below when collapsed */}
    <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            marginTop: isCollapsed ? '8px' : '0', // Add spacing when collapsed
        }}
    >
        <i className={`pi pi-chevron-${isCollapsed ? 'right' : 'left'}`} />
    </button>
</div>


            {/* Navigation Items */}
            <nav style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {!["/dashboard/project", "/dashboard/portfolio"].includes(location.pathname) && (
                <div>
                <MenuItem
                    icon="pi pi-th-large"
                    label="Dashboard"
                    isCollapsed={isCollapsed}
                    onClick={() => {
                        navigate("/dashboard");
                        setIsCollapsed(false);
                    }}
                />
                <MenuItem
                    icon="pi pi-box"
                    label="Products"
                    isDropdown
                    isCollapsed={isCollapsed}
                >
                    {/* Dropdown Children */}
                    <MenuItem
                        icon="pi pi-cog"
                        label="Kill Ambiguity"
                        isCollapsed={isCollapsed}
                        onClick={() => handleNavigation('/dashboard/ac/table')}
                    />
                    <MenuItem
                        icon="pi pi-sitemap"
                        label="Mind Maps"
                        isCollapsed={isCollapsed}
                        onClick={() => handleNavigation('/dashboard/mm/table')}
                    />
                    <MenuItem
                        icon="pi pi-list"
                        label="Test Scenarios"
                        isCollapsed={isCollapsed}
                        onClick={() => handleNavigation('/dashboard/ts/table')}
                    />
                            <MenuItem
            icon="pi pi-chart-bar"
            label="DefectZen"
            isCollapsed={isCollapsed}
            onClick={() => window.open('https://qualizenai.com/defectzen', '_blank')}
        />
                                    <MenuItem
            icon="pi pi-chart-line"
            label="Impact Analysis"
            isCollapsed={isCollapsed}
            onClick={() => window.open('https://demo.igsqa.com/', '_blank')}
        />
                                            <MenuItem
            icon="pi pi-microchip"
            label="Quality Assesment Tool"
            isCollapsed={isCollapsed}
            onClick={() => window.open('http://49.249.95.65:4061/qat/', '_blank')}
        />
                </MenuItem>
                </div>
            )}
                
                {!user?.is_individual && user && (
                    <MenuItem
                        icon="pi pi-briefcase"
                        label="View Portfolio"
                        isCollapsed={isCollapsed}
                        onClick={() => handleNavigation('/dashboard/portfolio')}
                    />
                )}
                {!["/dashboard/portfolio"].includes(location.pathname) && (
                <MenuItem
                    icon="pi pi-folder"
                    label="View Project"
                    isCollapsed={isCollapsed}
                    onClick={() => handleNavigation('/dashboard/project')}
                />
                )}
            </nav>

            {/* Profile Section */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '1rem',
                    right: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                }}
            >
                <Avatar
                    label={user?.first_name?.[0]?.toUpperCase() || "U"}
                    style={{ backgroundColor: '#2196F3', color: '#ffffff' }}
                    shape="circle"
                    // size="small"
                />
                {!isCollapsed && (
                    <>
                        <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                                {user?.first_name || "User"}
                            </p>
                        </div>
                        <button
                            onClick={() => setIsLogOutVisible(true)}
                            style={{
                                marginLeft: 'auto',
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                            }}
                        >
                            <i className="pi pi-sign-out" />
                        </button>
                    </>
                )}
            </div>

            {/* Logout Dialog */}
            <Dialog
                visible={isLogoutVisible}
                onHide={() => setIsLogOutVisible(false)}
                header="Confirm Logout"
                footer={
                    <div className='flex items-center gap-4'>
                        <Button
                            label="Cancel"
                            onClick={() => setIsLogOutVisible(false)}
                            className="p-button-text"
                            size='small'
                        />
                        <Button
                            label="Logout"
                            onClick={handleLogout}
                            className="p-button-danger"
                            size='small'
                        />
                    </div>
                }
            >
                <p>Are you sure you want to log out?</p>
            </Dialog>
        </div>
    );
}
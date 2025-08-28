import React, { useEffect, useState } from "react";
import { Avatar } from 'primereact/avatar';
import { AvatarGroup } from "primereact/avatargroup";
import { fetchCollaborators } from "../../pages/services/service"; // Assuming this service fetches the collaborators
import { useNavigate } from "react-router";
import './styles.css';
export function Avatars({ project_id, portfolio_id }) {
    const [collaborators, setCollaborators] = useState([]);
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const getCollaborators = async () => {
            try {
                const collaborators = await fetchCollaborators(portfolio_id, project_id);
                setCollaborators(collaborators);
            } catch (error) {
                console.error("Error fetching collaborators:", error);
            }
        };

        getCollaborators();
    }, [project_id, portfolio_id]);

    const maxVisibleAvatars = 3;
    const visibleCollaborators = collaborators.slice(0, maxVisibleAvatars); // Get the first 3 collaborators
    const extraCollaborators = collaborators.slice(maxVisibleAvatars); // Get remaining collaborators

    const avatarStyle = {
        backgroundColor: '#2196F3',
        color: '#ffffff',
        borderRadius: '50%',  // Ensure the avatar is circular
        transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth transition
        transform: isHovered ? 'scale(1.15)' : 'scale(1)', // Apply the scale on hover
        boxShadow: isHovered ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none', // Add shadow on hover
    };

    return (
        <div className="flex" onClick={() => navigate('/dashboard/collaborators')}>
            {/* Ensure visibleCollaborators is defined and has elements */}
            {(visibleCollaborators && visibleCollaborators.length > 0) ? (
                visibleCollaborators.slice(0, 3).map((collaborator, index) => {
                    const firstInitial = collaborator.firstName ? collaborator.firstName[0] : '';
                    const lastInitial = collaborator.lastName ? collaborator.lastName[0] : '';

                    return (
                        <div
            onMouseEnter={() => setIsHovered(true)}  // Set hover state to true when mouse enters
            onMouseLeave={() => setIsHovered(false)}  // Set hover state to false when mouse leaves
            style={{ display: 'inline-block', marginRight: '8px' }}  // Keep avatars inline and spaced
        >
            <Avatar
                key={index}
                label={`${firstInitial}${lastInitial}` || "NA"} // Use initials or "NA" as fallback
                size="large"
                style={avatarStyle} // Apply dynamic style
                shape="circle"
            />
        </div>
                    );
                })
            ) : (
                <></>// Fallback if no collaborators are present
            )}

            {/* Display additional collaborators in AvatarGroup if extraCollaborators is defined and has elements */}
            {extraCollaborators && extraCollaborators.length > 0 && (
                <AvatarGroup size="large" max={3}>
                    {extraCollaborators.map((collaborator, index) => {
                        const firstInitial = collaborator.firstName ? collaborator.firstName[0] : '';
                        const lastInitial = collaborator.lastName ? collaborator.lastName[0] : '';

                        return (
                            <Avatar
                                key={index}
                                label={`${firstInitial}${lastInitial}` || "NA"} // Use initials or "NA" as fallback
                                size="large"
                            />
                        );
                    })}
                </AvatarGroup>
            )}
        </div>

    );
}

export default Avatars;

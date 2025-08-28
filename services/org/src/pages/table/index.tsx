import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import StoryTable from 'table/table';

export default function Table() {
    const location = useLocation();
    const navigate = useNavigate();
    const [rowClicked, setRowClicked] = useState(false);
    const [AppName, setAppName] = useState('');
    const [path, setPath] = useState(location.pathname);
    const [projectid, setProjectid] = useState('66ececc974ca61263ad8ccde');
    const [userStory, setUserStory] = useState({});
    const [projectDetails, setProjectDetails] = useState(location.state)

    useEffect(() => {
        // Update path state when location changes
        setPath(location.pathname);

        if (path === "/dashboard/ac/table") {
            setAppName('Ambiguity Checker');
        } else if (path === "/dashboard/mm/table") {
            setAppName('Mind Maps');
        } else if (path === "/dashboard/ts/table") {
            setAppName('Test Scenarios');
        }

        if (rowClicked) {
            setRowClicked(false);
            const state = { userStory: userStory };

            if (path === "/dashboard/ac/table") {
                navigate("/dashboard/ac/checker", { state });
            } else if (path === "/dashboard/mm/table") {
                navigate("/dashboard/mm/viewer", { state });
            } else {
                navigate("/dashboard/ts/generator", { state });
            }
        }
    }, [location, rowClicked, path, navigate]);

    return (
        <>
            <StoryTable setRowClicked={setRowClicked} AppName={AppName} projectid={projectid} projectDetails={projectDetails} selectedUserStory={setUserStory} path={path} />
        </>
    );
}

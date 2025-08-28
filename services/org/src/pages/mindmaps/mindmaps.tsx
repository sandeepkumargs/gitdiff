import MindMaps from "mindmaps/mindmapchecker"
import { Button } from "primereact/button";
import { useLocation } from "react-router-dom";
import { AppContext } from "../../routing/appContext";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";

export default function MindMapsViewer() {
    const { data } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();
    const state  = location.state; 

    useEffect(() => {
        if (!state?.userStory) {
            console.log("userStory is undefined, navigating back");
            window.history.back(); // Navigate one step back
        }
    }, [state]);

    // Prevent rendering until navigation completes
    if (!state?.userStory) {
        return null;
    }
    
    return (
        <div className="">
        <MindMaps story={state?.userStory ?? "Default Story"} />

        {/* <div className=' mt-[40px] flex justify-evenly'>
             <div className='rounded-lg bg-gray-50 flex flex-col justify-center items-center p-4 w-1/3 shadow'>
                
                 <div className='flex w-full justify-between items-center'>
                     <div className='w-1/2'>
                     <p className="text-xl font-semibold text-gray-800 mb-2 pb-[15px]">Test Scenarios</p>
                         <p className="text-sm text-gray-700 leading-relaxed">
                         AI-driven test scenario generation for increased coverage, accuracy, and efficiency.
                         </p>
                     </div>
                     <Button
                         className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                         style={{ backgroundColor: '#1E3A8A', borderColor: '#1a2668'}}
                         size='small'
                        onClick={() => navigate('/dashboard/ts/table', { state: data.projectDetails })}
                     >
                         Go
                     </Button>
                 </div>
             </div>
             <div className='rounded-lg bg-gray-50 flex flex-col justify-center items-center p-4 w-1/3 shadow'>
    
     <div className='flex w-full justify-between items-center'>
         <div className='w-1/2'>
         <p className="text-xl font-semibold text-gray-800 mb-2 pb-[15px]">Kill Ambiguity</p>
             <p className="text-sm text-gray-700 leading-relaxed">
             Analyze requirements to detect vague, unclear, or ambigious aspects and refine requirements with criteria for success and assumptions.
             </p>
         </div>
         <Button
             className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
             style={{ backgroundColor: '#1E3A8A', borderColor: '#1a2668'}}
             onClick={() => navigate('/dashboard/ac/table', { state: data.projectDetails })}
             size='small'
         >
             Go
         </Button>
     </div>
 </div>
 </div> */}
 </div>
    )
}
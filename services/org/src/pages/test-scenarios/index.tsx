import TestScenarios from "testscenarios/TestScenarios"
import { Button } from "primereact/button";
import { useLocation } from "react-router-dom";
import { AppContext } from "../../routing/appContext";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";

export default function MindMapsViewer() {
    const { data } = useContext(AppContext);
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state;
    console.log(state)
    return (
        <div className="">
            <TestScenarios tsStory={state?.userStory} />
            {/* <div className=' mt-[40px] flex justify-evenly'>
                <div className='rounded-lg bg-gray-50 flex flex-col justify-center items-center p-4 w-1/3 shadow'>

                    <div className='flex w-full justify-between items-center'>
                        <div className='w-1/2'>
                            <p className="text-xl font-semibold text-gray-800 mb-2 pb-[15px]">Kill Ambiguity</p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                Analyze requirements to detect vague, unclear, or ambigious aspects and refine requirements with criteria for success and assumptions.
                            </p>
                        </div>
                        <Button
                            className="bg-indigo-800 text-white font-bold py-2 px-4 rounded"
                            onClick={() => navigate('/dashboard/ac/table', { state: data.projectDetails })}
                            size='small'
                        >
                            Go
                        </Button>
                    </div>
                </div>
                <div className='rounded-lg bg-gray-50 flex flex-col justify-center items-center p-4 w-1/3 shadow'>

                    <div className='flex w-full justify-between items-center'>
                        <div className='w-1/2'>
                            <p className="text-xl font-semibold text-gray-800 mb-2 pb-[15px]">Mind Maps</p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                Significantly improve the clarity, coverage, and efficiency of your testing process, leading to higher quality software.
                            </p>
                        </div>
                        <Button
                            className="text-white bg-indigo-800 font-bold py-2 px-4 rounded"
                            onClick={() => navigate('/dashboard/mm/table', { state: data.projectDetails })}
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
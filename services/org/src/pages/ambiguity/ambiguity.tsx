import { useLocation, useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import Ambiguity from 'ambiguity/AmbiguityChecker';
import { useState } from 'react';
import { Button } from 'primereact/button';
import { AppContext } from '../../routing/appContext';

export default function AmbiguityChecker() {
    const location = useLocation();
    const state  = location.state; 
    const [path, setPath] = useState(location.pathname);
    const navigate = useNavigate();
    const { data } = useContext(AppContext);

    useEffect(() => {
        // Check if state?.userStory is undefined
        if (!state?.userStory) {
            console.log("userStory is undefined, navigating back");
            window.history.back(); // Navigate one step back
        }
    }, [state]);

    // Only render the component if state?.userStory exists
    if (!state?.userStory) {
        return null; // Prevent rendering if navigating back
    }

    return (
        //@ts-ignore
        <div className=''>
        <Ambiguity ambStory={state?.userStory} path={path} /> 
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
                            <p className="text-xl font-semibold text-gray-800 mb-2 pb-[15px]">Mind Maps</p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                            Significantly improve the clarity, coverage, and efficiency of your testing process, leading to higher quality software.
                            </p>
                        </div>
                        <Button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                            style={{ backgroundColor: '#1E3A8A', borderColor: '#1a2668'}}
                            size='small'
                            onClick={() => navigate('/dashboard/mm/table', { state: data.projectDetails })}
                        >
                            Go
                        </Button>
                    </div>
 </div>
 </div> */}
 </div>
    );
}



// import { useLocation, useNavigate } from 'react-router-dom';
// import { useContext, useEffect, useRef } from 'react';
// import Ambiguity from 'ambiguity/AmbiguityChecker';
// import { useState } from 'react';
// import { Button } from 'primereact/button';
// import { AppContext } from '../../routing/appContext';
// import { Toast } from 'primereact/toast';

// export default function AmbiguityChecker() {
//     const toast = useRef(null);
//     const location = useLocation();
//     const state  = location.state; 
//     const [path, setPath] = useState(location.pathname);
//     const navigate = useNavigate();
//     const { data } = useContext(AppContext);

//     const randomToast = () => {
//         const toasts = [showMindMapsToast, showTestScenariosToast, showAmbiguityKillerToast];
//         const randomIndex = Math.floor(Math.random() * toasts.length);
//         toasts[randomIndex](); // Show the randomly selected toast
//     };

//     useEffect(() => {
//         const interval = setInterval(randomToast, 10000); // 10 seconds interval

//         return () => clearInterval(interval); // Cleanup the interval on component unmount
//     }, []);

//     const showMindMapsToast = () => {
//         toast.current?.show({
//           severity: 'contrast',
//           summary: 'Try Mind Maps',
//           detail: 'Significantly improve the clarity, coverage, and efficiency of your testing process, leading to higher quality software.',
//           life: 3000, // sticky toast, stays until clicked
//         //   sticky: true,
//           content: (
//             <div 
//               className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-300 p-5 rounded-3xl shadow-lg hover:shadow-2xl hover:scale-110 transform transition-all duration-500 ease-in-out flex flex-col items-start space-y-4 max-w-md w-[50vw] cursor-pointer hover:opacity-100 hover:ring-4 hover:ring-blue-300 hover:ring-opacity-80"
//               onClick={() => {
//                 navigate('/dashboard/mm/table', { state: data.projectDetails });
//                 toast.current?.clear(); // Close the toast after clicking
//               }}
//             >
//               <div className="flex items-center space-x-4">
//                 <i className="pi pi-lightbulb text-4xl text-blue-700 hover:text-blue-900 transition-all duration-500 transform hover:scale-150 hover:rotate-6 hover:text-yellow-500"></i>
//                 <p className="text-3xl font-extrabold text-blue-800 tracking-tight leading-tight transition-all duration-500 hover:text-blue-900 hover:tracking-tighter transform hover:scale-110 hover:rotate-2">
//                   Try Mind Maps
//                 </p>
//               </div>
//               <p className="text-base font-medium text-gray-700 opacity-90 leading-relaxed hover:text-gray-800 transition-all duration-500 hover:scale-110 transform hover:translate-x-4 hover:text-blue-800">
//                 Significantly improve the clarity, coverage, and efficiency of your testing process, leading to higher quality software.
//               </p>
//             </div>
//           )
          
//           ,
//         });
//       };
      
      
    
//       const showTestScenariosToast = () => {
//         toast.current?.show({
//           severity: 'Contrast',
//           summary: 'Try Test Scenarios',
//           detail: 'AI-driven test scenario generation for increased coverage, accuracy, and efficiency.',
//           life: 3000, // sticky toast, stays until clicked
//         //   sticky: true,
//           content: (
//             <div 
//               className="bg-gradient-to-r from-orange-50 via-orange-100 to-orange-300 p-5 rounded-3xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-500 ease-in-out flex flex-col items-start space-y-4 max-w-md w-[50vw] cursor-pointer hover:opacity-95 hover:ring-4 hover:ring-orange-200 hover:ring-opacity-60"
//               onClick={() => {
//                 navigate('/dashboard/ts/table', { state: data.projectDetails });
//                 toast.current?.clear(); // Close the toast after clicking
//               }}
//             >
//               <div className="flex items-center space-x-4">
//                 <i className="pi pi-cog text-4xl text-orange-700 hover:text-orange-800 transition-all duration-300 transform hover:scale-125"></i>
//                 <p className="text-3xl font-extrabold text-orange-800 tracking-tight leading-tight transition-all duration-300 hover:text-orange-900 hover:tracking-tight transform hover:scale-110">
//                   Try Test Scenarios
//                 </p>
//               </div>
//               <p className="text-base font-medium text-gray-700 opacity-90 leading-relaxed hover:text-gray-800 transition-all duration-300 hover:scale-105 transform">
//                 AI-driven test scenario generation for increased coverage, accuracy, and efficiency.
//               </p>
//             </div>
//           )
          
//           ,
//         });
//       };
      

//       const showAmbiguityKillerToast = () => {
//         toast.current?.show({
//           severity: 'contrast',
//           summary: 'Try Ambiguity Killer',
//           detail: 'Refine your requirements by eliminating ambiguities and ensuring clarity, completeness, and correctness for better outcomes.',
//           life: 3000, // sticky toast, stays until clicked
//         //   sticky: true,
//           content: (
//             <div 
//               className="bg-gradient-to-r from-red-50 via-red-100 to-red-300 p-5 rounded-3xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-500 ease-in-out flex flex-col items-start space-y-4 max-w-md w-[50vw] cursor-pointer hover:opacity-95 hover:ring-4 hover:ring-red-200 hover:ring-opacity-60"
//               onClick={() => {
//                 navigate('/dashboard/ac/table', { state: data.projectDetails });
//                 toast.current?.clear(); // Close the toast after clicking
//               }}
//             >
//               <div className="flex items-center space-x-4">
//                 <i className="pi pi-crosshairs text-4xl text-red-700 hover:text-red-800 transition-all duration-300 transform hover:scale-125"></i>
//                 <p className="text-3xl font-extrabold text-red-800 tracking-tight leading-tight transition-all duration-300 hover:text-red-900 hover:tracking-tight transform hover:scale-110">
//                   Try Ambiguity Killer
//                 </p>
//               </div>
//               <p className="text-base font-medium text-gray-700 opacity-90 leading-relaxed hover:text-gray-800 transition-all duration-300 hover:scale-105 transform">
//                 Refine your requirements by eliminating ambiguities and ensuring clarity, completeness, and correctness for better outcomes.
//               </p>
//             </div>
//           )
          
//           ,
//         });
//       };
      
      

//     return (
//         //@ts-ignore
//         <div className='pb-6'>
//         <Ambiguity ambStory={state.userStory} path={path} /> 
//         <Toast ref={toast} />
//  </div>
//     );
// }


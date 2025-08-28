import { Card } from "primereact/card";
import { InputTextarea } from "primereact/inputtextarea";
import React, { useState } from "react";

interface LocationState {
    _id: string;
    story: string;
    context: string;
    status: string;
    ambiguities: Record<string, { val: string; status: boolean }[]>;
    acceptance_criteria: string[];
    assumptions: string[];
    refined: string;
    sessionId: string;
    process_status: {
        ambiguity_checker: string;
        mind_maps: string;
        test_scenarios: string;
    };
}

const ViewAmbiguity: React.FC<{ ambStory: LocationState | null }> = ({ ambStory }) => {
    if (!ambStory) return null;
    const {
        _id, story: initialUserStory, context: initialContext, ambiguities: initialAmbiguities,
        acceptance_criteria, assumptions, refined: refinedStory, process_status
    } = ambStory;
    const [ambiguities, setAmbiguities] = useState(initialAmbiguities || {});
    const [newAmbiguity, setNewAmbiguity] = useState('');
    const [editingCategory, setEditingCategory] = useState<string | null>(null);

    return (
    <>
                    <div className="flex justify-between items-center">
                        {/* <img src={igs_logo} className='h-[100px] w-[100px] absolute right-0 top-0 mr-[42px]' alt="Logo" /> */}
                        <h2 className="text-4xl my-5 font-bold">Ambiguities</h2>
                    </div>
                    {Object.entries(ambiguities || {}).map(([category, items]) => (
                        <Card title={category.charAt(0).toUpperCase() + category.slice(1)} className="mb-5" key={category}>
                            <ul className="space-y-3">
                                {items?.map((item, index) => (
                                    <li key={index} className="flex items-center mb-2">
                                        <label htmlFor={`${category}-${index}`}>{item.val}</label>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    ))}
                </>
    )
}

export default ViewAmbiguity;
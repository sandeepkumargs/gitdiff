import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const ExcelTemplate: React.FC = () => {
    const data = [
        {
            ID: null,
            "Story Description": "As a shopper, I want to filter products by category, so that I can find what I need quickly.",
            "Acceptance Criteria": null,
            Assumption: null,
            "User Story Points": null,
            Hours: null,
            Labels: null,
            Platforms: null
        },
        {
            ID: null,
            "Story Description": "As a user, I want to customize my profile, so that it reflects my personality.",
            "Acceptance Criteria": null,
            Assumption: null,
            "User Story Points": null,
            Hours: null,
            Labels: null,
            Platforms: null
        },
        {
            ID: null,
            "Story Description": "As a customer, I want to view my transaction history, so that I can track my expenses.",
            "Acceptance Criteria": null,
            Assumption: null,
            "User Story Points": null,
            Hours: null,
            Labels: null,
            Platforms: null
        },
        {
            ID: null,
            "Story Description": "As a fitness enthusiast, I want to log my workouts, so that I can monitor my progress.",
            "Acceptance Criteria": null,
            Assumption: null,
            "User Story Points": null,
            Hours: null,
            Labels: null,
            Platforms: null
        },
        {
            ID: null,
            "Story Description": "As a traveler, I want to compare flight prices, so that I can choose the most cost-effective option.",
            "Acceptance Criteria": null,
            Assumption: null,
            "User Story Points": null,
            Hours: null,
            Labels: null,
            Platforms: null
        }
    ];

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Excel Data Table</h1>
            <DataTable value={data} responsiveLayout="scroll">
                <Column field="ID" header="ID"></Column>
                <Column field="Story Description" header="Story Description"></Column>
                <Column field="Acceptance Criteria" header="Acceptance Criteria"></Column>
                <Column field="Assumption" header="Assumption"></Column>
                <Column field="User Story Points" header="User Story Points"></Column>
                <Column field="Hours" header="Hours"></Column>
                <Column field="Labels" header="Labels"></Column>
                <Column field="Platforms" header="Platforms"></Column>
            </DataTable>
        </div>
    );
};

export default ExcelTemplate;

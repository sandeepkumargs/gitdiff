// components/ScoreBadge.tsx
import React from 'react';
import { Badge } from 'primereact/badge';
import { Tooltip } from 'primereact/tooltip';
import { Dialog } from 'primereact/dialog';
import './ScoreBadge.css'; // Custom styles

interface ScoreBadgeProps {
    evaluation_status: string;
    evaluation: any;
    storyId: string;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ evaluation_status, evaluation, storyId }) => {
    const [visible, setVisible] = React.useState(false);
    
    if (!evaluation && evaluation_status !== 'pending') return null;

    // Handle pending evaluation case
    if (evaluation_status === 'pending') {
        return (
            <div className="score-badge-container" style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
                <Badge
                    id={`score-badge-${storyId}`}
                    value="Calculating..."
                    severity="info"
                    className="enhanced-score-badge"
                    data-pr-tooltip="Evaluation in progress"
                    data-pr-position="top"
                    style={{
                        background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                        color: '#1e40af',
                        border: '1px solid #bae6fd',
                        fontSize: '0.8rem',
                        minWidth: '5rem',
                        height: '2rem',
                        padding: '0 0.8rem',
                        borderRadius: '1rem',
                        fontWeight: 600,
                        boxShadow: '0 1px 6px 0 rgba(0,0,0,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                    }}
                />
                <div
                    className="score-pulse-ring"
                    style={{
                        borderColor: '#bae6fd',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '4.5rem',
                        height: '4.5rem',
                        transform: 'translate(-50%, -50%)',
                        borderRadius: '50%',
                        borderWidth: '3px',
                        borderStyle: 'solid',
                        zIndex: 0,
                        pointerEvents: 'none',
                        animation: 'pulse-ring 1.5s infinite cubic-bezier(0.66, 0, 0, 1)',
                    }}
                ></div>
            </div>
        );
    }

    // Handle flagged case
    if (evaluation?.flagged) {
        return (
            <div className="score-badge-container" style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
                <Badge
                    id={`score-badge-${storyId}`}
                    value="Flagged"
                    severity="danger"
                    className="enhanced-score-badge flagged-badge"
                    onClick={() => setVisible(true)}
                    data-pr-tooltip={`Flagged: ${evaluation.reason}`}
                    data-pr-position="top"
                    style={{
                        background: 'linear-gradient(135deg, #fef2f2, #fecaca)',
                        color: '#dc2626',
                        border: '1px solid #fca5a5',
                        fontSize: '1rem',
                        minWidth: '2.2rem',
                        height: '2.2rem',
                        padding: '0 0.8rem',
                        borderRadius: '1rem',
                        fontWeight: 600,
                        boxShadow: '0 1px 6px 0 rgba(0,0,0,0.06)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                    }}
                />
                <div className="score-pulse-ring" style={{ 
                    borderColor: '#fca5a5',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '4.5rem',
                    height: '4.5rem',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%',
                    borderWidth: '3px',
                    borderStyle: 'solid',
                    zIndex: 0,
                    pointerEvents: 'none',
                    animation: 'pulse-ring 1.5s infinite cubic-bezier(0.66, 0, 0, 1)',
                }}></div>
                
                <Dialog 
                    header={<div className="dialog-header">
                        <div className="header-content">
                            <div>
                                <h3 className="header-title">Story Flagged</h3>
                                <p className="header-subtitle">Stage: {evaluation.stage}</p>
                            </div>
                        </div>
                        <div 
                            className="overall-score-display" 
                            style={{
                                background: 'linear-gradient(135deg, #fef2f2, #fecaca)',
                                color: '#dc2626',
                                border: '3px solid #fca5a5',
                            }}
                        >
                            ⚠️
                        </div>
                    </div>}
                    visible={visible} 
                    style={{ width: '90vw', maxWidth: '800px' }}
                    onHide={() => setVisible(false)}
                    draggable={false}
                    resizable={false}
                    modal
                    className="enhanced-evaluation-dialog"
                >
                    <div className="evaluation-grid">
                        <div className="evaluation-card flagged-card">
                            <div className="card-content">
                                <div className="card-header">
                                    <div className="category-info">
                                        <span className="category-name">Flag Reason</span>
                                    </div>
                                </div>
                                
                                <div className="reasons-section">
                                    <h4 className="reasons-title">Details:</h4>
                                    <ul className="reasons-list">
                                        <li className="reason-item">
                                            <span className="reason-bullet">•</span>
                                            <span className="reason-text">{evaluation.reason}</span>
                                        </li>
                                        <li className="reason-item">
                                            <span className="reason-bullet">•</span>
                                            <span className="reason-text">Stage: {evaluation.stage}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </div>
        );
    }

    // Handle normal evaluation case
    const { component_scores, total_score, total_out_of } = evaluation;
    const overallScore = Math.round((total_score / total_out_of) * 100);

    // Determine badge severity and colors based on score (light theme)
    const getScoreConfig = (score: number, outOf: number = 100) => {
        const normalizedScore = (score / outOf) * 100;
        
        if (normalizedScore >= 80) return { 
            severity: 'success', 
            gradient: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            color: '#15803d',
            border: '#bbf7d0',
            icon: '✨'
        };
        if (normalizedScore >= 60) return { 
            severity: 'info', 
            gradient: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
            color: '#1e40af',
            border: '#bae6fd',
            icon: '👍'
        };
        if (normalizedScore >= 40) return { 
            severity: 'warning', 
            gradient: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
            color: '#d97706',
            border: '#fed7aa',
            icon: '⚡'
        };
        return { 
            severity: 'danger', 
            gradient: 'linear-gradient(135deg, #fef2f2, #fecaca)',
            color: '#dc2626',
            border: '#fca5a5',
            icon: '🔥'
        };
    };

    const scoreConfig = getScoreConfig(overallScore);

    return (
        <>
            <Tooltip target={`#score-badge-${storyId}`} />
            
            {/* Enhanced Badge with animations and hover effects */}
            <div className="score-badge-container" style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
                <Badge
                    id={`score-badge-${storyId}`}
                    value={`${overallScore}%`}
                    severity={scoreConfig.severity}
                    className="enhanced-score-badge"
                    onClick={() => setVisible(true)}
                    data-pr-tooltip={`Overall Score: ${overallScore}% (${total_score}/${total_out_of}) - Click for detailed breakdown`}
                    data-pr-position="top"
                    style={{
                        background: scoreConfig.gradient,
                        color: scoreConfig.color,
                        border: `1px solid ${scoreConfig.border}`,
                        fontSize: '1rem',
                        minWidth: '2.2rem',
                        height: '2.2rem',
                        padding: '0 0.8rem',
                        borderRadius: '1rem',
                        fontWeight: 600,
                        boxShadow: '0 1px 6px 0 rgba(0,0,0,0.06)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                    }}
                />
                <div
                    className="score-pulse-ring"
                    style={{
                        borderColor: scoreConfig.border,
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '4.5rem',
                        height: '4.5rem',
                        transform: 'translate(-50%, -50%)',
                        borderRadius: '50%',
                        borderWidth: '3px',
                        borderStyle: 'solid',
                        zIndex: 0,
                        pointerEvents: 'none',
                        animation: 'pulse-ring 1.5s infinite cubic-bezier(0.66, 0, 0, 1)',
                    }}
                ></div>
            </div>
            
            {/* Enhanced Dialog */}
            <Dialog 
                header={
                    <div className="dialog-header">
                        <div className="header-content">
                            <div>
                                <h3 className="header-title">Story Evaluation</h3>
                                <p className="header-subtitle">Overall Score: {total_score}/{total_out_of} ({overallScore}%)</p>
                            </div>
                        </div>
                        <div 
                            className="overall-score-display" 
                            style={{
                                background: scoreConfig.gradient,
                                color: scoreConfig.color,
                                border: `3px solid ${scoreConfig.border}`,
                            }}
                        >
                            {overallScore}%
                        </div>
                    </div>
                }
                visible={visible} 
                style={{ 
                    width: '100vw', 
                    maxWidth: '100vw', 
                    height: '100vh', 
                    maxHeight: '100vh', 
                    margin: 0, 
                    top: 0, 
                    left: 0, 
                    borderRadius: 0,
                    padding: 0,
                    overflow: 'auto',
                }}
                contentStyle={{
                    width: '100vw',
                    height: '100vh',
                    maxWidth: '100vw',
                    maxHeight: '100vh',
                    padding: '2rem',
                    background: '#fff',
                    overflow: 'auto',
                }}
                onHide={() => setVisible(false)}
                draggable={false}
                resizable={false}
                modal
                className="enhanced-evaluation-dialog full-screen-dialog"
            >
                <div className="evaluation-grid">
                    {Object.entries(component_scores).map(([key, value], index) => {
                        if (typeof value !== 'object' || value === null) return null;
                        
                        const { score, out_of, reason } = value as { 
                            score?: number; 
                            out_of?: number;
                            reason?: string[] | null;
                        };
                        if (score === undefined || out_of === undefined) return null;

                        const itemConfig = getScoreConfig(score, out_of);
                        const percentage = Math.round((score / out_of) * 100);

                        return (
                            <div 
                                key={key} 
                                className="evaluation-card"
                                style={{ 
                                    animationDelay: `${index * 0.1}s`,
                                }}
                            >
                                <div className="card-content">
                                    <div className="card-header">
                                        <div className="category-info">
                                            <span className="category-name">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                        </div>
                                        <div 
                                            className="score-circle"
                                            style={{
                                                background: itemConfig.gradient,
                                            }}
                                        >
                                            <span className="score-value">{score}</span>
                                            <span className="score-max">/{out_of}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill"
                                            style={{
                                                width: `${percentage}%`,
                                                background: itemConfig.gradient,
                                                borderRight: `2px solid ${itemConfig.color}`
                                            }}
                                        ></div>
                                    </div>
                                    
                                    {Array.isArray(reason) && reason.length > 0 ? (
                                        <div className="reasons-section">
                                            <h4 className="reasons-title">Details:</h4>
                                            <ul className="reasons-list">
                                                {reason.map((r, i) => (
                                                    <li key={i} className="reason-item">
                                                        <span className="reason-bullet">•</span>
                                                        <span className="reason-text">{r}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="reasons-section">
                                            <p className="no-reasons">No additional details provided</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Dialog>
        </>
    );
};

export default ScoreBadge;
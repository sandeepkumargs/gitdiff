// DataSourceButton.tsx
import React, { useState, useContext, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
// remove: Toast and toastRef
import { postJiraImport } from '../../pages/services/service';
import { AppContext, useAppContext } from '../../routing/appContext';

type ShowToast = (options: {
  severity?: 'success' | 'info' | 'warn' | 'error' | undefined;
  summary?: string;
  detail?: string;
  life?: number;
}) => void;

type Props = {
  showToast: ShowToast;
};

const DataSourceButton: React.FC<Props> = ({ showToast }) => {
  const { data } = useContext(AppContext);
  const { refreshData, setRefreshData } = useAppContext();
  const { showModal, setShowModal } = useAppContext();

  const [jiraDialogVisible, setJiraDialogVisible] = useState(false);
  const [jiraData, setJiraData] = useState({
    url: '',
    email: '',
    project: '',
    issueType: '',
    token: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setJiraData(prev => ({ ...prev, [field]: e.target.value })); // trim later on submit for better UX
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};
    const trimmed = {
      url: jiraData.url.trim(),
      email: jiraData.email.trim(),
      project: jiraData.project.trim(),
      issueType: jiraData.issueType.trim(),
      token: jiraData.token.trim(),
    };
    if (!trimmed.url) newErrors.url = 'Jira URL is required.';
    if (!trimmed.email) newErrors.email = 'Email is required.';
    if (!trimmed.project) newErrors.project = 'Project Key is required.';
    if (!trimmed.issueType) newErrors.issueType = 'Issue Type is required.';
    if (!trimmed.token) newErrors.token = 'API Token is required.';
    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, trimmed };
  };

  const handleJiraImport = async () => {
    const { isValid, trimmed } = validateFields();
    if (!isValid) return;

    try {
      const payload = {
        ...trimmed,
        project_id: data?.projectDetails?.id,
      };

      const response = await postJiraImport(payload);

      if (response?.status === 200) {
        showToast({
          severity: 'success',
          summary: 'Success',
          detail: 'Jira import was successful!',
          life: 3000,
        });

        if (Array.isArray(response?.skipped_stories) && response.skipped_stories.length > 0) {
          const skippedKeys = response.skipped_stories
            .map((story: any) => story?.key)
            .filter(Boolean)
            .join(', ');
          showToast({
            severity: 'warn',
            summary: 'Some Stories Skipped',
            detail: skippedKeys ? `Skipped: ${skippedKeys}` : 'Some stories were skipped.',
            life: 5000,
          });
        }

        sessionStorage.setItem('refresh', 'true');
        setRefreshData(true);
        setShowModal(false);
        setJiraDialogVisible(false);
      } else {
        // Non-200 success path
        showToast({
          severity: 'warn',
          summary: 'Unexpected Response',
          detail: 'Import finished with an unexpected status.',
          life: 4000,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        'Jira import failed. Please try again.';

      if (errorMessage.toLowerCase().includes('url')) {
        setErrors(prev => ({ ...prev, url: errorMessage }));
      } else {
        setErrors(prev => ({ ...prev, general: errorMessage }));
      }

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 4000,
      });
    }
  };

  useEffect(() => {
    setJiraDialogVisible(true);
  }, []);

  return (
    <div>
      {/* Removed local <Toast ref={toastRef} /> */}
      <div className="p-grid p-4" style={{ height: '100%', overflowY: 'auto' }}>
        <div className="p-col-12 mb-3">
          <label htmlFor="url" className="font-semibold">Jira URL</label>
          <InputText
            id="url"
            value={jiraData.url}
            onChange={(e) => handleInputChange(e, 'url')}
            placeholder="https://your-jira-url"
            className="p-inputtext-lg w-full"
          />
          {errors.url && <small className="p-error">{errors.url}</small>}
        </div>

        <div className="p-col-12 mb-3">
          <label htmlFor="email" className="font-semibold">Email</label>
          <InputText
            id="email"
            value={jiraData.email}
            onChange={(e) => handleInputChange(e, 'email')}
            placeholder="Email"
            className="p-inputtext-lg w-full"
          />
          {errors.email && <small className="p-error">{errors.email}</small>}
        </div>

        <div className="p-col-12 mb-3">
          <label htmlFor="project" className="font-semibold">Project Key</label>
          <InputText
            id="project"
            value={jiraData.project}
            onChange={(e) => handleInputChange(e, 'project')}
            placeholder="Project Key (e.g., DEM)"
            className="p-inputtext-lg w-full"
          />
          {errors.project && <small className="p-error">{errors.project}</small>}
        </div>

        <div className="p-col-12 mb-3">
          <label htmlFor="issueType" className="font-semibold">Issue Type</label>
          <InputText
            id="issueType"
            value={jiraData.issueType}
            onChange={(e) => handleInputChange(e, 'issueType')}
            placeholder="Issue Type (e.g., Story)"
            className="p-inputtext-lg w-full"
          />
          {errors.issueType && <small className="p-error">{errors.issueType}</small>}
        </div>

        <div className="p-col-12 mb-3">
          <label htmlFor="token" className="font-semibold">API Token</label>
          <InputText
            id="token"
            value={jiraData.token}
            onChange={(e) => handleInputChange(e, 'token')}
            placeholder="Jira API Token"
            className="p-inputtext-lg w-full"
          />
          {errors.token && <small className="p-error">{errors.token}</small>}
        </div>

        <div className="p-col-12 flex justify-end">
          <Button
            label="Import"
            icon="pi pi-check"
            onClick={handleJiraImport}
            className="p-button-success bg-indigo-800 text-white hover:bg-indigo-700 transition-colors"
          />
        </div>

        {errors.general && (
          <div className="p-col-12">
            <small className="p-error">{errors.general}</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataSourceButton;

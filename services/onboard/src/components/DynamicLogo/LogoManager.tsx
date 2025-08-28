import React, { useState, useEffect, useRef } from "react"; // Ensure React is imported
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import { setLogo, getLogo } from "../../services/service";  // Import the API functions
import igs_logo from "../../assets/logo.png";  // Default logo image path

const LogoManager: React.FC = () => {
  // State for managing the logo preview and uploaded file
  const [logoPreview, setLogoPreview] = useState<string>(null); // Start with null or empty string
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(null);
  const [uploadDialogVisible, setUploadDialogVisible] = useState<boolean>(false);

  const toastRef = useRef<Toast>(null);  // Reference to the Toast component

  // Fetch the current logo when the component mounts
  useEffect(() => {
    getLogo('logo.png')
      .then((data) => {
        if (data) {
          setLogoPreview(data); // Set the logo URL from the response
        } else {
          setLogoPreview(igs_logo); // Fallback to default if no logo is found
        }
      })
      .catch((error) => {
        console.error("Error fetching logo", error);
        setLogoPreview(igs_logo); // Fallback to default logo on error
      });
  }, []);

  // Handle file selection
  const handleFileSelect = (event: { files: File[] }) => {
    const file = event.files[0];
    if (file) {
      setUploadedLogo(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);  // Update preview to the selected file
    }
  };

  // Set the logo by uploading it to the server
  const handleSetLogo = () => {
    if (uploadedLogo) {
      setLogo(uploadedLogo)
        .then(() => {
          toastRef.current?.show({
            severity: "success",
            summary: "Logo Updated",
            detail: "Your logo has been updated successfully.",
            life: 3000,
          });
          setUploadDialogVisible(false);
        })
        .catch((error) => {
          toastRef.current?.show({
            severity: "error",
            summary: "Upload Failed",
            detail: "There was an issue uploading your logo.",
            life: 3000,
          });
        });
    }
  };

  // Reset logo to default
  const handleResetToDefault = async () => {
    try {
      // Fetch the default logo image
      const response = await fetch(igs_logo);
      const blob = await response.blob();
  
      // Create a File object from the blob
      const defaultLogoFile = new File([blob], "logo.png", { type: blob.type });
  
      // Call setLogo API with the default logo File
      setLogo(defaultLogoFile)
        .then(() => {
          setLogoPreview(igs_logo); // Set the logo preview to the default
          setUploadedLogo(null); // Reset uploaded logo state
          toastRef.current?.show({
            severity: "warn",
            summary: "Logo Reset",
            detail: "Your logo has been reset to the default.",
            life: 3000,
          });
        })
        .catch((error) => {
          toastRef.current?.show({
            severity: "error",
            summary: "Reset Failed",
            detail: "There was an issue resetting the logo to the default.",
            life: 3000,
          });
        });
    } catch (error) {
      console.error("Error fetching default logo", error);
      toastRef.current?.show({
        severity: "error",
        summary: "Reset Failed",
        detail: "Unable to fetch the default logo.",
        life: 3000,
      });
    }
  };
  
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Toast ref={toastRef} />

      <div className="w-full max-w-4xl p-12 bg-white shadow-2xl rounded-xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Logo Manager</h1>
          <p className="text-lg text-gray-600 mb-8">
          Upload a new logo, and it will be instantly updated across the platform. With just one click, you can revert back to the IGS logo.
          </p>
        </div>

        <Card
          className="mb-10 p-6 shadow-lg border-round-lg"
          style={{
            background: "var(--surface-100)",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="flex justify-center mb-6">
            {/* Ensure the preview image is rendered correctly */}
            <img
              src={logoPreview || igs_logo}
              alt="Logo Preview"
              className="h-56 w-56 object-contain rounded-full shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105"
            />
          </div>
        </Card>

        <div className="flex flex-col gap-6 mt-8">
  <Button
    label="Upload New Logo"
    icon="pi pi-upload"
    className="p-button-outlined p-button-lg w-full p-button-info shadow-md rounded-full transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-700 hover:text-white hover:shadow-2xl hover:ring-4 hover:ring-blue-500 hover:ring-opacity-30 transform"
    onClick={() => setUploadDialogVisible(true)}
  />
  <Button
    label="Reset to Default Logo"
    icon="pi pi-refresh"
    className="p-button-danger p-button-lg w-full shadow-md rounded-full transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-red-500 hover:to-red-700 hover:text-white hover:shadow-2xl hover:ring-4 hover:ring-red-500 hover:ring-opacity-30 transform"
    onClick={handleResetToDefault}
  />
</div>

      </div>

      <Dialog
  visible={uploadDialogVisible}
  header="Upload New Logo"
  modal
  className="w-full sm:w-9/12 md:w-3/4 lg:w-5/12 xl:w-4/12"
  onHide={() => setUploadDialogVisible(false)}
  position="top"
  style={{ width: '100%', maxWidth: '500px' }} // Ensure a max width
>
  <div className="flex flex-col gap-8 px-4 sm:px-8 py-6 sm:py-10 bg-white rounded-2xl shadow-3xl backdrop-blur-lg">
    {/* File Upload Area */}
    <div className="flex justify-center">
      <FileUpload
        mode="basic"
        name="logo"
        accept="image/*"
        maxFileSize={1000000} // 1MB
        chooseLabel="Select Logo"
        customUpload
        onSelect={handleFileSelect}
        className="w-full max-w-lg p-4 sm:p-8 bg-white rounded-3xl shadow-xl border-2 border-gray-300 hover:border-indigo-500 focus:ring-4 focus:ring-indigo-300 transition-all ease-in-out duration-300 transform hover:scale-105"
        style={{
          background: "var(--surface-100)",
          boxShadow: "0 6px 30px rgba(0, 0, 0, 0.1)",
        }}
      />
    </div>

    {/* Action Buttons */}
    <div className="flex flex-col sm:flex-row justify-between sm:justify-end gap-4 sm:gap-8 mt-6 sm:mt-10">
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text p-button-lg text-gray-700 hover:text-gray-900 transition-all ease-in-out transform hover:scale-105"
        onClick={() => setUploadDialogVisible(false)}
      />
      <Button
        label="Set Logo"
        icon="pi pi-check"
        className="p-button-success p-button-lg bg-blue-600 text-white border-none shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 ease-in-out"
        disabled={!uploadedLogo}
        onClick={handleSetLogo}
      />
    </div>
  </div>
</Dialog>


    </div>
  );
};

export default LogoManager;

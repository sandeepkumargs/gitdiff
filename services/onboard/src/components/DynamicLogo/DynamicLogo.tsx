import React, { useEffect, useState } from "react";

const DynamicLogo = () => {
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    const logoPath = `${process.env.PUBLIC_URL}/logo`; // Folder path in 'public'
    const defaultLogo = "/logo/default.png"; // Fallback in case no image is found

    // Assuming the latest file is fetched or available
    fetch(`${logoPath}/current-logo.txt`) // A text file that points to the current logo
      .then((res) => res.text())
      .then((fileName) => {
        setLogoUrl(`${logoPath}/${fileName.trim()}`);
      })
      .catch(() => setLogoUrl(defaultLogo)); // Fallback if no file or error
  }, []);

  return (
    <div className="flex items-center justify-center lg:flex hidden z-10">
      <img
        src={logoUrl}
        alt="Dynamic Logo"
        className="h-16 w-16 lg:h-[30px] lg:w-[30px] mb-4"
      />
    </div>
  );
};

export default DynamicLogo;

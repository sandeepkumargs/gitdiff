import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.tsx"; // Hook for authentication state

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Assuming useAuth hook provides auth status
  console.log("PrivateRoute - isAuthenticated:", isAuthenticated);

  if (!isAuthenticated) {
    // If the user is not authenticated, redirect to login
    return <Navigate to="/login" />;
  }

  // If authenticated, render the children components (protected content)
  return children;
};

export default PrivateRoute;

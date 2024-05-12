import { useContext } from "react";
import { LoginContext } from "./FakeStackOverflow";

import { Navigate, Outlet } from "react-router-dom";
export default function PrivateRoutes() {
  const { currentUser, isLoading, handleLoading } = useContext(LoginContext);
  console.log("Logged In? ", currentUser);
  console.log("Loading? ", isLoading);
  if (isLoading) {
    setTimeout(() => {
      handleLoading(false);
    }, 1000);
    return <div>Loading...</div>;
  }
  return currentUser ? <Outlet /> : <Navigate to="/login" />;
}

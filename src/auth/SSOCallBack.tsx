import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SSOCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/sign-in");
  }, [navigate]);

  return null;
}

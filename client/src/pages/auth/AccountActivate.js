import axios from "axios";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";

export default function AccountActivate() {
  const [auth, setAuth] = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (token) requestActivation();
  }, [token]);

  const requestActivation = async () => {
    const { data } = await axios.post("/register", { token });
    if (data?.error) {
      toast.error(data.error);
    } else {
      console.log("set 3", data);
      localStorage.setItem("auth", JSON.stringify(data));
      setAuth(data);
      toast.success("Successfully logged in. Welcome to Realist!");
      navigate("/");
    }
  };
  return (
    <div
      className="display-1 d-flex justify-content-center align-items-center vh-100"
      style={{ marginTop: "-5%" }}
    >
      Please wait...
    </div>
  );
}

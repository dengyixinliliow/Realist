import SideBar from "../../components/nav/SideBar";
import { useAuth } from "../../context/auth";

export default function Dashboard() {
  const [auth, setAuth] = useAuth();
  return (
    <div>
      <h1 className="display-1 bg-primary text-light p-5">Dashboard</h1>
      <SideBar />
    </div>
  );
}

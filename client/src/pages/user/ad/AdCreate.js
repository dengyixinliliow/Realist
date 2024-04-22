import { useNavigate } from "react-router-dom";
import SideBar from "../../../components/nav/SideBar";
import { useState } from "react";

export default function AdCreate() {
  const [sell, setSell] = useState(false);
  const [rent, setRent] = useState(false);
  const navigate = useNavigate();

  const handleSell = () => {
    setSell(true);
    setRent(false);
  };

  const handleRent = () => {
    setSell(false);
    setRent(true);
  };

  return (
    <div>
      <h1 className="display-1 bg-primary text-light p-5">Ad Create</h1>
      <div
        className="d-flex vh-100 justify-content-center align-items-center"
        style={{ marginTop: "-14%" }}
      >
        <div className="col-lg-6">
          <button
            className="btn btn-primary btn-large col-12 p-5"
            onClick={handleSell}
          >
            <span className="h2">Sell</span>
          </button>
          {sell && (
            <div className="my-1">
              <button
                className="btn btn-secondary p-5 col-6"
                onClick={() => navigate("/ad/create/sell/House")}
              >
                <span className="h2">House</span>
              </button>
              <button
                className="btn btn-secondary p-5 col-6"
                onClick={() => navigate("/ad/create/sell/Land")}
              >
                <span className="h2">Land</span>
              </button>
            </div>
          )}
        </div>
        <div className="col-lg-6">
          <button
            className="btn btn-primary btn-large col-12 p-5"
            onClick={handleRent}
          >
            <span className="h2">Rent</span>
          </button>
          {rent && (
            <div className="my-1">
              <button
                className="btn btn-secondary p-5 col-6"
                onClick={() => navigate("/ad/create/rent/House")}
              >
                <span className="h2">House</span>
              </button>
              <button
                className="btn btn-secondary p-5 col-6"
                onClick={() => navigate("/ad/create/rent/Land")}
              >
                <span className="h2">Land</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <SideBar />
    </div>
  );
}

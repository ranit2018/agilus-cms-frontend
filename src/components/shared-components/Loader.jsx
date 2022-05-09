import React from 'react'
import FadeLoader from "react-spinners/FadeLoader";
import "react-tagsinput/react-tagsinput.css"; // If using WebPack and style-loader.

const Loader = () => {
  return (
    <div className="content-wrapper">
      <div className="form-loader">
        <FadeLoader color={"#4A90E2"} isLoading={true} size={65} />
      </div>
    </div>
  );
};

export default Loader;

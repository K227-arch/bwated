import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {


  const navigate  = useNavigate();

  function gotoDocumentChat(){
    navigate("/Documenttitle")
  }


  return (
    <>
      <div className="home-container">
        <div className="homebar">
          MY KISASI
          <button className="submit-button3" onClick={gotoDocumentChat}>Continue →</button>
        </div>
        <br></br>
        <hr class="separator" />
        <div className="introwords">
          <h1>
            <bold>Helping you study better, Faster</bold>
          </h1>
          <br></br>
          <p>
            <h2>Here is how to get started</h2>
          </p>
        </div>
        <div className="contents">
          <div className="contents1">
            <h3>
              <span>1</span> First Upload a PDF
            </h3>
            <br></br>
            <p>
              Upload the PDF content you would like to study.Bwarted will scan
              and use the PDF to provide you with answers and questions to help
              you study.
            </p>
          </div>
          <div className="contents2">
            <h3>
              <span>2</span> Ask questions
            </h3>
            <br></br>
            <p>
              Now you can ask Bwarted questions about the topics in the PDF
              and it will provide relevant answers and provide more information
              to help you understand better.
            </p>
          </div>
          <div className="contents3">
            <h3>
              <span>3</span> Take a test
            </h3>
            <br></br>
            <p>
              If you feel confident with your study session. Bwarted cab test
              your knowledge with a test, which can customize to your standards.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

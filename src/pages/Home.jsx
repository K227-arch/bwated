import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <>
     <div className="home-container">
      <div className="homebar">
         MY KISASI
         <button type="submit" class="submit-button">Continue →</button>
      </div><br></br>
      <hr class="separator" />
      <div className="introwords">
        <h1>Helping you study better, Faster</h1><br></br>
        <p>Here is how to get started</p>
      </div>
       <div className="contents">
        <div className="contents1">
           <h3><span>1</span> First Upload a PDF</h3><br></br>
           <p>Upload the PDF content you would like to study.My Kisasi will scan and use the PDF to provide you with answers and questions to help you study.</p> 
        </div>
        <div className="contents2">
           <h3><span>2</span> Ask questions</h3><br></br>
           <p>Now you can ask My kasasi questions about the topics in the PDF and it will provide relevant answers and provide more information to help you understand better.</p>
        </div>
          <div className="contents3">
            <h3><span>3</span>  Take a test</h3><br></br>
           <p>If you feel confident with your study session. My Kisasi cab test your knowledge with a test, which can customize to your standards.</p>
          </div>
           
       </div>
           
     </div>
      
    </>
  )
}

export default Home

import React from 'react';
import Header from './Header';
import './dashboard.css';


 function App({ children }) {
  return (
    <div className="layout">
      <div className="layout-main">
        <Header />
      </div>
      
      <div className="layout-main2">
        <div className="premium-plan">
        <button className="premium-btn">Using Premium plan</button>
        <h1>Good Morning, Abba</h1>
        <button className="newchat-btn"><h3>Start a new chart</h3></button>
        </div>
        

        <div className="box">
          <div className="box-btn">
            <button className="pdf-btn"><h3>PDFs Quizes</h3></button>
            <button className="most-btn"><h3>Most Recent</h3></button>
          </div>
          <div className="box1">
            <div className="box2">
              
              <div className="quarter"></div>
            </div>
            <div className="box2">
              
            <div className="quarter">
              
            </div>
            </div>
            <div className="box2">
            <div className="quarter"></div>
            </div>
            <div className="box2">
            <div className="quarter"></div>
            </div>
          </div>
           
        </div>
         
         
      </div>
      
    </div>
  );
}
export default App;
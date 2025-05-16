import SessionsList from "./components/SessionsList";
import OperatorsList from "./components/OperatorsList";
import SessionDetail from './components/SessionDetail';
import Navbar from "./components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { Routes, Route, Link } from 'react-router-dom';

const backend_url = "http://127.0.0.1:8000"

function App() {
  const [isConnected, setIsConnected] = useState(false);
  useEffect(()=>{
    async function fetch_connection(){
      let connected_or_not = false;
      try {
        connected_or_not = await axios.get(`${backend_url}/connected`) 
      } catch (e){
        console.log("got below error while checking connected or not")
        console.log(e)
      }
      setIsConnected(connected_or_not.data)
    }
    fetch_connection();
  }, [])
  return (
    <div className="space-y-6 bg-neutral-800 text-white min-h-screen">
      <Navbar isConnected={isConnected} setIsConnected={setIsConnected} backend_url={backend_url} />

      <Routes>
        {/* Main home screen */}
        <Route path="/" element={
          <div className="px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SessionsList isConnected={isConnected} setIsConnected={setIsConnected} backend_url={backend_url} />
              <OperatorsList isConnected={isConnected} setIsConnected={setIsConnected} backend_url={backend_url} />
            </div>
          </div>
        } />

        {/* Session detail screen */}
        <Route path="/session/:sessionId" element={
          <SessionDetail backend_url={backend_url} />
        } />
      </Routes>
    </div>
  );
}

export default App;

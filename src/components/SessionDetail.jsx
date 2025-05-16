import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios"


function SessionDetail({ backend_url }) {
  const { sessionId } = useParams();
  const {session, setSession} = useState();
  const navigate = useNavigate();
    useEffect(()=>{
        async function fetchSession(){
            // const sId = sessionId.substring(0, 8);
            const response = await axios.get(`${backend_url}/sessions/${sessionId}/files?path=/`)
            console.log("printing the session reponse")
            console.log(response);
            console.log("printing the session reponse data")
            console.log(response.data)
        }   
        fetchSession();
    }, [])
  return (
    <div className="px-4">
      {/* Sub-navbar */}
      <div className="flex items-center justify-between bg-neutral-900 p-4 rounded mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-sm px-3 py-1 bg-neutral-700 rounded hover:bg-neutral-600"
        >
          ← Back
        </button>
        <h2 className="text-lg font-bold">Session: {sessionId}</h2>
        <div /> {/* optional placeholder for spacing */}
      </div>

      {/* Session content */}
      <div className="space-y-4">
        <div className="p-4 bg-neutral-700 rounded">Some element in session view</div>
        <div className="p-4 bg-neutral-700 rounded">Another element here</div>
      </div>
    </div>
  );
}

export default SessionDetail;

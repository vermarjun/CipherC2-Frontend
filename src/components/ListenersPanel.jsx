import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { backend_url } from "../App";
import axios from "axios";

const listeners = [
  { id: "http", label: "HTTP Listener" },
  { id: "https", label: "HTTPS Listener" },
  { id: "dns", label: "DNS Listener" },
  { id: "mtls", label: "mTLS Listener" },
  { id: "wg", label: "WireGuard Listener" },
];

const listenerDefaults = {
  http: {
    host: "0.0.0.0",
    port: 80,
    persistent: false,
    timeout: 60,
  },
  https: {
    host: "0.0.0.0",
    port: 443,
    persistent: false,
    enforce_otp: true,
    long_poll_timeout: 1,
    timeout: 60,
  },
  dns: {
    host: "0.0.0.0",
    port: 53,
    canaries: true,
    persistent: false,
    enforce_otp: true,
    timeout: 60,
  },
  mtls: {
    host: "0.0.0.0",
    port: 8888,
    persistent: false,
    timeout: 60,
  },
  wg: {
    tun_ip: "10.0.0.1",
    port: 53,
    n_port: 8888,
    key_port: 1337,
    persistent: false,
    timeout: 60,
  },
};

export default function ListenerPanel({ jobs }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeListener, setActiveListener] = useState(null);
  const [configValues, setConfigValues] = useState({});
  const [activeListeners, setActiveListeners] = useState([]);

  const handleListenerClick = (id) => {
    setActiveListener(id);
    setConfigValues(listenerDefaults[id]);
  };

  const handleConfigChange = (key, value) => {
    setConfigValues((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const jobListenerNames = jobs.map((job) => job.name); // ['http', 'https', ...]
    setActiveListeners(jobListenerNames);
  }, [jobs]);

  async function fetch_backend(command, configValues = {}) {
  try {
    const requestData = { command, config: configValues };

    const response = await axios.post(`${backend_url}/interactwithlisteners`, requestData, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log(response.data);
    return data;
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    return null;
  }
}

  const handleStart = () => {
    console.log(`Starting ${activeListener.toUpperCase()} Listener with:`, configValues);
    const res = fetch_backend(activeListener, configValues);
    // console.log(res.data);
    // setActiveListeners((prev) => [...prev, activeListener]);
    setActiveListener(null);
  };

  return (
    <>
      {activeListener && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 z-40"></div>
      )}

      <div className="relative w-64">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-neutral-900 hover:bg-neutral-700 text-gray-100 px-4 py-2 rounded-lg text-sm transition"
        >
          <span>Listener Options</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className={`absolute z-50 mt-2 w-full bg-neutral-900 rounded-lg shadow-lg p-2 space-y-1`}>
            {listeners.map((item) => (
              <button
                key={item.id}
                onClick={() => handleListenerClick(item.id)}
                className={`flex justify-between items-center w-full px-3 py-2 rounded-md text-sm ${activeListeners.includes(item.id)?"bg-green-500 hover:bg-green-700":"bg-neutral-800 hover:bg-neutral-700"} transition text-white`}
              >
                <span>{item.label}</span>
                {activeListeners.includes(item.id) && (
                  <span className="text-xs">Active</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeListener && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -30 }}
            className="fixed z-50 inset-0 flex items-center justify-center"
          >
            <div className="bg-neutral-900 text-white rounded-xl p-5 w-[20rem] shadow-2xl space-y-4 border border-neutral-700">
              <h2 className="text-base font-semibold capitalize">
                {listeners.find((l) => l.id === activeListener)?.label} Config
              </h2>

              <div className="space-y-3">
                {Object.entries(configValues).map(([key, value]) => (
                  <div
                    key={key}
                    className={`${
                      typeof value === "boolean"
                        ? "flex items-center space-x-2"
                        : "flex flex-col space-y-1"
                    } ${typeof value !== "boolean" ? "w-full" : "w-1/2"}`}
                  >
                    <label className="text-xs capitalize whitespace-nowrap">{key}</label>

                    {typeof value === "boolean" ? (
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleConfigChange(key, e.target.checked)}
                        className="h-4 w-4 accent-green-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleConfigChange(key, e.target.value)}
                        className="bg-neutral-800 border border-neutral-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 w-full"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setActiveListener(null)}
                  className="px-3 py-1.5 text-sm rounded-md bg-neutral-700 hover:bg-neutral-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStart}
                  className="px-3 py-1.5 text-sm rounded-md bg-green-600 hover:bg-green-500 transition"
                >
                  Start
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

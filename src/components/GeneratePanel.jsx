import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { backend_url } from "../App";
import axios from "axios";

const options = [
  { id: "implant", label: "Generate Implant" },
  { id: "regenerate", label: "Regenerate Implant" },
  { id: "wg-config", label: "Generate WireGuard Config" },
  { id: "canaries", label: "List Canaries" },
  { id: "implants", label: "List Implants" },
  { id: "builders", label: "List Builders" },
];

const optionFlags = {
  generate: ["OS", "Type", "Size"],
  regenerate: ["Implant ID"],
  "wg-config": ["Client Name", "Allowed IPs"],
  canaries: [],
  implants: [],
  builders: ["Builder URL"],
};

export default function GeneratePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeOption, setActiveOption] = useState(null);
  const [flagValues, setFlagValues] = useState({});

  const handleOptionClick = (id) => {
    setActiveOption(id);
    setFlagValues({});
  };

  const handleFlagChange = (flag, value) => {
    setFlagValues((prev) => ({ ...prev, [flag]: value }));
  };

  async function fetch_backend(command, configValues = {}) {
    try {
      const requestData = { command : command, config: configValues };
  
      const res = await axios.post(
        `${backend_url}/interactwithGenerate`, 
          requestData,
          {
            responseType: "blob",  // important
          },
          {
            headers: { 'Content-Type': 'application/json' },
          });
      console.log(res);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "implant.exe");
      document.body.appendChild(link);
      link.click();
      link.remove();
      // return data; 
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      return null;
    }
  }

  const handleGenerate = () => {
    console.log(`Generating for ${activeOption} with flags:`, flagValues);
    const res = fetch_backend(activeOption, flagValues);
    setActiveOption(null);
  };

  return (
    <>
      {/* Blurred background */}
      {activeOption && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 z-40"></div>
      )}

      <div className="relative w-64">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full z-50 flex items-center justify-between bg-neutral-900 hover:bg-neutral-700 text-gray-100 px-4 py-2 rounded-lg text-sm transition"
        >
          <span>Generate options</span>
          <svg
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-full bg-neutral-900 rounded-lg shadow-lg p-2 space-y-1">
            {options.map((item) => (
              <button
                key={item.id}
                onClick={() => handleOptionClick(item.id)}
                className="flex justify-between items-center w-full px-3 py-2 rounded-md text-sm bg-neutral-800 hover:bg-neutral-700 transition text-white"
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeOption && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -30 }}
            className="fixed z-50 inset-0 flex items-center justify-center"
          >
            <div className="bg-neutral-900 text-white rounded-xl p-6 w-96 shadow-2xl space-y-4 border border-neutral-700">
              <h2 className="text-lg font-semibold capitalize">
                {options.find((o) => o.id === activeOption)?.label}
              </h2>

              {optionFlags[activeOption] != null ? (
                optionFlags[activeOption].map((flag) => (
                  <div key={flag} className="flex flex-col space-y-1">
                    <label className="text-sm">{flag}</label>
                    <input
                      type="text"
                      value={flagValues[flag] || ""}
                      onChange={(e) => handleFlagChange(flag, e.target.value)}
                      className="bg-neutral-800 border border-neutral-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-400">No flags required.</p>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setActiveOption(null)}
                  className="px-4 py-2 text-sm rounded-md bg-neutral-700 hover:bg-neutral-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 text-sm rounded-md bg-green-600 hover:bg-green-500 transition"
                >
                  Generate
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client"

import React, { useState, useEffect } from "react";

const CopyLink = () => {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  // Grab the URL only after the component mounts on the client
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleCopy = async () => {
    if (!currentUrl) return;

    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }   
  };

  return (
    <div className="w-full max-w-md">
      <div className="relative flex items-center h-12">
        {/* Input Field showing current URL */}
        <input
          type="text"
          readOnly
          value={currentUrl}
          className="w-full h-full pl-4 pr-24 text-sm text-gray-500 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent truncate"
        />

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className={`absolute top-0 right-0 h-full px-6 text-xs font-bold text-white uppercase tracking-wider transition-all duration-200 rounded-r-lg
            ${copied 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-[#325b84] hover:bg-[#264563]" // Matches the blue in your image
            }
          `}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
};

export default CopyLink;
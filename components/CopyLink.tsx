"use client"

import { useState, useSyncExternalStore } from "react";

const subscribeToLocation = () => () => {};

const CopyLink = () => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const currentUrl = useSyncExternalStore(
    subscribeToLocation,
    () => window.location.href,
    () => '',
  );

  const handleCopy = async () => {
    if (!currentUrl) return;

    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopyStatus('copied');
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
    } catch {
      setCopyStatus('failed');
    }   
  };

  return (
    <div className="w-full max-w-md">
      <div className="relative flex items-center h-12">
        {/* Input Field showing current URL */}
        <label htmlFor="share-url" className="sr-only">Link to this page</label>
        <input
          id="share-url"
          type="text"
          readOnly
          value={currentUrl}
          className="w-full h-full pl-4 pr-24 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg truncate"
        />

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          disabled={!currentUrl}
          className={`absolute top-0 right-0 h-full px-6 text-xs font-bold text-white uppercase tracking-wider transition-all duration-200 rounded-r-lg
            ${copyStatus === 'copied' 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-[#325b84] hover:bg-[#264563]" // Matches the blue in your image
            }
          `}
        >
          {copyStatus === 'copied' ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {copyStatus === 'copied' ? 'Link copied to clipboard.' : copyStatus === 'failed' ? 'Unable to copy the link.' : ''}
      </p>
    </div>
  );
};

export default CopyLink;

'use client'

import { useState } from 'react'
import {
    LuChevronDown,
    LuCircleCheck,
    LuExternalLink,
    LuLightbulb,
    LuMonitor,
    LuSmartphone,
} from 'react-icons/lu'

const instructions = {
    phone: [
        <>Open the Drive app and tap <strong>+</strong>, then <strong>Upload</strong>.</>,
        <>Select your CV and wait for the upload to finish.</>,
        <>Tap <strong>⋮</strong> beside the file, then <strong>Manage access</strong> or <strong>Share</strong>.</>,
        <>Change <strong>Restricted</strong> to <strong>Anyone with the link</strong>.</>,
        <>Choose <strong>Viewer</strong>, then tap <strong>Copy link</strong>.</>,
    ],
    computer: [
        <>Click <strong>New</strong>, then <strong>File upload</strong>, and select your CV.</>,
        <>Right-click the uploaded file and choose <strong>Share</strong>.</>,
        <>Change <strong>Restricted</strong> to <strong>Anyone with the link</strong>.</>,
        <>Choose <strong>Viewer</strong>, then click <strong>Copy link</strong> and <strong>Done</strong>.</>,
    ],
} as const

const CvLinkGuidance = ({ id }: { id: string }) => {
    const [device, setDevice] = useState<keyof typeof instructions>('phone')

    return (
        <div id={id} className="mb-3 mt-2.5 text-sm leading-5 text-slate-600">
            <p>Paste a viewing link that opens without a sign-in or access request.</p>

            <details open className="group mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50/50">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-white px-4 py-3 font-semibold text-slate-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#184aa2]">
                    <span className="flex items-center gap-2.5">
                        <LuLightbulb aria-hidden="true" className="text-indigo-700" size={17} />
                        How to create a shareable CV link
                    </span>
                    <LuChevronDown aria-hidden="true" className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" size={18} />
                </summary>

                <div className="border-t border-slate-200 p-4 sm:p-5">
                    <div className="rounded-md border border-indigo-100 border-l-2 border-l-indigo-500 bg-indigo-50/70 p-3.5">
                        <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-indigo-950">Recommended setup</p>
                                <p className="mt-0.5 text-sm leading-5 text-slate-700">
                                    Upload a PDF to Google Drive and share it as <strong>Anyone with the link</strong> and <strong>Viewer</strong>.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4 border-b border-slate-200">
                        <div role="group" aria-label="Choose your device" className="flex gap-5">
                            <button
                                type="button"
                                aria-pressed={device === 'phone'}
                                onClick={() => setDevice('phone')}
                                className={`flex items-center gap-2 border-b-2 pb-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2 ${device === 'phone'
                                    ? 'border-[#184aa2] text-[#184aa2]'
                                    : 'border-transparent text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                <LuSmartphone aria-hidden="true" size={16} /> On a phone
                            </button>
                            <button
                                type="button"
                                aria-pressed={device === 'computer'}
                                onClick={() => setDevice('computer')}
                                className={`flex items-center gap-2 border-b-2 pb-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2 ${device === 'computer'
                                    ? 'border-[#184aa2] text-[#184aa2]'
                                    : 'border-transparent text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                <LuMonitor aria-hidden="true" size={16} /> On a computer
                            </button>
                        </div>

                        <a
                            href="https://drive.google.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mb-2 hidden shrink-0 items-center gap-1.5 font-semibold text-[#184aa2] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2 sm:inline-flex"
                        >
                            Open Drive <LuExternalLink aria-hidden="true" size={14} />
                            <span className="sr-only">in a new tab</span>
                        </a>
                    </div>

                    <ol className="mt-4 space-y-3.5">
                        {instructions[device].map((step, index) => (
                            <li key={index} className="grid grid-cols-[1.75rem_1fr] items-start gap-2.5 text-sm leading-5 text-slate-700">
                                <span aria-hidden="true" className="grid size-6 place-items-center rounded-full border border-blue-200 bg-white text-xs font-semibold tabular-nums text-[#184aa2]">{index + 1}</span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ol>

                    <a
                        href="https://drive.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 font-semibold text-[#184aa2] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2 sm:hidden"
                    >
                        Open Google Drive <LuExternalLink aria-hidden="true" size={14} />
                        <span className="sr-only">in a new tab</span>
                    </a>

                    <div className="mt-5 flex items-start gap-3 rounded-md border border-emerald-100 bg-emerald-50/60 p-3.5">
                        <LuCircleCheck aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-700" size={18} />
                        <p className="text-sm leading-5 text-slate-700">
                            <strong>Before pasting:</strong> open the copied link in an incognito window. If it opens without signing in, it is ready. Do not use the address from your browser bar.
                        </p>
                    </div>
                </div>
            </details>
        </div>
    )
}

export default CvLinkGuidance

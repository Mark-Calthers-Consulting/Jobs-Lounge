const CvLinkGuidance = ({ id }: { id: string }) => (
    <div id={id} className="mb-3 text-sm leading-5 text-gray-600">
        <p>
            Paste a viewing link that recruiters can open without signing in or requesting access.
        </p>
        <details open className="mt-2 overflow-hidden border-l-2 border-[#184aa2] bg-slate-50">
            <summary className="cursor-pointer px-4 py-3 font-semibold text-[#184aa2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#184aa2]">
                Upload your CV and get the link
            </summary>
            <div className="border-t border-slate-200 px-4 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-slate-900">Using Google Drive</p>
                    <a
                        href="https://drive.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-fit font-semibold text-[#184aa2] underline underline-offset-4"
                    >
                        Open Google Drive <span className="sr-only">in a new tab</span><span aria-hidden="true">↗</span>
                    </a>
                </div>

                <div className="mt-4 grid gap-5 md:grid-cols-2">
                    <section aria-labelledby={`${id}-phone`}>
                        <h3 id={`${id}-phone`} className="font-semibold text-slate-900">On a phone</h3>
                        <ol className="mt-2 list-decimal space-y-2 pl-5 text-slate-700 marker:font-semibold marker:text-[#184aa2]">
                            <li>Open the Drive app and tap <strong>+</strong>, then <strong>Upload</strong>.</li>
                            <li>Select your CV and wait for the upload to finish.</li>
                            <li>Tap <strong>⋮</strong> beside the file, then <strong>Manage access</strong> or <strong>Share</strong>.</li>
                            <li>Under General access, change <strong>Restricted</strong> to <strong>Anyone with the link</strong>.</li>
                            <li>Choose <strong>Viewer</strong>, then tap <strong>Copy link</strong>.</li>
                        </ol>
                    </section>

                    <section aria-labelledby={`${id}-computer`}>
                        <h3 id={`${id}-computer`} className="font-semibold text-slate-900">On a computer</h3>
                        <ol className="mt-2 list-decimal space-y-2 pl-5 text-slate-700 marker:font-semibold marker:text-[#184aa2]">
                            <li>Click <strong>New</strong>, then <strong>File upload</strong>, and select your CV.</li>
                            <li>Right-click the uploaded file and choose <strong>Share</strong>.</li>
                            <li>Under General access, change <strong>Restricted</strong> to <strong>Anyone with the link</strong>.</li>
                            <li>Choose <strong>Viewer</strong>, then click <strong>Copy link</strong> and <strong>Done</strong>.</li>
                        </ol>
                    </section>
                </div>

                <div className="mt-4 border-t border-slate-200 pt-3 text-slate-700">
                    <p><strong>Paste the copied link above.</strong> Do not copy the address from your browser bar.</p>
                    <p className="mt-1">Test it in a private or incognito window. If it opens without signing in, it is ready.</p>
                </div>
            </div>
        </details>
    </div>
)

export default CvLinkGuidance

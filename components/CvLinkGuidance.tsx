const CvLinkGuidance = ({ id }: { id: string }) => (
    <div id={id} className="mt-1 text-sm leading-5 text-gray-600">
        <p>
            Use a link beginning with http:// or https://. It must not be private—recruiters
            should be able to open it without requesting access.
        </p>
        <details className="mt-2">
            <summary className="w-fit cursor-pointer font-medium text-[#184aa2] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2">
                How to get a shareable CV link
            </summary>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-gray-600">
                <li>Upload your CV to Google Drive or another cloud-storage service.</li>
                <li>Set access to anyone with the link. For Google Drive, choose Viewer.</li>
                <li>Copy the share link, paste it here, and test it in a private browser window.</li>
            </ol>
        </details>
    </div>
)

export default CvLinkGuidance

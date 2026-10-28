'use client'

import { useRef, useState, type DragEvent, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { FiExternalLink, FiFileText, FiRefreshCw, FiTrash2, FiUploadCloud } from 'react-icons/fi'
import { toast } from 'sonner'
import { myCvUrl, removeCv, renameCv, replaceCv, uploadCv, type CandidateCv } from '@/api/cvs'
import { useCandidateCvs } from '@/hooks/useCandidateCvs'

const buttonClass = 'inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] disabled:cursor-not-allowed disabled:opacity-50'
const primaryClass = 'rounded-md bg-[#184aa2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#123d87] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
const MAX_CV_BYTES = 3 * 1024 * 1024
const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const fileAccept = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const fileError = (file: File) => {
  if (!/\.(pdf|docx)$/i.test(file.name) || !allowedTypes.includes(file.type)) return 'Choose a PDF or DOCX file.'
  if (file.size < 1 || file.size > MAX_CV_BYTES) return 'Choose a file of 3 MB or less.'
  return ''
}
const fileSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`

export default function CvManager() {
  const queryClient = useQueryClient()
  const cvs = useCandidateCvs()
  const fileRef = useRef<HTMLInputElement>(null)
  const replaceRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [replacing, setReplacing] = useState<{ cv: CandidateCv; file: File } | null>(null)
  const [replaceTarget, setReplaceTarget] = useState<CandidateCv | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['candidateCvs'] }),
      queryClient.invalidateQueries({ queryKey: ['me'] }),
    ])
  }

  const chooseFile = (selected?: File) => {
    if (!selected) return
    const issue = fileError(selected)
    setError(issue)
    setFile(issue ? null : selected)
    if (!issue && !name.trim()) setName(selected.name.replace(/\.(pdf|docx)$/i, '').slice(0, 80))
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    if (busy || !cvs.data?.uploadEnabled || cvs.data.items.length >= 2) return
    if (event.dataTransfer.files.length !== 1) {
      setError('Choose one PDF or DOCX file.')
      return
    }
    chooseFile(event.dataTransfer.files[0])
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!file || !name.trim()) {
      setError(error || 'Choose a file and give it a name.')
      return
    }
    const issue = fileError(file)
    if (issue) { setError(issue); return }
    setBusy(true)
    setError('')
    try {
      await uploadCv({ file, name: name.trim() })
      await refresh()
      setFile(null)
      setName('')
      if (fileRef.current) fileRef.current.value = ''
      toast.success('CV added to your profile')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to upload CV')
    } finally {
      setBusy(false)
    }
  }

  const chooseReplacement = (selected?: File) => {
    if (!selected || !replaceTarget) return
    const issue = fileError(selected)
    setError(issue)
    if (!issue) setReplacing({ cv: replaceTarget, file: selected })
    setReplaceTarget(null)
    if (replaceRef.current) replaceRef.current.value = ''
  }

  const confirmReplacement = async () => {
    if (!replacing) return
    setBusy(true)
    setError('')
    try {
      await replaceCv({ id: replacing.cv.id, file: replacing.file })
      await refresh()
      setReplacing(null)
      toast.success('CV replaced')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to replace CV')
    } finally {
      setBusy(false)
    }
  }

  const saveName = async (id: string) => {
    if (!renameValue.trim()) return
    setBusy(true)
    setError('')
    try {
      await renameCv({ id, name: renameValue.trim() })
      await refresh()
      setRenaming(null)
      toast.success('CV renamed')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to rename CV')
    } finally {
      setBusy(false)
    }
  }

  const deleteCv = async (id: string, label: string) => {
    if (!window.confirm(`Remove “${label}” from your profile? Submitted applications will keep their selected CV.`)) return
    setBusy(true)
    setError('')
    try {
      await removeCv(id)
      await refresh()
      if (replacing?.cv.id === id) setReplacing(null)
      toast.success('CV removed from your profile')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to remove CV')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      {cvs.isLoading && <p role="status" className="text-sm text-slate-600">Loading CVs…</p>}
      {cvs.isError && <p role="alert" className="text-sm text-red-700">Could not load your CVs. <button type="button" onClick={() => void cvs.refetch()} className="font-semibold underline">Try again</button></p>}
      {cvs.data && (
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <div>
            {cvs.data.uploadEnabled && cvs.data.items.length < 2 ? (
              <form onSubmit={submit} className="space-y-4">
                <div role="button" tabIndex={busy ? -1 : 0} aria-label="Choose or drop a CV file" aria-disabled={busy}
                  onClick={() => { if (!busy) fileRef.current?.click() }}
                  onKeyDown={(event) => { if (!busy && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); fileRef.current?.click() } }}
                  onDragEnter={(event) => { event.preventDefault(); setDragging(true) }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { event.preventDefault(); setDragging(false) }} onDrop={onDrop}
                  className={`flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] ${dragging ? 'border-[#184aa2] bg-blue-100' : 'border-blue-200 bg-blue-50/50'}`}>
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-100 text-[#184aa2]"><FiUploadCloud aria-hidden="true" size={23} /></span>
                  <p className="mt-3 text-sm font-semibold text-slate-950">Drag and drop your CV here</p>
                  <p className="mt-1 text-sm text-slate-600">or choose a file</p>
                  <span className="mt-3 inline-flex rounded-md bg-[#184aa2] px-4 py-2 text-sm font-semibold text-white">Choose file</span>
                  <p className="mt-3 text-xs text-slate-600">PDF or DOCX · Maximum 3 MB</p>
                </div>
                <input ref={fileRef} id="cv-file" type="file" accept={fileAccept} disabled={busy} tabIndex={-1} onChange={(event) => chooseFile(event.target.files?.[0])} className="sr-only" aria-label="Choose a PDF or DOCX file" />
                {file && <p className="break-all text-sm text-slate-700">Selected: {file.name} · {fileSize(file.size)}</p>}
                <div>
                  <label htmlFor="cv-name" className="text-sm font-semibold text-slate-950">Name this CV</label>
                  <input id="cv-name" required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Marketing CV" className="mt-1.5 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]" />
                </div>
                <button type="submit" disabled={busy || !file} className={primaryClass}>{busy ? 'Uploading…' : 'Upload CV'}</button>
              </form>
            ) : (
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-5 text-sm text-slate-700">
                {cvs.data.items.length >= 2 ? 'Both CV slots are in use. Replace or remove one to add a different CV.' : 'Add a CV link below to use when you apply.'}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-950">Your CVs ({cvs.data.items.length}/2)</h3>
            <ul className="mt-3 space-y-3">
              {cvs.data.items.map((cv) => (
                <li key={cv.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-blue-50 text-[#184aa2]"><FiFileText aria-hidden="true" size={19} /></span>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-slate-950">{cv.name}</p>
                      <p className="mt-0.5 break-all text-xs text-slate-600">{cv.originalName} · {fileSize(cv.bytes)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a className={buttonClass} href={myCvUrl(cv.id)} target="_blank" rel="noopener noreferrer">View <FiExternalLink aria-hidden="true" size={13} /></a>
                    {cvs.data.uploadEnabled && <button type="button" className={buttonClass} disabled={busy} onClick={() => { setReplaceTarget(cv); replaceRef.current?.click() }}><FiRefreshCw aria-hidden="true" size={13} /> Replace</button>}
                    <button type="button" className={buttonClass} disabled={busy} onClick={() => { setRenaming(cv.id); setRenameValue(cv.name) }}>Rename</button>
                    <button type="button" className={buttonClass} disabled={busy} onClick={() => void deleteCv(cv.id, cv.name)} aria-label={`Remove ${cv.name}`}><FiTrash2 aria-hidden="true" size={13} /> Remove</button>
                  </div>
                  {renaming === cv.id && <div className="mt-4 flex flex-wrap items-end gap-2">
                    <label className="min-w-44 flex-1 text-sm font-medium text-slate-800" htmlFor={`rename-cv-${cv.id}`}>CV name
                      <input id={`rename-cv-${cv.id}`} value={renameValue} maxLength={80} onChange={(event) => setRenameValue(event.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]" />
                    </label>
                    <button type="button" disabled={busy || !renameValue.trim()} className={buttonClass} onClick={() => void saveName(cv.id)}>Save</button>
                    <button type="button" className={buttonClass} onClick={() => setRenaming(null)}>Cancel</button>
                  </div>}
                </li>
              ))}
            </ul>
            {!cvs.data.items.length && <p className="mt-3 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">No CVs saved yet.</p>}
          </div>
        </div>
      )}
      <input ref={replaceRef} type="file" accept={fileAccept} className="sr-only" tabIndex={-1} aria-label="Choose replacement CV file" onChange={(event) => chooseReplacement(event.target.files?.[0])} />
      {replacing && <div role="group" aria-label="Confirm CV replacement" className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
        <p className="text-sm font-semibold text-slate-950">Replace {replacing.cv.name}?</p>
        <p className="mt-1 break-all text-sm text-slate-700">New file: {replacing.file.name} · {fileSize(replacing.file.size)}</p>
        <p className="mt-1 text-xs text-slate-600">The CV name stays the same. Applications already submitted keep their original file.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={busy} className={primaryClass} onClick={() => void confirmReplacement()}>{busy ? 'Replacing…' : 'Confirm replacement'}</button>
          <button type="button" disabled={busy} className={buttonClass} onClick={() => setReplacing(null)}>Cancel</button>
        </div>
      </div>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
  )
}

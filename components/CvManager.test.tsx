import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CvManager from './CvManager'

const uploadCv = vi.fn()
const replaceCv = vi.fn()
const invalidateQueries = vi.fn()
let uploadEnabled = true
let documents: Array<{ id: string; name: string; originalName: string; mimeType: string; bytes: number; createdAt: string }> = []

vi.mock('@/hooks/useCandidateCvs', () => ({
  useCandidateCvs: () => ({ data: { items: documents, uploadEnabled }, isLoading: false, isError: false }),
}))
vi.mock('@/api/cvs', () => ({
  uploadCv: (...args: unknown[]) => uploadCv(...args),
  replaceCv: (...args: unknown[]) => replaceCv(...args),
  renameCv: vi.fn(),
  removeCv: vi.fn(),
  myCvUrl: (id: string) => `/api/cvs/${id}`,
}))
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries }),
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }))

describe('CV manager', () => {
  beforeEach(() => {
    uploadEnabled = true
    documents = []
    uploadCv.mockReset().mockResolvedValue({})
    replaceCv.mockReset().mockResolvedValue({})
    invalidateQueries.mockReset().mockResolvedValue(undefined)
  })

  it('offers a CV link without exposing upload availability', () => {
    uploadEnabled = false
    render(<CvManager />)
    expect(screen.getByText('Add a CV link below to use when you apply.')).toBeInTheDocument()
    expect(screen.queryByText(/uploads are being set up/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Upload CV' })).not.toBeInTheDocument()
  })

  it('uploads a named PDF and refreshes the candidate profile', async () => {
    render(<CvManager />)
    const file = new File(['%PDF-1.7'], 'design.pdf', { type: 'application/pdf' })
    fireEvent.change(screen.getByLabelText('Choose a PDF or DOCX file'), { target: { files: [file] } })
    fireEvent.change(screen.getByLabelText('Name this CV'), { target: { value: 'Design' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Upload CV' }).closest('form')!)
    await waitFor(() => expect(uploadCv).toHaveBeenCalledWith({ file, name: 'Design' }))
    await waitFor(() => expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['me'] }))
  })

  it('rejects a CV above 3 MB before uploading', () => {
    render(<CvManager />)
    const file = new File(['%PDF-1.7'], 'large.pdf', { type: 'application/pdf' })
    Object.defineProperty(file, 'size', { value: (3 * 1024 * 1024) + 1 })
    expect(screen.getByText(/Maximum 3 MB/)).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Choose a PDF or DOCX file'), { target: { files: [file] } })
    expect(screen.getByRole('alert')).toHaveTextContent('Choose a file of 3 MB or less.')
    expect(uploadCv).not.toHaveBeenCalled()
  })

  it('accepts a dropped PDF through the normal upload flow', async () => {
    render(<CvManager />)
    const file = new File(['%PDF-1.7'], 'design.pdf', { type: 'application/pdf' })
    fireEvent.drop(screen.getByText('Drag and drop your CV here').parentElement!, { dataTransfer: { files: [file] } })
    expect(screen.getByLabelText('Name this CV')).toHaveValue('design')
    fireEvent.submit(screen.getByRole('button', { name: 'Upload CV' }).closest('form')!)
    await waitFor(() => expect(uploadCv).toHaveBeenCalledWith({ file, name: 'design' }))
  })

  it('opens the file picker from the drop zone with the keyboard', () => {
    render(<CvManager />)
    const picker = screen.getByLabelText('Choose a PDF or DOCX file') as HTMLInputElement
    const click = vi.spyOn(picker, 'click')
    fireEvent.keyDown(screen.getByRole('button', { name: 'Choose or drop a CV file' }), { key: 'Enter' })
    expect(click).toHaveBeenCalledOnce()
  })

  it('keeps replacement available when both CV slots are full and confirms before sending', async () => {
    documents = [
      { id: 'one', name: 'Main CV', originalName: 'old.pdf', mimeType: 'application/pdf', bytes: 1200, createdAt: '' },
      { id: 'two', name: 'Other CV', originalName: 'other.pdf', mimeType: 'application/pdf', bytes: 1200, createdAt: '' },
    ]
    render(<CvManager />)
    expect(screen.queryByRole('button', { name: 'Upload CV' })).not.toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: 'Replace' })[0])
    const file = new File(['%PDF-1.7'], 'new.pdf', { type: 'application/pdf' })
    fireEvent.change(screen.getByLabelText('Choose replacement CV file'), { target: { files: [file] } })
    expect(screen.getByText(/New file: new.pdf/)).toBeInTheDocument()
    expect(replaceCv).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Confirm replacement' }))
    await waitFor(() => expect(replaceCv).toHaveBeenCalledWith({ id: 'one', file }))
  })

  it('preserves the replacement review if the request fails', async () => {
    documents = [{ id: 'one', name: 'Main CV', originalName: 'old.pdf', mimeType: 'application/pdf', bytes: 1200, createdAt: '' }]
    replaceCv.mockRejectedValue(new Error('Please try again'))
    render(<CvManager />)
    fireEvent.click(screen.getByRole('button', { name: 'Replace' }))
    fireEvent.change(screen.getByLabelText('Choose replacement CV file'), { target: { files: [new File(['%PDF-1.7'], 'new.pdf', { type: 'application/pdf' })] } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm replacement' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Please try again'))
    expect(screen.getByText('Replace Main CV?')).toBeInTheDocument()
  })
})

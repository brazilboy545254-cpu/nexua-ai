import { logDevError } from './utils'

const maxBytes = 5 * 1024 * 1024
const supportedTypes = ['application/pdf', 'text/plain', 'text/markdown', 'text/csv']
const supportedExtensions = ['.pdf', '.txt', '.md', '.csv']

function hasSupportedExtension(file: File) {
  return supportedExtensions.some((extension) => file.name.toLowerCase().endsWith(extension))
}

async function readText(file: File) {
  try {
    return await file.text()
  } catch (error) {
    logDevError(error)
    throw new Error('Unable to read the selected file.')
  }
}

async function readPdf(file: File) {
  try {
    const pdfjs = await import('pdfjs-dist')
    const worker = await import('pdfjs-dist/build/pdf.worker.mjs?url')
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default
    const buffer = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: buffer }).promise
    const pages: string[] = []

    for (let index = 1; index <= pdf.numPages; index += 1) {
      const page = await pdf.getPage(index)
      const content = await page.getTextContent()
      const text = content.items
        .map((item) => ('str' in item && typeof item.str === 'string' ? item.str : ''))
        .join(' ')
      pages.push(text)
    }

    return pages.join('\n\n')
  } catch (error) {
    logDevError(error)
    throw new Error('Unable to extract text from this PDF.')
  }
}

/** Extracts text context from supported chat attachments without persisting file contents. */
export async function extractAttachmentText(file: File) {
  if (file.size > maxBytes) {
    throw new Error('Files must be 5MB or smaller.')
  }
  if (!supportedTypes.includes(file.type) && !hasSupportedExtension(file)) {
    throw new Error('Supported files: PDF, TXT, MD, and CSV.')
  }
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return readPdf(file)
  }
  return readText(file)
}

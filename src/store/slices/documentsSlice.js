import { createSlice } from "@reduxjs/toolkit";

/**
 * Documents slice — student's document vault.
 *
 * Status: missing | uploaded | verified | rejected
 * In production: files live in S3 with signed URLs.
 */
const SEED = [
  { id: "d1", type: "resume", name: "Resume", filename: "divyansh_resume.pdf", size: "238 KB", status: "verified", uploadedAt: "2026-04-12", required: true },
  { id: "d2", type: "tenth", name: "10th marksheet", filename: "10th_marksheet.pdf", size: "1.2 MB", status: "verified", uploadedAt: "2026-04-10", required: true },
  { id: "d3", type: "twelfth", name: "12th marksheet", filename: "12th_marksheet.pdf", size: "1.4 MB", status: "uploaded", uploadedAt: "2026-04-10", required: true },
  { id: "d4", type: "transcript", name: "College transcript", filename: null, size: null, status: "missing", uploadedAt: null, required: true },
  { id: "d5", type: "id_card", name: "College ID card", filename: "id_card.jpg", size: "450 KB", status: "verified", uploadedAt: "2026-04-10", required: true },
  { id: "d6", type: "noc", name: "No-objection certificate", filename: null, size: null, status: "missing", uploadedAt: null, required: false },
  { id: "d7", type: "aadhaar", name: "Aadhaar (last 4 digits)", filename: "aadhaar_redacted.pdf", size: "180 KB", status: "verified", uploadedAt: "2026-04-11", required: true },
  { id: "d8", type: "pan", name: "PAN card", filename: null, size: null, status: "missing", uploadedAt: null, required: false },
];

const documentsSlice = createSlice({
  name: "documents",
  initialState: { items: SEED },
  reducers: {
    uploadDocument(state, action) {
      const doc = state.items.find((d) => d.id === action.payload.id);
      if (doc) {
        doc.filename = action.payload.filename;
        doc.size = action.payload.size;
        doc.uploadedAt = new Date().toISOString().slice(0, 10);
        doc.status = "uploaded"; // pending verification
      }
    },
    deleteDocument(state, action) {
      const doc = state.items.find((d) => d.id === action.payload);
      if (doc) {
        doc.filename = null;
        doc.size = null;
        doc.uploadedAt = null;
        doc.status = "missing";
      }
    },
  },
});

export const { uploadDocument, deleteDocument } = documentsSlice.actions;
export const selectDocuments = (s) => s.documents.items;
export const selectDocumentByType = (type) => (s) =>
  s.documents.items.find((d) => d.type === type);
export default documentsSlice.reducer;

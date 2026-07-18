import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { documentsApi, IS_MOCK } from "@/api";

export const fetchDocuments = createAsyncThunk("documents/fetch", async () => {
  const data = await documentsApi.list();
  return data.documents || [];
});

/**
 * Documents slice — student's document vault.
 *
 * Status: missing | uploaded | verified | rejected
 * In production: files live in S3 with signed URLs.
 */
// Resumes live in their own section (user.resumes), not the fixed vault —
// keeping a "resume" slot here would contradict that source of truth.
const SEED = [
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
  // Only seed demo docs in mock mode; real mode loads the student's own
  // documents from the DB via fetchDocuments.
  initialState: { items: IS_MOCK ? SEED : [], status: "idle" },
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
  extraReducers: (builder) => {
    builder.addCase(fetchDocuments.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.items = action.payload;
    });
  },
});

export const { uploadDocument, deleteDocument } = documentsSlice.actions;
export const selectDocuments = (s) => s.documents.items;
export const selectDocumentByType = (type) => (s) =>
  s.documents.items.find((d) => d.type === type);
export default documentsSlice.reducer;

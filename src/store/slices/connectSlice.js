import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { connectApi } from "@/api";

/**
 * Connect slice — mentor requests between students and alumni.
 *   mine  = the student's outgoing requests
 *   inbox = the alumnus's incoming requests
 * Both come from the same backend collection, keyed by the caller's role.
 */
export const createConnect = createAsyncThunk(
  "connect/create",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await connectApi.create(payload);
      return data.request;
    } catch (err) {
      return rejectWithValue(err.message || "Could not send request");
    }
  }
);

export const fetchMyConnects = createAsyncThunk("connect/mine", async () => {
  const data = await connectApi.mine();
  return data.requests || [];
});

export const fetchInbox = createAsyncThunk("connect/inbox", async () => {
  const data = await connectApi.inbox();
  return data.requests || [];
});

export const respondConnect = createAsyncThunk(
  "connect/respond",
  async ({ id, status, meetingLink }, { rejectWithValue }) => {
    try {
      const data = await connectApi.respond(id, { status, meetingLink });
      return data.request;
    } catch (err) {
      return rejectWithValue(err.message || "Could not update request");
    }
  }
);

// Replace-or-insert by id — keeps a list consistent after a mutation.
const upsert = (list, item) => {
  if (!item) return list;
  const i = list.findIndex((r) => String(r.id) === String(item.id));
  if (i === -1) return [item, ...list];
  const next = [...list];
  next[i] = { ...next[i], ...item };
  return next;
};

const connectSlice = createSlice({
  name: "connect",
  initialState: { mine: [], inbox: [], status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyConnects.fulfilled, (s, a) => { s.mine = a.payload; })
      .addCase(fetchInbox.fulfilled, (s, a) => { s.inbox = a.payload; })
      .addCase(createConnect.fulfilled, (s, a) => { s.mine = upsert(s.mine, a.payload); })
      .addCase(respondConnect.fulfilled, (s, a) => { s.inbox = upsert(s.inbox, a.payload); });
  },
});

export const selectMyConnects = (s) => s.connect.mine;
export const selectConnectInbox = (s) => s.connect.inbox;
export default connectSlice.reducer;

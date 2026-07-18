import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { COMPANIES } from "@/data/mockData";
import { companiesApi, IS_MOCK } from "@/api";

export const fetchCompanies = createAsyncThunk("companies/fetch", async () => {
  const data = await companiesApi.list();
  return data.companies || [];
});

export const createCompany = createAsyncThunk(
  "companies/create",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await companiesApi.create(payload);
      return data.company;
    } catch (err) {
      return rejectWithValue(err.message || "Could not create company");
    }
  }
);

const companiesSlice = createSlice({
  name: "companies",
  initialState: { items: IS_MOCK ? COMPANIES : [], status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        // Idempotent: never add a company already in the list (guards against
        // a double dispatch or an already-fetched record reappearing).
        const c = action.payload;
        if (c && !state.items.some((x) => String(x.id) === String(c.id))) {
          state.items.unshift(c);
        }
      });
  },
});

export const selectCompanies = (s) => s.companies.items;
// Map keyed by id for O(1) name/logo resolution across job surfaces.
export const selectCompaniesById = (s) =>
  Object.fromEntries(s.companies.items.map((c) => [c.id, c]));
export default companiesSlice.reducer;

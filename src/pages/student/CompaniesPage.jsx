import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input, Chip } from "@/components/ui";
import { CompanyCard } from "@/components/domain/CompanyCard";
import { PageTransition } from "@/components/feedback/PageTransition";
import { useDebounce } from "@/hooks/useDebounce";
import { COMPANIES } from "@/data/mockData";
import { INDUSTRIES } from "@/lib/constants";

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [industries, setIndustries] = useState([]);
  const debouncedSearch = useDebounce(search);

  const visible = useMemo(() => {
    let list = COMPANIES;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (industries.length > 0) {
      list = list.filter((c) => industries.includes(c.industry));
    }
    return list;
  }, [debouncedSearch, industries]);

  const toggleIndustry = (ind) => {
    setIndustries((p) => (p.includes(ind) ? p.filter((i) => i !== ind) : [...p, ind]));
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="display-heading text-3xl text-ink">Companies</h1>
          <p className="text-sm text-ink-2 mt-1">{visible.length} of {COMPANIES.length} companies</p>
        </div>

        <div className="space-y-3">
          <Input
            placeholder="Search companies"
            leftIcon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-2 flex-wrap">
            {INDUSTRIES.map((i) => (
              <Chip key={i} active={industries.includes(i)} onClick={() => toggleIndustry(i)}>
                {i}
              </Chip>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
          {visible.map((c) => (
            <CompanyCard key={c.id} company={c} />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}

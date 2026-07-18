import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input, Chip } from "@/components/ui";
import { AlumniCard } from "@/components/domain/AlumniCard";
import { PageTransition } from "@/components/feedback/PageTransition";
import { useDebounce } from "@/hooks/useDebounce";
import { ALUMNI, COMPANIES } from "@/data/mockData";

export default function AlumniPage() {
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const debouncedSearch = useDebounce(search);

  const visible = useMemo(() => {
    let list = ALUMNI;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.expertise.some((e) => e.toLowerCase().includes(q))
      );
    }
    if (companyId) list = list.filter((a) => a.companyId === companyId);
    if (verifiedOnly) list = list.filter((a) => a.verified);
    return list;
  }, [debouncedSearch, companyId, verifiedOnly]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="display-heading text-3xl text-ink">Alumni Connect</h1>
          <p className="text-sm text-ink-2 mt-1">
            Mentors from your college — verified, rated, and ready to help.
          </p>
        </div>

        <div className="space-y-3">
          <Input
            placeholder="Search by name or expertise"
            leftIcon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-2 flex-wrap">
            <Chip active={verifiedOnly} onClick={() => setVerifiedOnly((v) => !v)}>
              Verified only
            </Chip>
            <div className="h-5 w-px bg-border mx-1" />
            {COMPANIES.map((c) => (
              <Chip
                key={c.id}
                active={companyId === c.id}
                onClick={() => setCompanyId(companyId === c.id ? null : c.id)}
              >
                {c.name}
              </Chip>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
          {visible.map((a) => (
            <AlumniCard key={a.id} alumni={a} />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}

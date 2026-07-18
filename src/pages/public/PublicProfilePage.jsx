import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  Github, Linkedin, Code, ChefHat, Zap, Shield, Globe, ExternalLink, GraduationCap, FileText,
} from "lucide-react";
import { Card, Button, Avatar, Badge } from "@/components/ui";
import { Logo } from "@/components/layout/Logo";
import { publicProfileApi } from "@/api";

const LINK_META = {
  github: { label: "GitHub", icon: Github },
  linkedin: { label: "LinkedIn", icon: Linkedin },
  leetcode: { label: "LeetCode", icon: Code },
  codeforces: { label: "Codeforces", icon: Zap },
  codechef: { label: "CodeChef", icon: ChefHat },
  hackerrank: { label: "HackerRank", icon: Shield },
  website: { label: "Website", icon: Globe },
};

export default function PublicProfilePage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const collegeId = params.get("c");
  const [state, setState] = useState({ status: "loading", profile: null });

  useEffect(() => {
    let active = true;
    publicProfileApi
      .get(slug, collegeId)
      .then((res) => active && setState({ status: "ready", profile: res.profile }))
      .catch(() => active && setState({ status: "notfound", profile: null }));
    return () => {
      active = false;
    };
  }, [slug, collegeId]);

  useEffect(() => {
    if (state.profile?.name) document.title = `${state.profile.name} · Placely`;
  }, [state.profile]);

  if (state.status === "loading") {
    return <CenteredMessage title="Loading profile…" />;
  }
  if (state.status === "notfound") {
    return <CenteredMessage title="Profile not found" subtitle="This profile is private or does not exist." />;
  }

  const p = state.profile;
  const links = Object.entries(p.socialLinks || {}).filter(([, v]) => v);

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Logo />
        <Link to="/login">
          <Button variant="secondary" size="sm">Sign in</Button>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <Card elevated>
          <Card.Body className="flex items-center gap-5">
            <Avatar name={p.name} src={p.avatar} size="xl" color="var(--accent)" />
            <div className="flex-1">
              <h1 className="font-display italic text-3xl text-ink">{p.name}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {p.branch && <Badge tone="neutral" size="sm">{p.branch}</Badge>}
                {p.graduationYear && (
                  <span className="text-xs text-ink-3 flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5" /> Class of {p.graduationYear}
                  </span>
                )}
                {p.isAlumni && <Badge tone="accent" size="sm">Alumni</Badge>}
              </div>
            </div>
          </Card.Body>
        </Card>

        {links.length > 0 && (
          <Card>
            <Card.Header><h2 className="font-semibold text-ink">Links</h2></Card.Header>
            <Card.Body className="flex flex-wrap gap-2">
              {links.map(([key, url]) => {
                const meta = LINK_META[key] || { label: key, icon: Globe };
                return (
                  <a key={key} href={url} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="sm" leftIcon={meta.icon} rightIcon={ExternalLink}>
                      {meta.label}
                    </Button>
                  </a>
                );
              })}
            </Card.Body>
          </Card>
        )}

        {p.skills?.length > 0 && (
          <Card>
            <Card.Header><h2 className="font-semibold text-ink">Skills</h2></Card.Header>
            <Card.Body className="flex flex-wrap gap-1.5">
              {p.skills.map((s) => <Badge key={s} tone="neutral" size="md">{s}</Badge>)}
            </Card.Body>
          </Card>
        )}

        {p.projects?.length > 0 && (
          <Card>
            <Card.Header><h2 className="font-semibold text-ink">Projects</h2></Card.Header>
            <div className="divide-y divide-border">
              {p.projects.map((proj, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-ink">{proj.title}</h3>
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-strong">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  {proj.description && <p className="text-sm text-ink-2 mt-1">{proj.description}</p>}
                  {proj.tech?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {proj.tech.map((t) => <Badge key={t} tone="neutral" size="sm">{t}</Badge>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {p.resumeUrl && (
          <a href={p.resumeUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" leftIcon={FileText}>View résumé</Button>
          </a>
        )}
      </main>
    </div>
  );
}

function CenteredMessage({ title, subtitle }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 text-center">
      <Logo size="lg" />
      <h1 className="display-heading text-2xl text-ink mt-6">{title}</h1>
      {subtitle && <p className="text-sm text-ink-2 mt-2">{subtitle}</p>}
      <Link to="/login" className="mt-6">
        <Button variant="secondary">Go to Placely</Button>
      </Link>
    </div>
  );
}

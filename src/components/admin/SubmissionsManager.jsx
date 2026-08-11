import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ExternalLink, Loader2, RefreshCw, Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { SUBMISSION_SOURCES, sourceById } from '@/lib/submissionSources';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 25;

function displayDate(value) {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en', {
    year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(date);
}

function displayAddress(value) {
  if (!value || typeof value !== 'object') return value || '—';
  return [value.line1, value.line2, value.city, value.state, value.zip, value.country].filter(Boolean).join(', ') || '—';
}

function displayValue(value, type) {
  if (type === 'date') return displayDate(value);
  if (type === 'address') return displayAddress(value);
  if (type === 'boolean') return value ? 'Yes' : 'No';
  if (type === 'list') return Array.isArray(value) ? value.join(', ') || '—' : value || '—';
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function FieldValue({ field, value }) {
  const rendered = displayValue(value, field.type);
  if (field.type === 'email' && value) {
    return <a className="break-all font-semibold text-[#A93226] underline" href={`mailto:${value}`}>{rendered}</a>;
  }
  if (field.type === 'phone' && value) {
    return <a className="font-semibold text-[#A93226] underline" href={`tel:${value}`}>{rendered}</a>;
  }
  if (field.type === 'url' && value) {
    const href = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    return (
      <a className="inline-flex max-w-full items-center gap-1 break-all font-semibold text-[#A93226] underline" href={href} target="_blank" rel="noreferrer">
        {rendered}<ExternalLink className="h-3.5 w-3.5 flex-none" />
      </a>
    );
  }
  if (field.type === 'status' && value) {
    return <Badge variant="outline" className="rounded-none border-[#8B8174] bg-[#F4F2ED] capitalize">{rendered}</Badge>;
  }
  if (field.type === 'boolean') {
    return <Badge variant="outline" className="rounded-none border-[#8B8174] bg-[#F4F2ED]">{rendered}</Badge>;
  }
  return <span className={field.type === 'long' ? 'whitespace-pre-wrap leading-6' : 'break-words'}>{rendered}</span>;
}

function firstValue(record, keys) {
  return keys.map((key) => record[key]).find((value) => value !== null && value !== undefined && value !== '') || 'Untitled submission';
}

async function fetchSubmissionPage(source, page) {
  const start = page * PAGE_SIZE;
  const { data, error, count } = await supabase
    .from(source.table)
    .select('*', { count: 'exact' })
    .order(source.timestamp, { ascending: false })
    .range(start, start + PAGE_SIZE - 1);
  if (error) throw error;
  return { rows: data || [], total: count || 0 };
}

async function fetchSubmissionCounts() {
  const entries = await Promise.all(SUBMISSION_SOURCES.map(async (source) => {
    const { count, error } = await supabase.from(source.table).select('*', { count: 'exact', head: true });
    return [source.id, error ? null : (count || 0)];
  }));
  return Object.fromEntries(entries);
}

export default function SubmissionsManager() {
  const [sourceId, setSourceId] = useState(SUBMISSION_SOURCES[0].id);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const source = sourceById(sourceId);

  const countsQuery = useQuery({ queryKey: ['submission-counts'], queryFn: fetchSubmissionCounts });
  const submissionsQuery = useQuery({
    queryKey: ['submissions', source.id, page],
    queryFn: () => fetchSubmissionPage(source, page),
    placeholderData: (previous) => previous,
  });

  const rows = submissionsQuery.data?.rows || [];
  const total = submissionsQuery.data?.total || 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => source.fields.some(({ key }) => displayValue(row[key], 'text').toLowerCase().includes(term)));
  }, [rows, search, source]);

  const chooseSource = (nextId) => {
    setSourceId(nextId);
    setPage(0);
    setSearch('');
  };

  const refresh = async () => {
    await Promise.all([submissionsQuery.refetch(), countsQuery.refetch()]);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-black text-[#111111]">Website submissions</h2>
          <p className="mt-1 text-sm text-[#666666]">Admin-only review of every form stored by the Risk Takers website.</p>
        </div>
        <Button onClick={refresh} disabled={submissionsQuery.isFetching} variant="outline" className="rounded-none border-2 border-[#1F1F1F] font-bold">
          <RefreshCw className={`mr-2 h-4 w-4 ${submissionsQuery.isFetching ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4" role="tablist" aria-label="Submission sources">
        {SUBMISSION_SOURCES.map((item) => {
          const selected = item.id === source.id;
          const count = countsQuery.data?.[item.id];
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => chooseSource(item.id)}
              className={`border-2 p-3 text-left transition-colors ${selected ? 'border-[#1F1F1F] bg-[#F1C40F] text-[#111111]' : 'border-[#D4D0C8] bg-white hover:border-[#1F1F1F]'}`}
            >
              <span className="block text-xs font-black uppercase tracking-wide">{item.shortLabel}</span>
              <span className="mt-1 block text-sm text-[#5E584F]">{count === null || count === undefined ? '—' : `${count} total`}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col justify-between gap-3 border-y-2 border-[#1F1F1F] py-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-xl font-black">{source.label}</h3>
          <p className="text-sm text-[#666666]">{total} total · newest first</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this page" className="rounded-none border-2 border-[#1F1F1F] pl-9" />
        </div>
      </div>

      {submissionsQuery.isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#666666]" /></div>
      ) : submissionsQuery.isError ? (
        <Card className="rounded-none border-2 border-[#C0392B] bg-[#FFF4F2]">
          <CardContent className="p-5 text-[#8E2B20]">
            <p className="font-black">Could not load {source.label.toLowerCase()}.</p>
            <p className="mt-1 text-sm">{submissionsQuery.error?.message || 'Check the admin read policy and try again.'}</p>
          </CardContent>
        </Card>
      ) : filteredRows.length === 0 ? (
        <Card className="rounded-none border-2 border-[#D4D0C8]"><CardContent className="p-10 text-center text-[#666666]">No matching submissions.</CardContent></Card>
      ) : (
        <div className="space-y-4" role="tabpanel">
          {filteredRows.map((record) => (
            <article key={`${source.table}-${record.id || record.email_normalized}`} className="border-2 border-[#1F1F1F] bg-white shadow-[5px_5px_0_#1F1F1F]">
              <header className="flex flex-col justify-between gap-2 border-b-2 border-[#1F1F1F] bg-[#F4F2ED] p-4 sm:flex-row sm:items-start">
                <div>
                  <h4 className="text-lg font-black text-[#111111]">{firstValue(record, source.headline)}</h4>
                  <p className="mt-1 text-sm text-[#666666]">{source.subhead.map((key) => record[key]).filter(Boolean).join(' · ') || source.label}</p>
                </div>
                <time className="text-xs font-bold uppercase tracking-wide text-[#6D665B]">{displayDate(record[source.timestamp])}</time>
              </header>
              <div className="grid gap-x-6 gap-y-4 p-4 md:grid-cols-2">
                {source.fields.map((field) => (
                  <div key={field.key} className={field.type === 'long' || field.type === 'address' ? 'md:col-span-2' : ''}>
                    <dt className="text-xs font-black uppercase tracking-wide text-[#716A61]">{field.label}</dt>
                    <dd className="mt-1 text-sm text-[#222222]"><FieldValue field={field} value={record[field.key]} /></dd>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t-2 border-[#1F1F1F] pt-4">
        <Button variant="outline" className="rounded-none border-2 border-[#1F1F1F]" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        <span className="text-sm font-bold">Page {page + 1} of {pageCount}</span>
        <Button variant="outline" className="rounded-none border-2 border-[#1F1F1F]" disabled={page + 1 >= pageCount} onClick={() => setPage((current) => current + 1)}>
          Next <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}

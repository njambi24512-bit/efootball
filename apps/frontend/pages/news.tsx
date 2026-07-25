import { useEffect, useState } from 'react';
import { Newspaper } from 'lucide-react';
import { API_BASE_URL } from '../lib/api';

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  category: string;
  sourceUrl: string;
  publishedAt: string;
};

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/news`)
      .then((response) => response.json())
      .then((data) => setNews(Array.isArray(data.items) ? data.items : []))
      .catch(() => setNews([]));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-pitch-lighter bg-pitch-light p-6">
        <h1 className="font-display text-3xl tracking-wide">News</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-card">Recent updates from the backend news feed.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {news.length === 0 ? (
          <div className="rounded-lg border border-pitch-lighter bg-pitch-light p-5 text-sm text-slate-card md:col-span-2">
            No news items yet. Publish one from the backend and it will appear here.
          </div>
        ) : (
          news.map((item) => (
            <article key={item.id} className="rounded-lg border border-pitch-lighter bg-pitch-light p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider2 text-turf">
                <Newspaper size={14} />
                {item.category}
              </div>
              <h2 className="mt-3 font-display text-2xl tracking-wide">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-card">{item.summary}</p>
              <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-semibold text-floodlight hover:underline">
                Read source
              </a>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

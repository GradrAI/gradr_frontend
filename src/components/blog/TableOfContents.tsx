import React, { useEffect, useState } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  body: any[];
}

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const TableOfContents: React.FC<TableOfContentsProps> = ({ body }) => {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const extractedHeadings: TOCItem[] = [];
    body.forEach((block: any) => {
      if (block._type === 'block' && ['h2', 'h3'].includes(block.style)) {
        const text = block.children.map((child: any) => child.text).join('');
        extractedHeadings.push({
          id: slugify(text),
          text,
          level: parseInt(block.style.replace('h', '')),
        });
      }
    });
    setHeadings(extractedHeadings);
  }, [body]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto hidden lg:block w-64 shrink-0">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
        Table of Contents
      </p>
      <ul className="space-y-4">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 2) * 1.5}rem` }}
          >
            <a
              href={`#${heading.id}`}
              className={`block text-sm transition-all duration-200 border-l-2 pl-4 -ml-[2px] ${
                activeId === heading.id
                  ? 'text-primary border-primary font-bold'
                  : 'text-slate-500 border-transparent hover:text-slate-900 border-slate-200'
              }`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: 'smooth',
                });
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;

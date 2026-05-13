import React from "react";
import { PortableText, PortableTextComponents } from "@portabletext/react";
import { urlFor } from "../../lib/sanity/image";

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const renderPortableTextValue = (value: any) => {
  if (!value) return null;
  if (Array.isArray(value)) {
    return (
      <PortableText
        value={value}
        components={components as PortableTextComponents}
      />
    );
  }
  if (value._type === "block" || Array.isArray(value.children)) {
    return (
      <PortableText
        value={[value]}
        components={components as PortableTextComponents}
      />
    );
  }
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return String(value?.text ?? "");
};

const renderTableCell = (cell: any) => {
  if (cell == null) return null;
  if (typeof cell === "string" || typeof cell === "number") return cell;
  if (Array.isArray(cell)) return renderPortableTextValue(cell);
  if (cell._type === "block" || Array.isArray(cell.children))
    return renderPortableTextValue(cell);
  if (cell.content) return renderPortableTextValue(cell.content);
  return String(cell?.text ?? "");
};

const components: PortableTextComponents = {
  types: {
    image: ({ value }: any) => {
      return (
        <figure className="my-8 overflow-hidden rounded-xl border border-slate-200">
          <img
            src={urlFor(value).width(1200).url()}
            alt={value.alt || ""}
            className="w-full h-auto object-cover"
          />
          {value.caption && (
            <figcaption className="text-center text-sm text-slate-500 mt-2 italic px-4 pb-4">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    code: ({ value }: any) => {
      return (
        <div className="my-6 relative rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shadow-lg">
          {value.language && (
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {value.language}
              </span>
            </div>
          )}
          <pre className="p-4 overflow-x-auto">
            <code className="text-sm font-mono text-slate-200 leading-relaxed">
              {value.code}
            </code>
          </pre>
        </div>
      );
    },
    table: ({ value }: any) => {
      const rows = Array.isArray(value?.rows) ? value.rows : [];
      const hasHeader = Boolean(value?.hasHeader);
      const headerRow = hasHeader ? rows[0] : null;
      const bodyRows = hasHeader ? rows.slice(1) : rows;

      const hasColumnHeaders =
        Array.isArray(value?.columns) && value.columns.length > 0;

      return (
        <div className="my-10 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full border-collapse text-left">
            {headerRow || hasColumnHeaders ? (
              <thead className="bg-slate-50">
                <tr>
                  {(headerRow?.cells || value?.columns || []).map(
                    (cell: any, idx: number) => (
                      <th
                        key={idx}
                        className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                      >
                        {headerRow?.cells
                          ? renderTableCell(cell)
                          : renderTableCell(cell?.title ?? cell)}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
            ) : null}
            <tbody>
              {bodyRows.map((row: any, rowIndex: number) => (
                <tr
                  key={row._key || rowIndex}
                  className={rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  {(row?.cells || []).map((cell: any, cellIndex: number) => (
                    <td
                      key={cell._key || cellIndex}
                      className="border-b border-slate-200 px-4 py-3 align-top text-sm text-slate-700"
                    >
                      {renderTableCell(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
  },
  block: {
    h2: ({ children }: any) => {
      const id = slugify(String(children));
      return (
        <h2
          id={id}
          className="text-3xl font-bold text-slate-900 mt-12 mb-6 font-fraunces scroll-mt-24"
        >
          {children}
        </h2>
      );
    },
    h3: ({ children }: any) => {
      const id = slugify(String(children));
      return (
        <h3
          id={id}
          className="text-2xl font-bold text-slate-900 mt-8 mb-4 font-fraunces scroll-mt-24"
        >
          {children}
        </h3>
      );
    },
    normal: ({ children }: any) => (
      <p className="text-lg text-slate-700 leading-relaxed mb-6 font-dm-sans">
        {children}
      </p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary bg-slate-50 pl-6 py-6 pr-6 my-8 italic rounded-r-lg">
        <p className="text-xl text-slate-800 font-medium leading-relaxed">
          {children}
        </p>
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }: any) => {
      const rel = !value.href.startsWith("/")
        ? "noopener noreferrer"
        : undefined;
      const target = !value.href.startsWith("/") ? "_blank" : undefined;
      return (
        <a
          href={value.href}
          rel={rel}
          target={target}
          className="text-primary hover:underline font-semibold decoration-2 underline-offset-4"
        >
          {children}
        </a>
      );
    },
    code: ({ children }: any) => (
      <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-200">
        {children}
      </code>
    ),
    strong: ({ children }: any) => (
      <strong className="font-bold text-slate-900">{children}</strong>
    ),
  },
};

export default components;

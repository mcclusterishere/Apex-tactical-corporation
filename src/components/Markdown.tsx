import type { ReactNode } from "react";

/**
 * A small, dependency-free Markdown renderer for guidance text and the doctrine
 * documents.
 *
 * Deliberately not a full CommonMark implementation. It handles the constructs
 * actually used in this repository — headings, paragraphs, lists, blockquotes,
 * fenced and inline code, tables, rules, bold, italic, and links — and treats
 * everything else as text.
 *
 * The reason to hand-roll rather than pull in a parser: this renders documents
 * that state the Kingdom's legal position, and raw HTML must never pass through
 * to the page. Nothing here emits `dangerouslySetInnerHTML`, so a document that
 * contains markup renders it as visible text instead of executing it. That
 * property is worth more than complete Markdown coverage.
 */

type Inline = ReactNode;

/**
 * Permit only link targets that cannot execute.
 *
 * React escapes element content, so injected markup renders as visible text.
 * It does NOT sanitise the `href` attribute, so `[text](javascript:...)` would
 * otherwise produce a working script link. Everything here is authored in-repo,
 * which makes this unlikely rather than impossible — and "unlikely" is not the
 * standard for a page that states the Kingdom's legal position.
 */
function safeHref(href: string): string | null {
  const trimmed = href.trim();
  // Relative and fragment links are always fine.
  if (/^([./#?]|$)/.test(trimmed)) return trimmed;
  // Strip control characters and whitespace before testing the scheme;
  // an embedded tab or newline is the classic way past a naive prefix check.
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(trimmed.replace(/[\u0000-\u0020]/g, ""));
  if (!scheme) return trimmed; // no scheme at all — a bare path
  return ["http", "https", "mailto"].includes(scheme[1].toLowerCase()) ? trimmed : null;
}

function renderInline(text: string, keyPrefix: string): Inline[] {
  const nodes: Inline[] = [];
  // Ordered by precedence: code first so its contents are not further parsed.
  const pattern =
    /(`[^`]+`)|(\*\*[^*]+\*\*)|(__[^_]+__)|(\*[^*\n]+\*)|(_[^_\n]+_)|(\[[^\]]+\]\([^)\s]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    const key = `${keyPrefix}-i${index++}`;

    if (token.startsWith("`")) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**") || token.startsWith("__")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("[")) {
      const split = token.indexOf("](");
      const label = token.slice(1, split);
      const href = safeHref(token.slice(split + 2, -1));
      if (href === null) {
        // A target that could execute is dropped, and the label survives as
        // plain text so the reader still sees what the document said.
        nodes.push(<span key={key}>{label}</span>);
      } else {
        const external = /^https?:\/\//i.test(href);
        nodes.push(
          <a
            key={key}
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
          >
            {label}
          </a>,
        );
      }
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function parseTableRow(line: string): string[] {
  return line
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;
  let key = 0;

  while (index < lines.length) {
    const line = lines[index];

    // Fenced code
    if (/^\s*```/.test(line)) {
      const fence = line.trim().slice(3).trim();
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !/^\s*```/.test(lines[index])) {
        body.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(
        <pre key={`b${key++}`}>
          <code data-lang={fence || undefined}>{body.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    // Headings
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const content = renderInline(heading[2].trim(), `h${key}`);
      const Tag = (`h${Math.min(level, 6)}` as unknown) as "h1";
      blocks.push(<Tag key={`b${key++}`}>{content}</Tag>);
      index += 1;
      continue;
    }

    // Horizontal rule
    if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(line)) {
      blocks.push(<hr key={`b${key++}`} />);
      index += 1;
      continue;
    }

    // Table: a header row followed by a delimiter row
    if (/^\s*\|/.test(line) && index + 1 < lines.length && /^\s*\|?[\s:-]*-[\s|:-]*$/.test(lines[index + 1])) {
      const header = parseTableRow(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && /^\s*\|/.test(lines[index])) {
        rows.push(parseTableRow(lines[index]));
        index += 1;
      }
      blocks.push(
        <div key={`b${key++}`} className="scroll-x">
          <table>
            <thead>
              <tr>
                {header.map((cell, cellIndex) => (
                  <th key={cellIndex}>{renderInline(cell, `th${key}-${cellIndex}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{renderInline(cell, `td${key}-${rowIndex}-${cellIndex}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Blockquote
    if (/^\s*>\s?/.test(line)) {
      const body: string[] = [];
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        body.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }
      blocks.push(
        <blockquote key={`b${key++}`}>{renderInline(body.join(" "), `q${key}`)}</blockquote>,
      );
      continue;
    }

    // Lists, including one level of nesting
    const listMatch = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(line);
    if (listMatch) {
      const ordered = /\d/.test(listMatch[2]);
      const items: { indent: number; text: string }[] = [];
      while (index < lines.length) {
        const candidate = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(lines[index]);
        if (!candidate) {
          // A wrapped continuation line belongs to the preceding item.
          if (items.length > 0 && /^\s+\S/.test(lines[index]) && lines[index].trim() !== "") {
            items[items.length - 1].text += ` ${lines[index].trim()}`;
            index += 1;
            continue;
          }
          break;
        }
        items.push({ indent: candidate[1].length, text: candidate[3] });
        index += 1;
      }

      const baseIndent = Math.min(...items.map((item) => item.indent));
      const rendered: ReactNode[] = [];
      let pending: string[] = [];

      const flushNested = () => {
        if (pending.length === 0) return;
        rendered.push(
          <ul key={`n${rendered.length}`}>
            {pending.map((text, nestedIndex) => (
              <li key={nestedIndex}>{renderInline(text, `ln${key}-${nestedIndex}`)}</li>
            ))}
          </ul>,
        );
        pending = [];
      };

      for (const item of items) {
        if (item.indent > baseIndent) {
          pending.push(item.text);
          continue;
        }
        flushNested();
        rendered.push(
          <li key={`l${rendered.length}`}>{renderInline(item.text, `li${key}-${rendered.length}`)}</li>,
        );
      }
      flushNested();

      const ListTag = ordered ? "ol" : "ul";
      blocks.push(<ListTag key={`b${key++}`}>{rendered}</ListTag>);
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      index += 1;
      continue;
    }

    // Paragraph: gather until a blank line or the start of another block
    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() !== "" &&
      !/^(#{1,6})\s/.test(lines[index]) &&
      !/^\s*```/.test(lines[index]) &&
      !/^\s*>/.test(lines[index]) &&
      !/^(\s*)([-*+]|\d+[.)])\s+/.test(lines[index]) &&
      !/^\s*\|/.test(lines[index])
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    if (paragraph.length > 0) {
      blocks.push(<p key={`b${key++}`}>{renderInline(paragraph.join(" "), `p${key}`)}</p>);
    }
  }

  return <div className="prose-doc">{blocks}</div>;
}

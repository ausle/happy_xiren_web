import { Marked } from "marked";
import sanitizeHtml from "sanitize-html";

const marked = new Marked({
  async: false,
  breaks: true,
  gfm: true,
});

export function renderArticleContent(content?: string | null) {
  const source = content?.trim();
  if (!source) {
    return "";
  }

  try {
    const rendered = marked.parse(source) as string;
    return sanitizeArticleHtml(rendered);
  } catch {
    // Fall back to escaped plain content if Markdown parsing fails unexpectedly.
    return sanitizeArticleHtml(source);
  }
}

function sanitizeArticleHtml(html: string) {
  let headingIndex = 0;
  const transformHeading = (tagName: string, attribs: Record<string, string>) => {
    const id = attribs.id || `article-heading-${headingIndex}`;
    headingIndex += 1;
    return {
      tagName,
      attribs: {
        ...attribs,
        id,
      },
    };
  };

  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "img",
      "pre",
      "code",
      "hr",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ]),
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "srcset", "alt", "title"],
      "*": ["class", "id"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "nofollow noopener noreferrer",
        target: "_blank",
      }),
      h1: transformHeading,
      h2: transformHeading,
      h3: transformHeading,
      h4: transformHeading,
      h5: transformHeading,
      h6: transformHeading,
    },
  });
}

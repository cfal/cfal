import { readFile } from "node:fs/promises";

// The card layout and Octicon paths are adapted from github-readme-stats.
// See scripts/vendor/LICENSE.github-readme-stats.
const BOOK_ICON =
  '<path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>';
const STAR_ICON =
  '<path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"/>';
const FORK_ICON =
  '<path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/>';

const THEMES = {
  light: {
    title: "#2f80ed",
    icon: "#586069",
    text: "#434d58",
    background: "#fffefe",
    border: "#e4e2e2",
  },
  dark: {
    title: "#fff",
    icon: "#79ff97",
    text: "#9f9f9f",
    background: "#151515",
    border: "#e4e2e2",
  },
};

// Vendored from GitHub Linguist via github-readme-stats. See the vendor licenses.
const languageColors = JSON.parse(
  await readFile(new URL("./language-colors.json", import.meta.url), "utf8"),
);

function escapeXml(value) {
  const entities = {
    "&": "&#38;",
    "<": "&#60;",
    ">": "&#62;",
    '"': "&#34;",
    "'": "&#39;",
  };

  return String(value).replace(/[^\x20-\x7e]|[&<>"']/gu, (character) => {
    return entities[character] ?? `&#${character.codePointAt(0)};`;
  });
}

function formatCount(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  if (Math.abs(number) < 1000) return String(number);
  return `${Number((number / 1000).toFixed(1))}k`;
}

function textWidth(value, fontSize = 12) {
  const widths = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0.2796875, 0.2765625, 0.3546875, 0.5546875,
    0.5546875, 0.8890625, 0.665625, 0.190625, 0.3328125, 0.3328125,
    0.3890625, 0.5828125, 0.2765625, 0.3328125, 0.2765625, 0.3015625,
    0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875,
    0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.2765625, 0.2765625,
    0.584375, 0.5828125, 0.584375, 0.5546875, 1.0140625, 0.665625,
    0.665625, 0.721875, 0.721875, 0.665625, 0.609375, 0.7765625, 0.721875,
    0.2765625, 0.5, 0.665625, 0.5546875, 0.8328125, 0.721875, 0.7765625,
    0.665625, 0.7765625, 0.721875, 0.665625, 0.609375, 0.721875, 0.665625,
    0.94375, 0.665625, 0.665625, 0.609375, 0.2765625, 0.3546875,
    0.2765625, 0.4765625, 0.5546875, 0.3328125, 0.5546875, 0.5546875, 0.5,
    0.5546875, 0.5546875, 0.2765625, 0.5546875, 0.5546875, 0.221875,
    0.240625, 0.5, 0.221875, 0.8328125, 0.5546875, 0.5546875, 0.5546875,
    0.5546875, 0.3328125, 0.5, 0.2765625, 0.5546875, 0.5, 0.721875, 0.5,
    0.5, 0.5, 0.3546875, 0.259375, 0.353125, 0.5890625,
  ];
  const averageWidth = 0.5279276315789471;
  return (
    Array.from(String(value))
      .map((character) => {
        return widths[character.codePointAt(0)] ?? averageWidth;
      })
      .reduce((sum, width) => sum + width, 0) * fontSize
  );
}

function splitLongWord(word, width) {
  const characters = Array.from(word);
  const chunks = [];
  for (let index = 0; index < characters.length; index += width) {
    chunks.push(characters.slice(index, index + width).join(""));
  }
  return chunks;
}

function wrapDescription(value, width = 59, maxLines = 3) {
  const words = String(value || "No description provided")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .flatMap((word) =>
      Array.from(word).length > width ? splitLongWord(word, width) : [word],
    );

  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (Array.from(candidate).length <= width) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = word;
  }
  if (line) lines.push(line);

  const wasTruncated = lines.length > maxLines;
  const visible = lines.slice(0, maxLines);
  if (wasTruncated) {
    const lastIndex = visible.length - 1;
    const last = Array.from(visible[lastIndex]);
    visible[lastIndex] = `${last.slice(0, width - 3).join("").trimEnd()}...`;
  }
  return visible;
}

function iconWithLabel(icon, label, testId, x) {
  return `
    <g transform="translate(${x}, 0)">
      <svg class="icon" y="-12" viewBox="0 0 16 16" width="16" height="16">
        ${icon}
      </svg>
      <text data-testid="${testId}" class="gray" x="20">${escapeXml(label)}</text>
    </g>`;
}

function renderBadge(label, textColor) {
  return `
    <g class="badge" transform="translate(332, 37)">
      <rect stroke="${textColor}" width="62" height="20" x="-6" y="-14" ry="10" rx="10"/>
      <text x="25" y="-4" text-anchor="middle" fill="${textColor}">${label}</text>
    </g>`;
}

function assertRepo(repo) {
  if (
    !repo ||
    typeof repo.name !== "string" ||
    typeof repo.description !== "string" && repo.description !== null ||
    typeof repo.stargazers_count !== "number" ||
    typeof repo.forks_count !== "number"
  ) {
    throw new Error("GitHub returned an unexpected repository payload");
  }
}

function renderRepoCard(repo, { theme = "light" } = {}) {
  assertRepo(repo);
  const colors = THEMES[theme];
  if (!colors) throw new Error(`Unknown card theme: ${theme}`);

  const title =
    repo.name.length > 35 ? `${repo.name.slice(0, 35)}...` : repo.name;
  const descriptionLines = wrapDescription(repo.description);
  const description = descriptionLines
    .map(
      (line, index) =>
        `<tspan x="25" dy="${index === 0 ? 0 : "1.2em"}">${escapeXml(line)}</tspan>`,
    )
    .join("");

  let statsX = 0;
  let language = "";
  if (repo.language) {
    const color = languageColors[repo.language] || "#858585";
    language = `
      <g data-testid="primary-lang">
        <circle data-testid="lang-color" cx="${statsX}" cy="-5" r="6" fill="${color}"/>
        <text data-testid="lang-name" class="gray" x="${statsX + 15}">${escapeXml(repo.language)}</text>
      </g>`;
    statsX += textWidth(repo.language) + 25;
  }

  const stars = formatCount(repo.stargazers_count);
  const star = iconWithLabel(STAR_ICON, stars, "stargazers", statsX);
  statsX += 16 + textWidth(stars) + 25;

  const forks =
    repo.forks_count > 0
      ? iconWithLabel(
          FORK_ICON,
          formatCount(repo.forks_count),
          "forkcount",
          statsX,
        )
      : "";

  const badge = repo.is_template
    ? renderBadge("Template", colors.text)
    : repo.archived
      ? renderBadge("Archived", colors.text)
      : "";

  return `<svg
  width="400"
  height="150"
  viewBox="0 0 400 150"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-labelledby="titleId descId"
>
  <title id="titleId">${escapeXml(repo.name)}</title>
  <desc id="descId">${escapeXml(repo.description || "No description provided")}</desc>
  <style>
    .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${colors.title}; }
    .description { font: 400 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${colors.text}; }
    .gray { font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${colors.text}; }
    .icon { fill: ${colors.icon}; }
    .badge { font: 600 11px 'Segoe UI', Ubuntu, Sans-Serif; }
    .badge rect { opacity: 0.2; }
  </style>
  <rect data-testid="card-bg" x="0.5" y="0.5" rx="4.5" height="149" width="399"
    stroke="${colors.border}" fill="${colors.background}"/>
  <g data-testid="card-title">
    <svg class="icon" x="25" y="22" viewBox="0 0 16 16" width="16" height="16">
      ${BOOK_ICON}
    </svg>
    <text class="header" data-testid="header" x="50" y="35">${escapeXml(title)}</text>
  </g>
  ${badge}
  <text class="description" x="25" y="66">${description}</text>
  <g data-testid="repo-stats" transform="translate(30, 130)">
    ${language}
    ${star}
    ${forks}
  </g>
</svg>
`.replace(/[ \t]+$/gm, "");
}

function renderErrorCard(message, { theme = "light" } = {}) {
  const colors = THEMES[theme] || THEMES.light;
  const detail = Array.from(String(message)).slice(0, 52).join("");
  return `<svg
  width="400"
  height="150"
  viewBox="0 0 400 150"
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-labelledby="titleId descId"
  data-testid="generation-error"
>
  <title id="titleId">Card generation failed</title>
  <desc id="descId">${escapeXml(detail)}</desc>
  <style>
    .title { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${colors.title}; }
    .detail { font: 400 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${colors.text}; }
  </style>
  <rect x="0.5" y="0.5" rx="4.5" height="149" width="399"
    stroke="${colors.border}" fill="${colors.background}"/>
  <text class="title" x="25" y="58">Card generation failed</text>
  <text class="detail" x="25" y="84">${escapeXml(detail)}</text>
  <text class="detail" x="25" y="108">Check the Update README cards workflow.</text>
</svg>
`.replace(/[ \t]+$/gm, "");
}

export { escapeXml, renderErrorCard, renderRepoCard, wrapDescription };

import assert from "node:assert/strict";
import test from "node:test";
import {
  escapeXml,
  renderErrorCard,
  renderRepoCard,
  wrapDescription,
} from "./render-repo-card.mjs";

const repo = {
  name: "example",
  description: "An example with <XML> & other special characters.",
  language: "Rust",
  stargazers_count: 1234,
  forks_count: 12,
  archived: false,
  is_template: false,
};

test("renders a complete light repository card", () => {
  const svg = renderRepoCard(repo);
  assert.match(svg, /data-testid="card-bg"/);
  assert.match(svg, /data-testid="stargazers"[^>]*>1\.2k</);
  assert.match(svg, /data-testid="forkcount"[^>]*>12</);
  assert.match(svg, /fill="#dea584"/);
  assert.match(svg, /transform="translate\(49\.6375, 0\)"/);
  assert.match(svg, /&#60;XML&#62; &#38; other/);
  assert.doesNotMatch(svg, /Something went wrong/);
});

test("matches the original language-aware stats positions", () => {
  const positions = new Map([
    ["C", "33.6625"],
    ["Rust", "49.6375"],
    ["JavaScript", "80.93125"],
  ]);

  for (const [language, position] of positions) {
    const svg = renderRepoCard({ ...repo, language });
    assert.match(svg, new RegExp(`translate\\(${position}, 0\\)`));
  }
});

test("renders the dark theme and omits zero forks", () => {
  const svg = renderRepoCard({ ...repo, forks_count: 0 }, { theme: "dark" });
  assert.match(svg, /fill="#151515"/);
  assert.doesNotMatch(svg, /data-testid="forkcount"/);
});

test("wraps and truncates long descriptions", () => {
  const lines = wrapDescription("word ".repeat(100), 20, 3);
  assert.equal(lines.length, 3);
  assert.match(lines[2], /\.\.\.$/);
});

test("escapes XML and renders an identifiable failure card", () => {
  assert.equal(escapeXml("<bad & worse>"), "&#60;bad &#38; worse&#62;");
  const svg = renderErrorCard("API <failed>");
  assert.match(svg, /data-testid="generation-error"/);
  assert.match(svg, /API &#60;failed&#62;/);
});

test("rejects malformed repository data", () => {
  assert.throws(
    () => renderRepoCard({ name: "incomplete" }),
    /unexpected repository payload/,
  );
});

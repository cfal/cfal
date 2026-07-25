import assert from "node:assert/strict";
import test from "node:test";
import { renderImageLink, renderReadme } from "./render-readme.mjs";

test("keeps link whitespace outside the anchor", () => {
  const link = renderImageLink("owner", "repo", "dark");
  assert.equal(
    link,
    '<a href="https://github.com/owner/repo#gh-dark-mode-only"><img height="140" width="320" align="center" src="https://raw.githubusercontent.com/owner/owner/refs/heads/main/profile/repo-dark.svg#gh-dark-mode-only" /></a>',
  );
  assert.doesNotMatch(link, /<a[^>]*>\s+/);
  assert.doesNotMatch(link, /\s+<\/a>/);
});

test("renders both color modes for every repository", () => {
  const readme = renderReadme("owner", ["first", "second"]);
  assert.equal((readme.match(/<a /g) || []).length, 4);
  assert.match(readme, /first-dark\.svg#gh-dark-mode-only/);
  assert.match(readme, /first-light\.svg#gh-light-mode-only/);
  assert.match(readme, /second-dark\.svg#gh-dark-mode-only/);
  assert.match(readme, /second-light\.svg#gh-light-mode-only/);
});

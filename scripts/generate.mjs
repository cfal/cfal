import { writeFile, mkdir, readdir, unlink } from "node:fs/promises";
import pinApi from "github-readme-stats/api/pin.js";

const EXCLUDE_REPOS = ["awesome-rust", "emit.js", "gotron-sdk", "set-timezone"];

const owner = process.env.GITHUB_OWNER;
const token = process.env.PAT_1;

if (!owner || !token) {
  console.error("GITHUB_OWNER and PAT_1 environment variables are required");
  process.exit(1);
}

// Fetch all repos, paginating as needed
const allRepos = [];
let page = 1;
while (true) {
  const response = await fetch(
    `https://api.github.com/users/${owner}/repos?type=owner&per_page=100&page=${page}`,
    { headers: { Authorization: `token ${token}`, Accept: "application/vnd.github+json" } },
  );
  if (!response.ok) {
    console.error(`GitHub API error: ${response.status} ${await response.text()}`);
    process.exit(1);
  }
  const batch = await response.json();
  if (batch.length === 0) break;
  allRepos.push(...batch);
  page++;
}

// Top 20 by stars, excluding repos with 0 stars
const repos = allRepos
  .filter((r) => r.stargazers_count > 0 && !EXCLUDE_REPOS.includes(r.name))
  .sort((a, b) => b.stargazers_count - a.stargazers_count)
  .slice(0, 20)
  .map((r) => r.name);
console.log(`Found ${repos.length} repos: ${repos.join(", ")}`);

await mkdir("profile", { recursive: true });

// Clean up old SVGs
const existing = await readdir("profile").catch(() => []);
for (const file of existing) {
  if (file.endsWith(".svg")) {
    await unlink(`profile/${file}`);
  }
}

// Generate SVGs for each repo
for (const repo of repos) {
  for (const [suffix, theme] of [["light", undefined], ["dark", "dark"]]) {
    const query = { username: owner, repo };
    if (theme) query.theme = theme;

    let svg = "";
    const res = {
      setHeader: () => {},
      send: (value) => {
        svg = value;
        return value;
      },
    };

    await pinApi({ query }, res);
    await writeFile(`profile/${repo}-${suffix}.svg`, svg, "utf8");
    console.log(`Generated profile/${repo}-${suffix}.svg`);
  }
}

// Generate README.md
const lines = ['<p align="center">'];
for (let i = 0; i < repos.length; i++) {
  const repo = repos[i];
  lines.push(
    `<a href="https://github.com/${owner}/${repo}#gh-dark-mode-only">`,
    `  <img height=140dp width=320dp align="center" src="https://raw.githubusercontent.com/${owner}/${owner}/refs/heads/main/profile/${repo}-dark.svg#gh-dark-mode-only" />`,
    `</a>`,
    `<a href="https://github.com/${owner}/${repo}#gh-light-mode-only">`,
    `  <img height=140dp width=320dp align="center" src="https://raw.githubusercontent.com/${owner}/${owner}/refs/heads/main/profile/${repo}-light.svg#gh-light-mode-only" />`,
    `</a>`,
  );
  if (i < repos.length - 1) {
    lines.push(`<br />`);
  }
}
lines.push("</p>");

await writeFile("README.md", lines.join("\n") + "\n", "utf8");
console.log(`Generated README.md with ${repos.length} repos`);

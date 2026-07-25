import { writeFile, mkdir, readdir, unlink } from "node:fs/promises";
import { renderErrorCard, renderRepoCard } from "./render-repo-card.mjs";

const EXCLUDE_REPOS = ["awesome-rust", "emit.js", "gotron-sdk", "set-timezone"];

const owner = process.env.GITHUB_OWNER;

if (!owner) {
  console.error("GITHUB_OWNER environment variable is required");
  process.exit(1);
}

async function fetchRepos() {
  const allRepos = [];
  for (let page = 1; ; page++) {
    const response = await fetch(
      `https://api.github.com/users/${owner}/repos?type=owner&per_page=100&page=${page}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
    if (!response.ok) {
      throw new Error(`GitHub REST request failed (${response.status})`);
    }

    const batch = await response.json();
    if (!Array.isArray(batch)) {
      throw new Error("GitHub returned an unexpected repositories payload");
    }
    allRepos.push(...batch);
    if (batch.length < 100) break;
  }
  return allRepos;
}

async function writeFailureCards(error) {
  const message = error instanceof Error ? error.message : String(error);
  const existing = await readdir("profile").catch(() => []);
  const svgFiles = existing.filter((file) => file.endsWith(".svg"));
  await Promise.all(
    svgFiles.map((file) => {
      const theme = file.endsWith("-dark.svg") ? "dark" : "light";
      return writeFile(
        `profile/${file}`,
        renderErrorCard(message, { theme }),
        "utf8",
      );
    }),
  );
}

async function main() {
  const allRepos = await fetchRepos();
  const repos = allRepos
    .filter((repo) => {
      return (
        repo.stargazers_count > 0 &&
        !repo.private &&
        !EXCLUDE_REPOS.includes(repo.name)
      );
    })
    .sort((a, b) => {
      return (
        b.stargazers_count - a.stargazers_count ||
        a.name.localeCompare(b.name)
      );
    })
    .slice(0, 20);

  console.log(
    `Found ${repos.length} repos: ${repos.map((repo) => repo.name).join(", ")}`,
  );

  const cards = [];
  for (const repo of repos) {
    for (const theme of ["light", "dark"]) {
      cards.push({
        file: `profile/${repo.name}-${theme}.svg`,
        svg: renderRepoCard(repo, { theme }),
      });
    }
  }

  await mkdir("profile", { recursive: true });
  const existing = await readdir("profile").catch(() => []);
  for (const file of existing) {
    if (file.endsWith(".svg")) {
      await unlink(`profile/${file}`);
    }
  }

  for (const card of cards) {
    await writeFile(card.file, card.svg, "utf8");
    console.log(`Generated ${card.file}`);
  }

  const lines = ['<p align="center">'];
  for (const repo of repos) {
    lines.push(
      `<a href="https://github.com/${owner}/${repo.name}#gh-dark-mode-only">`,
      `  <img height=140dp width=320dp align="center" src="https://raw.githubusercontent.com/${owner}/${owner}/refs/heads/main/profile/${repo.name}-dark.svg#gh-dark-mode-only" />`,
      `</a>`,
      `<a href="https://github.com/${owner}/${repo.name}#gh-light-mode-only">`,
      `  <img height=140dp width=320dp align="center" src="https://raw.githubusercontent.com/${owner}/${owner}/refs/heads/main/profile/${repo.name}-light.svg#gh-light-mode-only" />`,
      `</a>`,
    );
  }
  lines.push("</p>");

  await writeFile("README.md", `${lines.join("\n")}\n`, "utf8");
  console.log(`Generated README.md with ${repos.length} repos`);
}

try {
  await main();
} catch (error) {
  await writeFailureCards(error);
  console.error(error);
  process.exitCode = 1;
}

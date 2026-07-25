function renderImageLink(owner, repo, theme) {
  const mode = `gh-${theme}-mode-only`;
  const href = `https://github.com/${owner}/${repo}#${mode}`;
  const src =
    `https://raw.githubusercontent.com/${owner}/${owner}/refs/heads/main/` +
    `profile/${repo}-${theme}.svg#${mode}`;
  return `<a href="${href}"><img height="140" width="320" align="center" src="${src}" /></a>`;
}

function renderReadme(owner, repos) {
  const lines = ['<p align="center">'];
  for (const repo of repos) {
    lines.push(
      renderImageLink(owner, repo, "dark"),
      renderImageLink(owner, repo, "light"),
    );
  }
  lines.push("</p>");
  return `${lines.join("\n")}\n`;
}

export { renderImageLink, renderReadme };

const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// CONFIG
const USER = "Cody-Kao";
const REPO = "Cody-Kao.github.io-comment";
const TOKEN = process.env.GITHUB_TOKEN || "";
const OUTPUT = path.join(__dirname, "source/_data/gitalk_issues.json");

const headers = {
  Accept: "application/vnd.github+json",
  ...(TOKEN && { Authorization: `token ${TOKEN}` }),
};

async function fetchAllIssues() {
  let issues = [];
  let page = 1;
  const perPage = 100;

  console.log("📥 Fetching GitHub issues...");

  while (true) {
    const url = `https://api.github.com/repos/${USER}/${REPO}/issues?per_page=${perPage}&page=${page}`;
    const res = await axios.get(url, { headers });

    if (res.data.length === 0) break;

    issues.push(...res.data);
    process.stdout.write(".");
    page++;
  }

  console.log(`\n✅ Total issues fetched: ${issues.length}`);
  return issues;
}

function extractGitalkIssues(issues) {
  const result = {};
  for (const issue of issues) {
    console.log(issue);
    let gitalkLabel = undefined;
    if (issue.labels.length >= 2 && issue.labels[1].name.length == 32) {
      gitalkLabel = issue.labels[1];
    }
    if (!gitalkLabel) continue;

    const gitalkId = gitalkLabel.name;

    result[gitalkId] = {
      issue_number: issue.number,
      comments: issue.comments,
      likes: issue.reactions?.["+1"] || 0,
      title: issue.title,
    };
  }

  return result;
}

async function main() {
  try {
    const issues = await fetchAllIssues();
    const gitalkData = extractGitalkIssues(issues);
    console.log(gitalkData);
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, JSON.stringify(gitalkData, null, 2));

    console.log(`💾 Saved Gitalk data → ${OUTPUT}`);
    console.log(`📊 Gitalk posts: ${Object.keys(gitalkData).length}`);
  } catch (err) {
    console.error("❌ Failed:", err.message);
  }
}

main();

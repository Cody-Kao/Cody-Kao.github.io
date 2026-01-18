require("dotenv").config();

async function postLike(issueNumber, token) {
  const res = await fetch(
    `https://api.github.com/repos/Cody-Kao/Cody-Kao.github.io-comment/issues/${issueNumber}/reactions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: "+1" }),
    },
  );
  const data = await res.json();
  console.log(data);
}

const TOKEN = process.env.GITHUB_TOKEN || "";
console.log(TOKEN);
const issueNumber = "7";
postLike(issueNumber, TOKEN);

async function fetch_post_likes() {
  const res = await fetch(
    "https://api.github.com/repos/Cody-Kao/Cody-Kao.github.io-comment/issues?labels=Gitalk,3b808d70f9722aab2a2e998fe462b964",
    {
      headers: {
        Accept: "application/vnd.github+json",
      },
    },
  );
  const data = await res.json();
  const issue = data.find((i) =>
    i.labels.some((l) => l.name.startsWith("Gitalk")),
  );
  const likes = issue?.reactions?.["+1"] ?? 0; // only the thumbs-up
  console.log(likes);
  return likes;
}
fetch_post_likes();

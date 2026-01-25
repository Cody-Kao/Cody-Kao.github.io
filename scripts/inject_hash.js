// scripts/inject_hash.js
const crypto = require("crypto");

// we use post.path here, but the gitalk uses url encoded path from window.location.pathname
// so we need to convert the plain post.path to url encoded version
hexo.extend.filter.register("before_post_render", function (post) {
  // 1. Build the raw pathname (Unicode)
  let pathname = post.path;

  pathname = pathname.replace(/\/+/g, "/");

  if (!pathname.startsWith("/")) pathname = "/" + pathname;
  if (!pathname.endsWith("/")) pathname += "/";

  // 2. Encode EXACTLY like browser location.pathname
  const encodedPathname = encodeURI(pathname);

  // 3. Hash the encoded pathname
  const hash = crypto.createHash("md5").update(encodedPathname).digest("hex");

  post.gitalk_md5_hash = hash;
  post.gitalk_pathname = encodedPathname; // checking that we generate the correct tag id

  return post;
});

// scripts/inject_hash.js
const crypto = require("crypto");

hexo.extend.filter.register("before_post_render", function (data) {
  // 1. Determine the string to hash
  // If you set a custom 'gitalk_id' in front-matter, use that.
  // Otherwise, use the path (and add a leading slash to match location.pathname)
  const strToHash = data.gitalk_id || "/" + data.path;

  // 2. Calculate MD5
  const hash = crypto.createHash("md5").update(strToHash).digest("hex");

  // 3. Inject it into the post object so templates can use it
  data.gitalk_md5_hash = hash;

  return data;
});

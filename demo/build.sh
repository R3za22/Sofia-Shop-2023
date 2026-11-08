#!/usr/bin/env bash
# Static demo build -> dist-demo/ (served under /demos/sofia-shop/; all paths are relative).
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist-demo && mkdir dist-demo
cp -r *.html styles.css index.js src images fonts vendor dist-demo/
cp demo/banner.js dist-demo/demo-banner.js
# The original code calls a public course API once; the data is already inline, so skip the request.
sed -i "s#await fetch(allProductsUrl).catch((err) => console.log(err));#{ ok: true };#" dist-demo/src/fetchProducts.js
sed -i -e "s#^const allProductsUrl = .*#const allProductsUrl = ''#" -e "s#'https://course-api.com[^']*'#''#" -e "/course-api.com/d" dist-demo/src/utils.js
sed -i 's|href="https://eitaa.com/[^"]*"|href="#"|' dist-demo/about.html
# licence headers contain URLs; the licences ship in the repo, not in the public bundle
perl -0pi -e 's#^/\*!.*?\*/##s' dist-demo/vendor/fontawesome/css/all.min.css
rm -f dist-demo/vendor/fontawesome/LICENSE.txt dist-demo/vendor/fonts/*.txt
grep -q "ok: true" dist-demo/src/fetchProducts.js
for f in dist-demo/*.html; do
  sed -i 's#</body>#<script src="demo-banner.js"></script></body>#' "$f"
done
echo "built dist-demo/"

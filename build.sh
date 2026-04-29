BRAIN_ID=b1b07596-f2ff-4887-b2f9-2114ea72a4ff
ROOT_THOUGHT_ID=12839155-f98a-46b5-8647-4f13ff80c560

(mkdir -p build)
(cp example/custom.css build/custom.css)
(cp example/tailwind.css build/tailwind.css)
(node local-brain-text-outline.js "$BRAIN_ID" "$ROOT_THOUGHT_ID" > build/_brain-outline-export.txt && \
  node outline2jsx.js build/_brain-outline-export.txt "Films, Animated" > build/data.jsx && \
  bray -s ~/Documents/dev/jfu/brain-gal/build/*.jsx ~/Documents/dev/jfu/brain-gal/example/*.jsx > ~/Documents/dev/jfu/brain-gal/build/index.html)

(mkdir -p build)
(cp example/custom.css build/custom.css)
(cp example/tailwind.css build/tailwind.css)
(node outline2jsx.js ~/Downloads/_brain-outline-export.txt "Films, Animated" > build/data.jsx)
# (node outline2jsx.js ~/Downloads/_brain-outline-export.txt "Films, Animated, Anime/Japanese" > build/data.jsx)
(cd ../bray/bin && ./bray ../../brain-gal/build/*.jsx ../../brain-gal/example/*.jsx > ~/Documents/dev/jfu/brain-gal/build/index.html)

# Setup

```bash
sudo apt install default-jre
npm i
npm run bootstrap
```

# Build

```bash
npm run build
```

# Publish

* Build: `npm run build`
* Test: `npm run dry-run` and `git status`
* Login: `npm login`
* Publish:

```bash
# ensure logged in
npm login

# prepare packages, and likely failed publish via lerna@2
./node_modules/lerna/bin/lerna publish   # tags via lerna@2

# real publish using lerna@4+
npm i -g lerna
lerna publish  # if does nothing, try: lerna publish from-package
```

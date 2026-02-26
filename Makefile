NPM = npm
NPX = npx
CODE = code
INSTALL = install
UNZIP = unzip
MKDIR = mkdir
JQ = jq

all: webview vscode vscode-test webview-test vscode-package

webview: .always
	cd webview && $(NPM) ci
	cd webview && $(NPM) run lint
	cd webview && $(NPM) run build

vscode: .always
	cd vscode && $(NPM) ci
	cd vscode && $(NPM) run lint
	cd vscode && $(NPM) run build
	$(INSTALL) -m 0664 README.markdown build/vscode/README.markdown
	$(INSTALL) -m 0664 screenshot.png build/vscode/screenshot.png
	$(INSTALL) -m 0664 LICENSE build/vscode/LICENSE
	$(INSTALL) -m 0664 build/webview/index.html build/vscode/index.html
	$(INSTALL) -m 0664 vscode/logo.png build/vscode/logo.png
	$(INSTALL) -m 0664 vscode/package.json build/vscode/package.json
	$(JQ) '.main = "./extension.js"' vscode/package.json > build/vscode/package.json
	$(INSTALL) -m 0664 vscode/package-lock.json build/vscode/package-lock.json

webview-test: .always
	ln -sf $(PWD)/test/vscode/node_modules test/webview/node_modules
	cd test/webview && $(NPX) tsc -p ./
	cd test/webview && $(NPX) mocha --ui tdd '../../build/test/webview/test/webview/**/*.test.js'

vscode-test: .always
	cd test/vscode && $(NPM) ci
	cd test/vscode && $(NPM) test

vscode-package: .always
	$(MKDIR) -p build/dist
	cd build/vscode && $(NPM) ci
	cd build/vscode && $(NPX) --yes vsce package --out ../dist/sourcemeta-studio-vscode.vsix
	$(UNZIP) -l build/dist/*.vsix

vscode-open: vscode
	$(CODE) --extensionDevelopmentPath="$(PWD)/vscode"

.always:

# Callback v3 without the duplicate race

This version keeps the unlimited-parallel callback flow from the third-edition
callback v3, but applies the fourth-edition duplicate-race fix.

The `spidering` set records a URL before any filesystem or network operation
starts. If two pages discover the same URL concurrently, only the first call
checks the cache or downloads it. Later calls complete through
`process.nextTick()` so the callback remains consistently asynchronous.

The fourth-edition example also modernizes other parts of the crawler. It uses
`fetch()` behind a callback adapter, `htmlparser2` for link extraction,
`mkdirp`, slug-based filenames, same-host link filtering, and support for
non-HTML resources. Those changes are recorded here but intentionally excluded
from this snapshot so the duplicate-race fix can be compared directly with the
2020 third-edition implementation.

Source: [Node.js Design Patterns, Fourth Edition, web-spider-v3-no-race](https://github.com/PacktPublishing/Node.js-Design-Patterns-Fourth-Edition/tree/main/04-asynchronous-control-flow-patterns-with-callbacks/08-web-spider-v3-no-race)

## Run

Start the local practice site:

```bash
npm run manual-site
```

Clear its downloaded files, then run:

```bash
node --import tsx edition-4-notes/callbacks-v3-no-race/spider-cli.ts http://127.0.0.1:8080 2
```

Both `child-a.html` and `child-b.html` link to `shared.html`, but the download
log should contain only one request for the shared page.

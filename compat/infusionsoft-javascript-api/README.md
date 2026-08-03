# infusionsoft-javascript-api

This package has moved to [`keap-xmlrpc`](https://www.npmjs.com/package/keap-xmlrpc).

Version 0.3.2 is a compatibility alias which re-exports `keap-xmlrpc`, so
existing applications continue to load. Migrate by installing `keap-xmlrpc`
directly and changing imports from:

```javascript
require('infusionsoft-javascript-api')
```

to:

```javascript
require('keap-xmlrpc')
```

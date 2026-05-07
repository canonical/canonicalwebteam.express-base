# @canonical/express-middlewares

This package exports several middlewares that can be used in a Node.js/Express application to perform
several functionalities. The package is modularized so only the specific middlewares needed are imported.

## security

For security related headers you can import `@canonical/express-middlewares/security`.

The exported functions set some sane defaults for security. You can use them like this:

```ts
```

If there's any default that needs overwriting for a specific project need then you can use each of the different
functions that adapt to your needs and customize those that don't. Example:

```ts
```

## caching

## endpoints

## Not included

The following features are not included as middlewares because there are other packages that implement them:
- Serve static files
- Compression

There are some examples in express-base functions to bootstrap expressjs applications on how to use these tools.

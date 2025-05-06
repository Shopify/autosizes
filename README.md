# sizes="auto" Polyfill

A polyfill for the `sizes="auto"` attribute on images, which automatically calculates the appropriate image size based on the image's display width.

## What it does

This polyfill enables the `sizes="auto"` attribute for images in browsers that don't natively support it (currently only Chromium 126+ supports it natively). When used with `loading="lazy"`, it:

1. Prevents images from loading until layout kicks in
2. Calculates the image's display width
3. Sets the `sizes` value based on the display width
4. Unblocks image loading, so that the browser picks the right image

## How it works

The polyfill uses mutation observers to detect newly added HTMLImageElement elements with `loading=lazy` and `sizes=auto` attributes.

It then removes any `src` and `srcset` attributes from those images, ensuring that they won't start loading images.

Once First-Contentful-Paint is fired, which we use as a proxy to indicate that layout was calculated:
* `sizes` attribute value gets overridden by the image's `getBoundingClientRect` pixel size.
* The attributes get written back as `src` and `srcset`, so that the image can load.

Images that are changed or added after FCP fires get their `sizes` attribute rewritten without removing their `src` and `srcset`.

The polyfill backs off if the browser is too old to support FCP, or if it supports `sizes=auto` natively.
Unfortunately, the latter information is only available through User-Agent sniffing.

## Testing

The project includes automated tests using Playwright that verify the polyfill works correctly in different browsers:

```bash
# Install dependencies
npm install

# Install browsers
npx playwright install firefox webkit

# Run tests
npx playwright test
```

## Minification

`npm run minify`

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

See [LICENSE.md](./LICENSE.md)

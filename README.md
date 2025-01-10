# lygia-loader

A build-time resolver for the [Lygia](https://lygia.xyz/) shader library that handles GLSL includes for esbuild.

## Features

- Resolves Lygia includes at build time
- Caches downloaded files locally
- Supports local file includes with recursive resolution
- Built for esbuild
- Live reload support for development

## Installation

```bash
npm install lygia-loader
```

## Usage

Add to your esbuild configuration:

```javascript
import lygiaPlugin from 'lygia-loader/plugin';

export default {
  plugins: [lygiaPlugin()],
  loader: {
    '.glsl': 'text',
  }
}
```

For development with live reload:

```javascript
import liveReload from 'esbuild-live-reload';

export default {
  plugins: [
    lygiaPlugin(),
    liveReload(['src/**/*', 'shaders/**/*'])
  ]
}
```

## Using in Shaders

You can include both Lygia modules and local files in your shaders:

```glsl
// Include from Lygia
#include "lygia/math/const.glsl"
#include "lygia/space/ratio.glsl"

// Include local files
#include "./local/utils.glsl"
```

## License

MIT

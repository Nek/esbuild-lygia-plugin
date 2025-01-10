# lygia-loader

A build-time resolver for the [Lygia](https://lygia.xyz/) shader library that handles GLSL includes. Supports both esbuild and webpack.

## Features

- Resolves Lygia includes at build time
- Caches downloaded files locally
- Supports local file includes with recursive resolution
- Works with esbuild and webpack-based bundlers
- Live reload support for development

## Installation

```bash
npm install lygia-loader
```

## Usage with esbuild

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

## Usage with webpack

Add to your webpack configuration:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: [
          'raw-loader',
          'lygia-loader'
        ]
      }
    ]
  }
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

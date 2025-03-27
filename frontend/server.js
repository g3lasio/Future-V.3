const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('../webpack.config.js');

const app = express();
const DIST_DIR = path.join(__dirname, '../dist');
const HTML_FILE = path.join(DIST_DIR, 'index.html');
const compiler = webpack(config);

// Middleware para servir archivos estáticos
app.use(express.static(DIST_DIR));

if (process.env.NODE_ENV === 'development') {
  // Configuración para desarrollo
  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: config.output.publicPath,
    })
  );
  app.use(webpackHotMiddleware(compiler));
} else {
  // Configuración para producción
  app.get('*', (req, res) => {
    res.sendFile(HTML_FILE);
  });
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

const apimock = require('@ng-apimock/core');
const devInterface = require('@ng-apimock/dev-interface');
const express = require('express');
const app = express();

const appName = process.argv[2];
if (!appName) throw 'Provide a name of an app you want to start mocks for!';

app.set('port', 9999);

apimock.processor.process({
  src: 'mock-server/mocks',
  patterns: {
    mocks: 'shared/**/*.json',
    presets: '**/*.preset.json',
  },
  watch: true,
});

apimock.processor.process({
  src: 'mock-server/mocks',
  patterns: {
    mocks: `${appName}/**/*.json`,
    presets: '**/*.preset.json',
  },
  watch: true,
});

app.use(apimock.middleware);
app.use('/dev-interface', express.static(devInterface));

app.listen(app.get('port'), () => {
  console.log('@ng-apimock/core running on port', app.get('port'));
  console.log('@ng-apimock/dev-interface is available under /dev-interface');
});

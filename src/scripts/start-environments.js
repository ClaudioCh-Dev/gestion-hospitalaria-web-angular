const { writeFileSync, mkdirSync } = require('fs');

require('dotenv').config();

const environmentsPath = './src/environments';

const productionUrl = process.env.API_URL;

if (!productionUrl) {
  throw new Error('API_URL not found in .env file');
}

const createEnvironment = ({ useMocks, baseUrl }) => `
export const environment = {
  useMocks: ${useMocks},

  api: {
    baseUrl: '${baseUrl}',
  }
};
`;

const environments = {
  'environment.ts': createEnvironment({
    useMocks: true,
    baseUrl: 'http://localhost:4040',
  }),

  'environment.development.ts': createEnvironment({
    useMocks: false,
    baseUrl: 'http://localhost:4040',
  }),

  'environment.mock.ts': createEnvironment({
    useMocks: true,
    baseUrl: 'http://localhost:4040',
  }),

  'environment.prod.ts': createEnvironment({
    useMocks: false,
    baseUrl: productionUrl,
  }),
};

mkdirSync(environmentsPath, { recursive: true });

for (const [fileName, content] of Object.entries(environments)) {
  writeFileSync(`${environmentsPath}/${fileName}`, content);
}

console.log('Environment files created successfully');
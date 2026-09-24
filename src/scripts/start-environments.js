const { writeFileSync, mkdirSync } = require('fs');

require('dotenv').config();

const environmentsPath = './src/environments';

const productionUrl = process.env.API_URL;
const productionAuthUrl = process.env.AUTH_URL;

if (!productionUrl) {
  throw new Error('API_URL not found in .env file');
}

if (!productionAuthUrl) {
  throw new Error('AUTH_URL not found in .env file');
}

const localBaseUrl = 'http://localhost:4040';
const localAuthUrl = 'http://localhost:3000/auth-server';

const createEnvironment = ({ useMocks, baseUrl, authUrl }) => `
export const environment = {
  useMocks: ${useMocks},

  api: {
    baseUrl: '${baseUrl}',
    authUrl: '${authUrl}',
  }
};
`;

const environments = {
  'environment.ts': createEnvironment({
    useMocks: true,
    baseUrl: localBaseUrl,
    authUrl: localAuthUrl,
  }),

  'environment.dev.ts': createEnvironment({
    useMocks: false,
    baseUrl: localBaseUrl,
    authUrl: localAuthUrl,
  }),

  'environment.mock.ts': createEnvironment({
    useMocks: true,
    baseUrl: localBaseUrl,
    authUrl: localAuthUrl,
  }),

  'environment.prod.ts': createEnvironment({
    useMocks: false,
    baseUrl: productionUrl,
    authUrl: productionAuthUrl,
  }),
};

mkdirSync(environmentsPath, { recursive: true });

for (const [fileName, content] of Object.entries(environments)) {
  writeFileSync(`${environmentsPath}/${fileName}`, content);
}

console.log('Environment files created successfully');
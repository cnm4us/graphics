import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env, logEnvSummary } from './config/env.js';
import { characterAppearanceConfig } from './config/characterAppearance/index.js';
import { styleDefinitionConfig } from './config/styleDefinitions/index.js';
import { logGeminiStatus } from './ai/googleClient.js';
import { logS3Status } from './storage/s3Client.js';
import { initDb } from './db/index.js';
import { authRouter } from './auth/routes.js';
import { spacesRouter } from './spaces/routes.js';
import { charactersRouter } from './characters/routes.js';
import { stylesRouter } from './styles/routes.js';
import { imagesRouter } from './images/routes.js';
import { scenesRouter } from './scenes/routes.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

const port = env.port;

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'graphics-backend',
    nodeVersion: process.version,
  });
});

app.get('/api/character-appearance-config', (_req, res) => {
  res.status(200).json(characterAppearanceConfig);
});

app.get('/api/style-definition-config', (_req, res) => {
  res.status(200).json(styleDefinitionConfig);
});

app.use('/api/auth', authRouter);
app.use('/api/spaces', spacesRouter);
app.use('/api/spaces/:spaceId/characters', charactersRouter);
app.use('/api/spaces/:spaceId/styles', stylesRouter);
app.use('/api/spaces/:spaceId/scenes', scenesRouter);
app.use('/api/images', imagesRouter);

const startServer = async (): Promise<void> => {
  logEnvSummary();
  logGeminiStatus();
  logS3Status();

  await initDb();

  app.listen(port, () => {
    // Intentionally avoid logging any secrets from process.env
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}`);
  });
};

void startServer();

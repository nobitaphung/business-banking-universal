import fs from 'fs';
import { join } from 'path';

export const readFile = <T>(path: string | undefined): T => {
  if (!path) {
    throw new Error('Failed to read config file, since path to the file provided was "undefined"');
  }
  const configContents = fs.readFileSync(path, 'utf-8');
  return JSON.parse(configContents) as T;
};

export const getStorageStatePathForUser = (username: string): string => {
  return join(__dirname, `../../out/state-${username}.json`);
};

export const isReloginRequired = async (path: string | undefined) => {
  const sessionRefreshThresholdSeconds = 10;
  if (!path) {
    throw new Error('Failed to read session storage file, since path to the file provided was "undefined"');
  }

  if (!fs.existsSync(path)) {
    return true;
  }

  const existingSessionFile = readFile(path);
  const localStorage = existingSessionFile.origins[0].localStorage;
  const expirationTime = +localStorage.find((nameValuePair) => nameValuePair.name === 'expires_at').value;
  const ttl = (expirationTime - Date.now()) / 1000;

  if (ttl < sessionRefreshThresholdSeconds) {
    console.log('recommending to re-login to the app');
  }
  return ttl < sessionRefreshThresholdSeconds;
};

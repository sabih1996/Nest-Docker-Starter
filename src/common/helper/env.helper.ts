import { existsSync } from 'fs';
import { resolve } from 'path';

export function getEnvPath(dest: string): string {
  const env: string | undefined = process.env.NODE_ENV;
  const fallback: string = resolve(`${dest}/.env`);
  let filename = '';
  if (env == 'production') {
    filename = 'production.env';
  } else if (env == 'qa') {
    filename = 'qa.env';
  } else {
    filename = 'development.env';
  }
  let filePath: string = resolve(`${dest}/${filename}`);
  if (!existsSync(filePath)) {
    filePath = fallback;
  }

  return filePath;
}

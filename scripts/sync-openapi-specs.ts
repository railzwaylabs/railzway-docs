import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { apiSpecifications } from '../src/lib/openapi-specs';

const sourceRoot = '../railzwayapis/gen/openapiv2';
const targetRoot = './openapi';

async function main() {
  await mkdir(targetRoot, { recursive: true });

  await Promise.all(
    apiSpecifications.map(async ({ source, filename, title, description }) => {
      const specification = JSON.parse(
        await readFile(`${sourceRoot}/${source}`, 'utf8'),
      ) as { info?: Record<string, unknown> };

      specification.info = {
        ...specification.info,
        title,
        description,
      };

      await writeFile(
        `${targetRoot}/${filename}`,
        `${JSON.stringify(specification, null, 2)}\n`,
      );
    }),
  );
}

void main();

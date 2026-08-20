import { generateFiles } from 'fumadocs-openapi';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { apiSpecifications } from '../src/lib/openapi-specs';

const sourceRoot = '../railzwayapis/gen/openapiv2';
const targetRoot = './openapi';

function normalizeErrorResponses(specification: Record<string, any>) {
  const response = {
    description: "An error response using Fare's stable HTTP error envelope.",
    content: { 'application/json': { schema: { $ref: '#/components/schemas/railzway.api.ErrorResponse' } } },
  };
  for (const pathItem of Object.values(specification.paths ?? {}) as Record<string, any>[]) {
    for (const operation of Object.values(pathItem ?? {}) as Record<string, any>[]) {
      if (operation?.responses) operation.responses.default = response;
    }
  }
  specification.components ??= {};
  specification.components.schemas ??= {};
  delete specification.components.schemas['google.rpc.Status'];
  Object.assign(specification.components.schemas, {
    'railzway.api.ErrorDetail': { type: 'object', properties: { field: { type: 'string' }, rule: { type: 'string' }, message: { type: 'string' } }, required: ['field', 'rule', 'message'] },
    'railzway.api.Error': { type: 'object', properties: { code: { type: 'string', example: 'INVALID_ARGUMENT' }, message: { type: 'string' }, details: { type: 'array', items: { $ref: '#/components/schemas/railzway.api.ErrorDetail' } } }, required: ['code', 'message', 'details'] },
    'railzway.api.ErrorResponse': { type: 'object', properties: { error: { $ref: '#/components/schemas/railzway.api.Error' } }, required: ['error'] },
  });
}

function normalizePublicPaths(specification: Record<string, any>) {
  const normalized: Record<string, any> = {};
  for (const [path, pathItem] of Object.entries(specification.paths ?? {}) as [string, Record<string, any>][]) {
    if (path === '/v1/organizations') continue;
    const match = path.match(/^\/v1\/organizations\/\{([^}]+)\}(.*)$/);
    if (!match) {
      normalized[path] = pathItem;
      continue;
    }
    const [, organizationParameter, suffix] = match;
    const publicPath = suffix === '' ? '/v1/organization' : `/v1${suffix}`;
    for (const operation of Object.values(pathItem)) {
      if (operation && typeof operation === 'object' && Array.isArray(operation.parameters)) {
        operation.parameters = operation.parameters.filter(
          (parameter: { in?: string; name?: string }) =>
            !(parameter.in === 'path' && parameter.name === organizationParameter),
        );
      }
    }
    normalized[publicPath] = { ...(normalized[publicPath] ?? {}), ...pathItem };
  }
  specification.paths = normalized;
}

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

      normalizeErrorResponses(specification);
      normalizePublicPaths(specification);

      await writeFile(
        `${targetRoot}/${filename}`,
        `${JSON.stringify(specification, null, 2)}\n`,
      );
    }),
  );

  const { openapi } = await import('../src/lib/openapi');

  await generateFiles({
    input: openapi,
    output: './content/docs/api-reference/generated',
    per: 'file',
    includeDescription: true,
    addGeneratedComment: 'Generated from railzwayapis. Do not edit by hand.',
  });
}

void main();

import { createOpenAPI } from 'fumadocs-openapi/server';
import { apiSpecifications } from './openapi-specs';

export const openapiInputs = apiSpecifications.map(
  ({ filename }) => `./openapi/${filename}`,
);

export const openapi = createOpenAPI({
  input: openapiInputs,
});

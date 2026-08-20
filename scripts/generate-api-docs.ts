import { generateFiles } from 'fumadocs-openapi';
import { openapi } from '../src/lib/openapi';

void generateFiles({
  input: openapi,
  output: './content/docs/api-reference/generated',
  per: 'file',
  includeDescription: true,
  addGeneratedComment: 'Generated from railzwayapis. Do not edit by hand.',
});

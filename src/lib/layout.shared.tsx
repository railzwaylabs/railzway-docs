import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { gitConfig } from './shared';
import { BrandLockup } from '@/components/brand-lockup';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <BrandLockup />,
      url: '/',
      transparentMode: 'top',
    },
    links: [
      {
        text: 'API Reference',
        url: '/api-reference',
        active: 'nested-url',
      },
      {
        text: 'Railzway.com',
        url: 'https://railzway.com',
        external: true,
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}

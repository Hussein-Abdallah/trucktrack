import { setFlushStyles } from '@gluestack-ui/utils/nativewind-utils';

import { config } from './config';

export function buildAndFlushCss(): string {
  let cssVariablesWithMode = '';
  Object.keys(config).forEach((configKey) => {
    cssVariablesWithMode += configKey === 'dark' ? '\n .dark {\n ' : '\n:root {\n';
    const cssVariables = Object.keys(config[configKey as keyof typeof config]).reduce(
      (acc: string, curr: string) => {
        acc += `${curr}:${config[configKey as keyof typeof config][curr]}; `;
        return acc;
      },
      '',
    );
    cssVariablesWithMode += `${cssVariables} \n}`;
  });

  setFlushStyles(cssVariablesWithMode);
  return cssVariablesWithMode;
}

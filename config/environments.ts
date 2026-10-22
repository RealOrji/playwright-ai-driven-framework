export interface EnvironmentConfig {
  baseUrl: string;
}

// SauceDemo exposes a single public URL; replace these with your real environment URLs.
export const environments = {
  dev: { baseUrl: 'https://www.saucedemo.com' },
  staging: { baseUrl: 'https://www.saucedemo.com' },
  prod: { baseUrl: 'https://www.saucedemo.com' },
} as const satisfies Record<string, EnvironmentConfig>;

export type Environment = keyof typeof environments;

export const DEFAULT_ENVIRONMENT: Environment = 'dev';

const isEnvironment = (name: string): name is Environment => Object.hasOwn(environments, name);

export const resolveEnvironment = (name: string = DEFAULT_ENVIRONMENT) => {
  if (!isEnvironment(name)) {
    const available = Object.keys(environments).join(', ');
    throw new Error(`Unknown environment "${name}". Available: ${available}`);
  }
  return { name, ...environments[name] };
};

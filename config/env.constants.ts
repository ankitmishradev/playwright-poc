export const DEFAULT_ENV = 'sit';

export const SUPPORTED_ENVS = ['sit', 'uat', 'dev'] as const;
export type Environment = (typeof SUPPORTED_ENVS)[number];

export const SUPPORTED_PROJECTS = ['chromium', 'firefox', 'webkit'] as const;
export type Project = (typeof SUPPORTED_PROJECTS)[number];

interface EnvironmentVariables {
  readonly PORT: string
  readonly NODE_ENV: 'development' | 'production'
  readonly ENVIRONMENT: 'development' | 'production'

  readonly EXPO_PUBLIC_SERVER_DOMAIN: string

  readonly IOS_APP_ID: string
}

declare namespace NodeJS {
  interface ProcessEnv extends EnvironmentVariables {}
}

declare namespace Bun {
  interface Env extends EnvironmentVariables {}
}

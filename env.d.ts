interface EnvironmentVariables {
  readonly PORT: string
  readonly NODE_ENV: 'development' | 'production'
  readonly ENVIRONMENT: 'development' | 'production'

  readonly IOS_APP_ID: string

  readonly EXPO_DEBUG?: 'true' | 'false'
  readonly EXPO_PUBLIC_SERVER_DOMAIN: string
  readonly EXPO_PUBLIC_PORTO_BASE_URL: string

  readonly EXPO_TUNNEL_SUBDOMAIN: string
  readonly EXPO_PUBLIC_TUNNEL_SUBDOMAIN: string
}

declare namespace NodeJS {
  interface ProcessEnv extends EnvironmentVariables {}
}

declare namespace Bun {
  interface Env extends EnvironmentVariables {}
}

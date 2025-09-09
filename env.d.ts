interface EnvironmentVariables {
  readonly NODE_ENV: 'development' | 'production'
  readonly ENVIRONMENT: 'development' | 'production'

  readonly EXPO_PUBLIC_SERVER_DOMAIN: string

  readonly PORT: string

  readonly APP_NAME: string

  readonly EAS_PROJECT_ID: string
  readonly EAS_BUILD_PROFILE: 'development' | 'production'

  readonly IOS_APP_ID: string
  readonly IOS_PROJECT: string
  readonly IOS_BUNDLE_ID: string
  readonly IOS_DEVELOPER_PORTAL_ID: string
}

declare namespace NodeJS {
  interface ProcessEnv extends EnvironmentVariables {}
}

declare namespace Bun {
  interface Env extends EnvironmentVariables {}
}

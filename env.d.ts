interface EnvironmentVariables {
  readonly NODE_ENV: 'development' | 'production'

  readonly APP_NAME: string

  readonly EAS_PROJECT_ID: string
  readonly EAS_BUILD_PROFILE: 'development' | 'production'

  readonly IOS_APP_ID: string
  readonly IOS_PROJECT: string
  readonly IOS_BUNDLE_ID: string
  readonly IOS_DEVELOPER_PORTAL_ID: string
}

import { type ConfigPlugin, withXcodeProject } from '@expo/config-plugins'

type Props = {
  bundleIdSuffix?: string // e.g. ".debug"
  enableDebugSuffix?: boolean
}

const withIosTweaks: ConfigPlugin<Props> = (config, props = {}) => {
  const { enableDebugSuffix = true, bundleIdSuffix = '.debug' } = props

  if (!enableDebugSuffix) return config

  const baseId = config.ios?.bundleIdentifier
  if (!baseId) throw new Error('bundleIdentifier is required')

  const debugId = `${baseId}${bundleIdSuffix}`
  config = withXcodeProject(config, (props) => {
    const proj = props.modResults
    // Set PRODUCT_BUNDLE_IDENTIFIER for Debug build configuration(s)
    // Applies to all targets that have a Debug configuration
    try {
      // updateBuildProperty(prop, value, buildName)
      // buildName: 'Debug' updates all Debug configurations
      ;(proj as any).updateBuildProperty(
        'PRODUCT_BUNDLE_IDENTIFIER',
        debugId,
        'Debug',
      )
    } catch {}
    return props
  })

  return config
}

export default withIosTweaks

import { type ConfigPlugin, withXcodeProject } from '@expo/config-plugins'

type Props = {
  bundleIdSuffix?: string // e.g. ".debug"
  enableDebugSuffix?: boolean
}

const withIosTweaks: ConfigPlugin<Props> = (config, props = {}) => {
  const { enableDebugSuffix = true, bundleIdSuffix = '.debug' } = props

  const baseId = config.ios?.bundleIdentifier
  if (!baseId) throw new Error('bundleIdentifier is required')

  const targetId = enableDebugSuffix ? `${baseId}${bundleIdSuffix}` : baseId

  config = withXcodeProject(config, (props) => {
    const proj = props.modResults
    try {
      ;(proj as any).updateBuildProperty(
        'PRODUCT_BUNDLE_IDENTIFIER',
        targetId,
        'Debug',
      )
    } catch {}
    return props
  })

  return config
}

export default withIosTweaks

import {
  type ConfigPlugin,
  withAppBuildGradle,
  withGradleProperties,
} from '@expo/config-plugins'
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode'

/**
 * @see https://docs.expo.dev/config-plugins/plugins
 */

type Props = {
  jvmArgs?: string
  workersMax?: number
  enableDebugSuffix?: boolean
  versionNameSuffix?: string
  disableReleaseLint?: boolean
  enableReleaseSigning?: boolean
}

const DEFAULT_JVMARGS =
  '-Xmx4096m -XX:MaxMetaspaceSize=1024m -Dfile.encoding=UTF-8 -Dkotlin.daemon.jvm.options=-Xmx2048m'

const withAndroidPlugin: ConfigPlugin<Props> = (config, props = {}) => {
  const {
    workersMax = 2,
    enableDebugSuffix = true,
    jvmArgs = DEFAULT_JVMARGS,
    disableReleaseLint = true,
    versionNameSuffix = '-debug',
    enableReleaseSigning = true,
  } = props

  // Gradle properties (memory & workers)
  config = withGradleProperties(config, (props) => {
    const items = props.modResults
    const keep = items.filter(
      (it) =>
        !(
          it.type === 'property' &&
          (it.key === 'org.gradle.jvmargs' ||
            it.key === 'org.gradle.workers.max')
        ),
    )
    keep.push({ type: 'property', key: 'org.gradle.jvmargs', value: jvmArgs })
    if (workersMax != null) {
      keep.push({
        type: 'property',
        value: String(workersMax),
        key: 'org.gradle.workers.max',
      })
    }
    props.modResults = keep
    return props
  })

  // build.gradle edits (debug suffix + lint + release signing)
  config = withAppBuildGradle(config, (props) => {
    let src = props.modResults.contents

    // If debug suffix is disabled, proactively strip any previous suffix lines
    if (!enableDebugSuffix) {
      // Remove common lines that add a suffix to the debug variant
      src = src.replace(/^[\t ]*applicationIdSuffix\s+"\.debug"\s*\n/gm, '')
      src = src.replace(/^[\t ]*versionNameSuffix\s+"-debug"\s*\n/gm, '')
    }

    // Add lint block if requested and missing
    if (disableReleaseLint && !/\n\s*lint\s*\{/.test(src)) {
      const lint = `    lint {\n        checkReleaseBuilds false\n        abortOnError false\n    }`
      const r1 = mergeContents({
        tag: 'with-android-plugin-lint',
        src,
        newSrc: lint,
        anchor: /android\s*\{/,
        offset: 1,
        comment: '//',
      })
      if (r1.didMerge) src = r1.contents
    }

    if (enableDebugSuffix && !/applicationIdSuffix\s+"\.debug"/.test(src)) {
      const debugLines = `            applicationIdSuffix ".debug"\n            versionNameSuffix "${versionNameSuffix}"`

      const btMatch = src.match(/buildTypes\s*\{/)
      if (btMatch) {
        const bracePos = btMatch.index! + btMatch[0].length - 1
        let i = bracePos
        let depth = 1
        while (i < src.length && depth > 0) {
          i++
          const ch = src[i]
          if (ch === '{') depth++
          else if (ch === '}') depth--
        }
        const btStart = btMatch.index!
        const btEnd = i
        const btBlock = src.slice(btStart, btEnd + 1)

        const debugOpen = btBlock.match(/\bdebug\s*\{/)
        if (debugOpen) {
          const dIndex = btStart + (debugOpen.index || 0) + debugOpen[0].length
          const before = src.slice(0, dIndex)
          const after = src.slice(dIndex)
          src = `${before}\n${debugLines}\n${after}`
        } else {
          const insertPos = btStart + btMatch[0].length
          const before = src.slice(0, insertPos)
          const after = src.slice(insertPos)
          const block = `\n        debug {\n${debugLines}\n        }\n`
          src = `${before}${block}${after}`
        }
      } else {
        const full = `    buildTypes {\n        debug {\n${debugLines}\n        }\n    }`
        const rAndroid = mergeContents({
          tag: 'with-android-plugin-buildtypes',
          src,
          newSrc: full,
          anchor: /android\s*\{/,
          offset: 1,
          comment: '//',
        })
        if (rAndroid.didMerge) src = rAndroid.contents
      }
    }

    // Add release signingConfig and wire buildTypes.release to it conditionally
    if (enableReleaseSigning) {
      // 1) Ensure a release signing config exists with property-based fields
      if (!/signingConfigs\s*\{[\s\S]*?\brelease\s*\{/.test(src)) {
        const releaseSigning = `        release {\n            if (findProperty('PORTO_RELEASE_STORE_FILE')) {\n                storeFile file(findProperty('PORTO_RELEASE_STORE_FILE'))\n                storePassword findProperty('PORTO_RELEASE_STORE_PASSWORD')\n                keyAlias findProperty('PORTO_RELEASE_KEY_ALIAS')\n                keyPassword findProperty('PORTO_RELEASE_KEY_PASSWORD')\n            }\n        }`
        const rSign = mergeContents({
          tag: 'with-android-plugin-signing-release',
          src,
          newSrc: releaseSigning,
          anchor: /signingConfigs\s*\{/,
          offset: 1,
          comment: '//',
        })
        if (rSign.didMerge) src = rSign.contents
      }

      // 2) In buildTypes.release, replace signingConfig with conditional one
      const btMatch = src.match(/buildTypes\s*\{/)
      if (btMatch) {
        // Extract buildTypes block, then locate release { ... }
        const bracePos = btMatch.index! + btMatch[0].length - 1
        let i = bracePos
        let depth = 1
        while (i < src.length && depth > 0) {
          i++
          const ch = src[i]
          if (ch === '{') depth++
          else if (ch === '}') depth--
        }
        const btStart = btMatch.index!
        const btEnd = i
        const btBlock = src.slice(btStart, btEnd + 1)

        const relOpen = btBlock.match(/\brelease\s*\{/)
        if (relOpen) {
          const relStart = btStart + (relOpen.index || 0) + relOpen[0].length
          const before = src.slice(0, relStart)
          const after = src.slice(relStart)
          let relBody = after
          // Replace the first occurrence of signingConfig signingConfigs.debug inside release block only
          relBody = relBody.replace(
            /signingConfig\s+signingConfigs\.debug/,
            "signingConfig (findProperty('PORTO_RELEASE_STORE_FILE') ? signingConfigs.release : signingConfigs.debug)",
          )
          src = before + relBody
        }
      }
    }

    props.modResults.contents = src
    return props
  })

  return config
}

export default withAndroidPlugin

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
  enableDebugSuffix?: boolean
  versionNameSuffix?: string
  jvmArgs?: string
  workersMax?: number
  disableReleaseLint?: boolean
}

const DEFAULT_JVMARGS =
  '-Xmx4096m -XX:MaxMetaspaceSize=1024m -Dfile.encoding=UTF-8 -Dkotlin.daemon.jvm.options=-Xmx2048m'

const withAndroidTweaks: ConfigPlugin<Props> = (config, props = {}) => {
  const {
    enableDebugSuffix = true,
    versionNameSuffix = '-debug',
    jvmArgs = DEFAULT_JVMARGS,
    workersMax = 2,
    disableReleaseLint = true,
  } = props

  // Gradle properties (memory & workers)
  config = withGradleProperties(config, (c) => {
    const items = c.modResults
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
        key: 'org.gradle.workers.max',
        value: String(workersMax),
      })
    }
    c.modResults = keep
    return c
  })

  // build.gradle edits (debug suffix + lint)
  config = withAppBuildGradle(config, (c) => {
    let src = c.modResults.contents

    // Add lint block if requested and missing
    if (disableReleaseLint && !/\n\s*lint\s*\{/.test(src)) {
      const lint = `    lint {\n        checkReleaseBuilds false\n        abortOnError false\n    }`
      const r1 = mergeContents({
        tag: 'with-android-tweaks-lint',
        src,
        newSrc: lint,
        anchor: /android\s*\{/,
        offset: 1,
        comment: '//',
      })
      if (r1.didMerge) src = r1.contents
    }

    if (enableDebugSuffix && !/applicationIdSuffix\s+"\.debug"/.test(src)) {
      // Try to add inside existing debug block
      const lines = `            applicationIdSuffix ".debug"\n            versionNameSuffix "${versionNameSuffix}"`
      const rDebug = mergeContents({
        tag: 'with-android-tweaks-debug-suffix',
        src,
        newSrc: lines,
        anchor: /\bdebug\s*\{/,
        offset: 1,
        comment: '//',
      })
      if (rDebug.didMerge) {
        src = rDebug.contents
      } else if (/buildTypes\s*\{/.test(src)) {
        // Insert a debug block within buildTypes
        const block = `        debug {\n            applicationIdSuffix ".debug"\n            versionNameSuffix "${versionNameSuffix}"\n        }`
        const rBT = mergeContents({
          tag: 'with-android-tweaks-debug-block',
          src,
          newSrc: block,
          anchor: /buildTypes\s*\{/,
          offset: 1,
          comment: '//',
        })
        if (rBT.didMerge) src = rBT.contents
      } else {
        // Insert full buildTypes with debug under android
        const full = `    buildTypes {\n        debug {\n            applicationIdSuffix ".debug"\n            versionNameSuffix "${versionNameSuffix}"\n        }\n    }`
        const rAndroid = mergeContents({
          tag: 'with-android-tweaks-buildtypes',
          src,
          newSrc: full,
          anchor: /android\s*\{/,
          offset: 1,
          comment: '//',
        })
        if (rAndroid.didMerge) src = rAndroid.contents
      }
    }

    c.modResults.contents = src
    return c
  })

  return config
}

export default withAndroidTweaks

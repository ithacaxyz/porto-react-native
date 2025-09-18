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

  // build.gradle edits (debug suffix + lint)
  config = withAppBuildGradle(config, (props) => {
    let src = props.modResults.contents

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

    props.modResults.contents = src
    return props
  })

  return config
}

export default withAndroidPlugin

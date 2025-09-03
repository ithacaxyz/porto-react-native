import * as NYPM from 'nypm'

NYPM.dedupeDependencies({
  // dry: true,
  cwd: process.cwd(),
  packageManager: 'bun',
  recreateLockfile: true,
})
  .then((result) => {
    console.log(result)
  })
  .catch((error) => {
    console.error(error)
  })
  .finally(() => {
    process.exit(0)
  })

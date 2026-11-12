import { NavigationError } from '@angular/router'
import { reloadOnMissingChunk } from './navigation-error'

describe('reloadOnMissingChunk', () => {
  const failed = (error: unknown) => new NavigationError(1, '/project/mri', error)

  it('loads the page fresh when a page chunk is gone after a deploy', () => {
    const load = jasmine.createSpy('load')
    reloadOnMissingChunk(
      failed(new TypeError('Failed to fetch dynamically imported module: /chunk-ABC.js')),
      load
    )
    expect(load).toHaveBeenCalledWith('/project/mri')
  })

  it('leaves other navigation errors alone', () => {
    const load = jasmine.createSpy('load')
    reloadOnMissingChunk(failed(new Error('Cannot match any routes')), load)
    reloadOnMissingChunk(failed(null), load)
    expect(load).not.toHaveBeenCalled()
  })
})

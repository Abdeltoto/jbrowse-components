import type PluginManager from '../PluginManager.ts'
import type BaseResult from './BaseResults.ts'
import type TextSearchManager from './TextSearchManager.ts'
import type { SearchScope } from './TextSearchManager.ts'
import type { BaseTextSearchArgs } from '../data_adapters/BaseAdapter/index.ts'

export default class LazyTextSearchManager {
  private implPromise: Promise<TextSearchManager> | undefined

  constructor(private pluginManager: PluginManager) {}

  private getImpl() {
    if (!this.implPromise) {
      this.implPromise = import('./TextSearchManager.ts').then(
        mod => new mod.default(this.pluginManager),
      )
    }
    return this.implPromise
  }

  async clearCache() {
    if (this.implPromise) {
      const impl = await this.implPromise
      impl.clearCache()
    }
  }

  async search(
    args: BaseTextSearchArgs,
    searchScope: SearchScope,
    rankFn: (results: BaseResult[]) => BaseResult[],
  ) {
    const impl = await this.getImpl()
    return impl.search(args, searchScope, rankFn)
  }

  async search2(arg: {
    args: BaseTextSearchArgs
    searchScope: SearchScope
    rankFn: (results: BaseResult[]) => BaseResult[]
  }) {
    const impl = await this.getImpl()
    return impl.search2(arg)
  }
}

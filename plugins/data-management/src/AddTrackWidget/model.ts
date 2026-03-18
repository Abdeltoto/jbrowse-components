import { ElementId } from '@jbrowse/core/util/types/mst'
import { lazyInit, types } from '@jbrowse/mobx-state-tree'

import type { enhance } from './model.lazy.ts'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { Instance } from '@jbrowse/mobx-state-tree'

export function createBaseModel(pluginManager: PluginManager) {
  return types.model('AddTrackModel', {
    /**
     * #property
     */
    id: ElementId,
    /**
     * #property
     */
    type: types.literal('AddTrackWidget'),
    /**
     * #property
     */
    view: types.safeReference(
      pluginManager.pluggableMstType('view', 'stateModel'),
    ),
  })
}

export type AddTrackBaseModel = ReturnType<typeof createBaseModel>

/**
 * #stateModel AddTrackModel
 */
export default function f(pluginManager: PluginManager) {
  return lazyInit(
    createBaseModel(pluginManager),
    () => import('./model.lazy.ts').then(m => m.enhance),
  ) as ReturnType<typeof enhance> & { preload(): Promise<void> }
}

export type AddTrackStateModel = ReturnType<typeof f>
export type AddTrackModel = Instance<AddTrackStateModel>

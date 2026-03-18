import { ElementId } from '@jbrowse/core/util/types/mst'
import { lazyInit, types } from '@jbrowse/mobx-state-tree'

import { facetedStateTreeF } from './facetedModel.ts'

import type { enhance } from './model.lazy.ts'
import type { TreeNode } from './types.ts'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { Instance } from '@jbrowse/mobx-state-tree'

const defaultItemHeight = 22
const categoryItemHeight = 40

export function getItemHeight(item: TreeNode) {
  return item.type === 'category' ? categoryItemHeight : defaultItemHeight
}

export function createBaseModel(pluginManager: PluginManager) {
  return types.model('HierarchicalTrackSelectorWidget', {
    /**
     * #property
     */
    id: ElementId,
    /**
     * #property
     */
    type: types.literal('HierarchicalTrackSelectorWidget'),

    /**
     * #property
     */
    view: types.safeReference(
      pluginManager.pluggableMstType('view', 'stateModel'),
    ),
    /**
     * #property
     */
    faceted: types.optional(facetedStateTreeF(), {}),
  })
}

export type HierarchicalTrackSelectorBaseModel = ReturnType<
  typeof createBaseModel
>

/**
 * #stateModel HierarchicalTrackSelectorWidget
 */
export default function stateModelFactory(pluginManager: PluginManager) {
  return lazyInit(
    createBaseModel(pluginManager),
    () => import('./model.lazy.ts').then(m => m.enhance),
  ) as ReturnType<typeof enhance> & { preload(): Promise<void> }
}

export type HierarchicalTrackSelectorStateModel = ReturnType<
  typeof stateModelFactory
>
export type HierarchicalTrackSelectorModel =
  Instance<HierarchicalTrackSelectorStateModel>

import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes/models'
import { lazyInit, types } from '@jbrowse/mobx-state-tree'

import type { enhance } from './model.lazy.ts'
import type { BreakpointSplitViewInit } from './types.ts'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { Instance } from '@jbrowse/mobx-state-tree'
import type { LinearGenomeViewStateModel } from '@jbrowse/plugin-linear-genome-view'

/**
 * #stateModel BreakpointSplitView
 * extends
 * - [BaseViewModel](../baseviewmodel)
 */
export function createBaseModel(pluginManager: PluginManager) {
  return types.compose(
    'BreakpointSplitView',
    BaseViewModel,
    types.model({
      /**
       * #property
       */
      type: types.literal('BreakpointSplitView'),
      /**
       * #property
       */
      height: types.optional(types.number, 400),
      /**
       * #property
       */
      trackSelectorType: 'hierarchical',
      /**
       * #property
       */
      showIntraviewLinks: true,
      /**
       * #property
       */
      linkViews: false,
      /**
       * #property
       */
      interactiveOverlay: true,
      /**
       * #property
       */
      showHeader: false,
      /**
       * #property
       */
      views: types.array(
        pluginManager.getViewType('LinearGenomeView')!
          .stateModel as LinearGenomeViewStateModel,
      ),
      /**
       * #property
       * used for initializing the view from a session snapshot
       */
      init: types.frozen<BreakpointSplitViewInit | undefined>(),
    }),
  )
}

export type BreakpointSplitViewBaseModel = ReturnType<typeof createBaseModel>

export default function stateModelFactory(pluginManager: PluginManager) {
  return lazyInit(
    createBaseModel(pluginManager),
    () => import('./model.lazy.ts').then(m => m.enhance),
  ) as ReturnType<typeof enhance> & { preload(): Promise<void> }
}

export type BreakpointViewStateModel = ReturnType<typeof stateModelFactory>
export type BreakpointViewModel = Instance<BreakpointViewStateModel>

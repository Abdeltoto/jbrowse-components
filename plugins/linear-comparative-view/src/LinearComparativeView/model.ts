import BaseViewModel from '@jbrowse/core/pluggableElementTypes/models/BaseViewModel'
import { ElementId } from '@jbrowse/core/util/types/mst'
import { lazyInit, types } from '@jbrowse/mobx-state-tree'

import type { enhance } from './model.lazy.ts'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { Instance } from '@jbrowse/mobx-state-tree'
import type { LinearGenomeViewStateModel } from '@jbrowse/plugin-linear-genome-view'

/**
 * #stateModel LinearComparativeView
 * extends
 * - [BaseViewModel](../baseviewmodel)
 */
export function createBaseModel(pluginManager: PluginManager) {
  const LinearSyntenyViewHelper = pluginManager.getViewType(
    'LinearSyntenyViewHelper',
  )?.stateModel
  return types.compose(
    'LinearComparativeView',
    BaseViewModel,
    types.model({
      /**
       * #property
       */
      id: ElementId,
      /**
       * #property
       */
      type: types.literal('LinearComparativeView'),
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
      interactiveOverlay: false,
      /**
       * #property
       */
      scrollZoom: false,
      /**
       * #property
       */
      showDynamicControls: true,
      /**
       * #property
       */
      levels: types.array(LinearSyntenyViewHelper!),
      /**
       * #property
       * currently this is limited to an array of two
       */
      views: types.array(
        pluginManager.getViewType('LinearGenomeView')!
          .stateModel as LinearGenomeViewStateModel,
      ),

      /**
       * #property
       * this represents tracks specific to this view specifically used for
       * read vs ref dotplots where this track would not really apply
       * elsewhere
       */
      viewTrackConfigs: types.array(
        pluginManager.pluggableConfigSchemaType('track'),
      ),
    }),
  )
}

export type LinearComparativeViewBaseModel = ReturnType<typeof createBaseModel>

export function stateModelFactory(pluginManager: PluginManager) {
  return lazyInit(
    createBaseModel(pluginManager),
    () => import('./model.lazy.ts').then(m => m.enhance),
  ) as ReturnType<typeof enhance> & { preload(): Promise<void> }
}

export type LinearComparativeViewStateModel = ReturnType<
  typeof stateModelFactory
>
export type LinearComparativeViewModel =
  Instance<LinearComparativeViewStateModel>

export default stateModelFactory

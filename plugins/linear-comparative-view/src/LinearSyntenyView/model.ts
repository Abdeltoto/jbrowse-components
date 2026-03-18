import { lazyInit, types } from '@jbrowse/mobx-state-tree'

import baseModel from '../LinearComparativeView/model.ts'

import type { enhance } from './model.lazy.ts'
import type { LinearSyntenyViewInit } from './types.ts'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { Instance } from '@jbrowse/mobx-state-tree'

/**
 * #stateModel LinearSyntenyView
 * extends
 * - [LinearComparativeView](../linearcomparativeview)
 */
export function createBaseModel(pluginManager: PluginManager) {
  return types.compose(
    'LinearSyntenyView',
    baseModel(pluginManager),
    types.model({
      /**
       * #property
       */
      type: types.literal('LinearSyntenyView'),
      /**
       * #property
       */
      cigarMode: types.optional(
        types.enumeration(['off', 'matches', 'full']),
        'full',
      ),
      /**
       * #property
       */
      drawCurves: false,
      /**
       * #property
       */
      drawLocationMarkers: false,
      /**
       * #property
       * maximum number of pixels off screen before a synteny line is culled
       */
      maxOffScreenDrawPx: 300,
      /**
       * #property
       * used for initializing the view from a session snapshot
       * example:
       * ```json
       * {
       *   views: [
       *     { loc: "chr1:1-100", assembly: "hg38", tracks: ["genes"] },
       *     { loc: "chr1:1-100", assembly: "mm39" }
       *   ],
       *   tracks: ["hg38_vs_mm39_synteny"]
       * }
       * ```
       */
      init: types.frozen<LinearSyntenyViewInit | undefined>(),
    }),
  )
}

export type LinearSyntenyViewBaseModel = ReturnType<typeof createBaseModel>

export default function stateModelFactory(pluginManager: PluginManager) {
  return lazyInit(
    createBaseModel(pluginManager),
    () => import('./model.lazy.ts').then(m => m.enhance),
  ) as ReturnType<typeof enhance> & { preload(): Promise<void> }
}

export type LinearSyntenyViewStateModel = ReturnType<typeof stateModelFactory>
export type LinearSyntenyViewModel = Instance<LinearSyntenyViewStateModel>

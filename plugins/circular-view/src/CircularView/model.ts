import type React from 'react'

import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes/models'
import { lazyInit, types } from '@jbrowse/mobx-state-tree'

import type { enhance } from './model.lazy.ts'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { Region } from '@jbrowse/core/util/types'
import type { Instance } from '@jbrowse/mobx-state-tree'

export interface CircularViewInit {
  assembly: string
  tracks?: string[]
}
export interface ExportSvgOptions {
  rasterizeLayers?: boolean
  format?: 'svg' | 'png'
  filename?: string
  Wrapper?: React.FC<{ children: React.ReactNode }>
  themeName?: string
}

export const defaultOffsetRadians = -Math.PI / 2
export const defaultBpPerPx = 200
export const defaultHeight = 400
export const defaultMinimumRadiusPx = 25
export const defaultSpacingPx = 10
export const defaultPaddingPx = 80
export const defaultLockedPaddingPx = 100
export const defaultMinVisibleWidth = 6
export const defaultMinimumBlockWidth = 20

/**
 * #stateModel CircularView
 * extends
 * - [BaseViewModel](../baseviewmodel)
 */
export function createBaseModel(pluginManager: PluginManager) {
  return types.compose(
    'CircularView',
    BaseViewModel,
    types.model({
      /**
       * #property
       */
      type: types.literal('CircularView'),
      /**
       * #property
       * similar to offsetPx in linear genome view
       */
      offsetRadians: defaultOffsetRadians,
      /**
       * #property
       */
      bpPerPx: defaultBpPerPx,
      /**
       * #property
       */
      tracks: types.array(
        pluginManager.pluggableMstType('track', 'stateModel'),
      ),

      /**
       * #property
       */
      hideVerticalResizeHandle: false,
      /**
       * #property
       */
      hideTrackSelectorButton: false,
      /**
       * #property
       */
      lockedFitToWindow: true,
      /**
       * #property
       */
      disableImportForm: false,

      /**
       * #property
       */
      height: types.optional(types.number, defaultHeight),
      /*
       * #property
       */
      displayedRegions: types.optional(types.frozen<Region[]>(), []),
      /**
       * #property
       */
      scrollX: 0,
      /**
       * #property
       */
      scrollY: 0,

      /**
       * #property
       */
      minimumRadiusPx: defaultMinimumRadiusPx,
      /**
       * #property
       */
      spacingPx: defaultSpacingPx,
      /**
       * #property
       */
      paddingPx: defaultPaddingPx,
      /**
       * #property
       */
      lockedPaddingPx: defaultLockedPaddingPx,
      /**
       * #property
       */
      minVisibleWidth: defaultMinVisibleWidth,
      /**
       * #property
       */
      minimumBlockWidth: defaultMinimumBlockWidth,
      /**
       * #property
       */
      trackSelectorType: 'hierarchical',
      /**
       * #property
       * used for initializing the view from a session snapshot
       */
      init: types.frozen<CircularViewInit | undefined>(),
    }),
  )
}

export type CircularViewBaseModel = ReturnType<typeof createBaseModel>

function stateModelFactory(pluginManager: PluginManager) {
  return lazyInit(
    createBaseModel(pluginManager),
    () => import('./model.lazy.ts').then(m => m.enhance),
  ) as ReturnType<typeof enhance> & { preload(): Promise<void> }
}

export type CircularViewStateModel = ReturnType<typeof stateModelFactory>
export type CircularViewModel = Instance<CircularViewStateModel>

export default stateModelFactory

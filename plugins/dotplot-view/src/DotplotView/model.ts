import type React from 'react'

import BaseViewModel from '@jbrowse/core/pluggableElementTypes/models/BaseViewModel'
import { ElementId } from '@jbrowse/core/util/types/mst'
import { lazyInit, types } from '@jbrowse/mobx-state-tree'

import { DotplotHView, DotplotVView } from './1dview.ts'

import type { enhance } from './model.lazy.ts'
import type { DotplotViewInit } from './types.ts'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { Instance } from '@jbrowse/mobx-state-tree'

export const defaultHeight = 600
export const defaultBorderSize = 20
export const defaultTickSize = 5
export const defaultHtextRotation = -90
export const defaultFontSize = 15

export interface ExportSvgOptions {
  rasterizeLayers?: boolean
  format?: 'svg' | 'png'
  filename?: string
  Wrapper?: React.FC<{ children: React.ReactNode }>
  themeName?: string
}

/**
 * #stateModel DotplotView
 * #category view
 * extends
 * - [BaseViewModel](../baseviewmodel)
 */
export function createBaseModel(pm: PluginManager) {
  return types.compose(
    'DotplotView',
    BaseViewModel,
    types.model({
      /**
       * #property
       */
      id: ElementId,
      /**
       * #property
       */
      type: types.literal('DotplotView'),
      /**
       * #property
       */
      height: defaultHeight,
      /**
       * #property
       */
      borderSize: defaultBorderSize,
      /**
       * #property
       */
      tickSize: defaultTickSize,
      /**
       * #property
       */
      vtextRotation: 0,
      /**
       * #property
       */
      htextRotation: defaultHtextRotation,
      /**
       * #property
       */
      fontSize: defaultFontSize,
      /**
       * #property
       */
      trackSelectorType: 'hierarchical',
      /**
       * #property
       */
      assemblyNames: types.array(types.string),
      /**
       * #property
       */
      drawCigar: true,
      /**
       * #property
       */
      hview: types.optional(DotplotHView, {}),
      /**
       * #property
       */
      vview: types.optional(DotplotVView, {}),

      /**
       * #property
       */
      tracks: types.array(pm.pluggableMstType('track', 'stateModel')),

      /**
       * #property
       * this represents tracks specific to this view specifically used
       * for read vs ref dotplots where this track would not really apply
       * elsewhere
       */
      viewTrackConfigs: types.array(pm.pluggableConfigSchemaType('track')),
      /**
       * #property
       * used for initializing the view from a session snapshot
       */
      init: types.frozen<DotplotViewInit | undefined>(),
    }),
  )
}

export type DotplotViewBaseModel = ReturnType<typeof createBaseModel>

export default function stateModelFactory(pm: PluginManager) {
  return lazyInit(
    createBaseModel(pm),
    () => import('./model.lazy.ts').then(m => m.enhance),
  ) as ReturnType<typeof enhance> & { preload(): Promise<void> }
}

export type DotplotViewStateModel = ReturnType<typeof stateModelFactory>
export type DotplotViewModel = Instance<DotplotViewStateModel>

export { Dotplot1DView, type Dotplot1DViewModel } from './1dview.ts'

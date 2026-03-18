import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes/models'
import {
  localStorageGetBoolean,
  localStorageGetItem,
} from '@jbrowse/core/util'
import { ElementId } from '@jbrowse/core/util/types/mst'
import { lazyInit, types } from '@jbrowse/mobx-state-tree'

import type { enhance } from './model.lazy.ts'
import type { HighlightType, InitState } from './types.ts'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { Region } from '@jbrowse/core/util/types'
import type { Instance } from '@jbrowse/mobx-state-tree'

/**
 * #stateModel LinearGenomeView
 * #category view
 *
 * extends
 * - [BaseViewModel](../baseviewmodel)
 */
export const AUTO_FORCE_LOAD_BP = 20_000

export function createBaseModel(pluginManager: PluginManager) {
  return types.compose(
    'LinearGenomeView',
    BaseViewModel,
    types.model({
      /**
       * #property
       */
      id: ElementId,

      /**
       * #property
       * this is a string instead of the const literal 'LinearGenomeView' to
       * reduce some typescripting strictness, but you should pass the string
       * 'LinearGenomeView' to the model explicitly
       */
      type: types.literal('LinearGenomeView') as unknown as string,

      /**
       * #property
       * corresponds roughly to the horizontal scroll of the LGV
       */
      offsetPx: 0,

      /**
       * #property
       * corresponds roughly to the zoom level, base-pairs per pixel
       */
      bpPerPx: 1,

      /**
       * #property
       * currently displayed regions, can be a single chromosome, arbitrary
       * subsections, or the entire  set of chromosomes in the genome, but it not
       * advised to use the entire set of chromosomes if your assembly is very
       * fragmented
       */
      displayedRegions: types.optional(types.frozen<Region[]>(), []),

      /**
       * #property
       * array of currently displayed tracks state models instances
       */
      tracks: types.array(
        pluginManager.pluggableMstType('track', 'stateModel'),
      ),

      /**
       * #property
       */
      hideHeader: false,

      /**
       * #property
       */
      hideHeaderOverview: false,

      /**
       * #property
       */
      hideNoTracksActive: false,

      /**
       * #property
       */
      trackSelectorType: types.optional(
        types.enumeration(['hierarchical']),
        'hierarchical',
      ),
      /**
       * #property
       * show the "center line"
       */
      showCenterLine: types.optional(types.boolean, () =>
        localStorageGetBoolean('lgv-showCenterLine', false),
      ),

      /**
       * #property
       * show the "cytobands" in the overview scale bar
       */
      showCytobandsSetting: types.optional(types.boolean, () =>
        localStorageGetBoolean('lgv-showCytobands', true),
      ),

      /**
       * #property
       * how to display the track labels, can be "overlapping", "offset", or
       * "hidden", or empty string "" (which results in conf being used). see
       * LinearGenomeViewPlugin
       * https://jbrowse.org/jb2/docs/config/lineargenomeviewplugin/ docs for
       * how conf is used
       */
      trackLabels: types.optional(
        types.string,
        () => localStorageGetItem('lgv-trackLabels') || '',
      ),

      /**
       * #property
       * show the "gridlines" in the track area
       */
      showGridlines: true,

      /**
       * #property
       * highlights on the LGV from the URL parameters
       */
      highlight: types.optional(
        types.array(types.frozen<HighlightType>()),
        [],
      ),

      /**
       * #property
       * color by CDS
       */
      colorByCDS: types.optional(types.boolean, () =>
        localStorageGetBoolean('lgv-colorByCDS', false),
      ),

      /**
       * #property
       * show the track outlines
       */
      showTrackOutlines: types.optional(types.boolean, () =>
        localStorageGetBoolean('lgv-showTrackOutlines', true),
      ),

      /**
       * #property
       * enable scroll-to-zoom on WebGL tracks
       */
      scrollZoom: types.optional(types.boolean, () =>
        localStorageGetBoolean('lgv-scrollZoom', false),
      ),
      /**
       * #property
       * this is a non-serialized property that can be used for loading the
       * linear genome view via session snapshots
       * example:
       * ```json
       * {
       *   loc: "chr1:1,000,000-2,000,000"
       *   assembly: "hg19"
       *   tracks: ["genes", "variants"]
       * }
       * ```
       */
      init: types.frozen<InitState | undefined>(),
    }),
  )
}

export type LinearGenomeViewBaseModel = ReturnType<typeof createBaseModel>

export function stateModelFactory(pluginManager: PluginManager) {
  return lazyInit(
    createBaseModel(pluginManager),
    () => import('./model.lazy.ts').then(m => m.enhance),
  ) as ReturnType<typeof enhance> & { preload(): Promise<void> }
}

export type LinearGenomeViewStateModel = ReturnType<typeof stateModelFactory>
export type LinearGenomeViewModel = Instance<LinearGenomeViewStateModel>


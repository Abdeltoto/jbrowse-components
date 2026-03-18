import { ConfigurationReference } from '@jbrowse/core/configuration'
import { BaseDisplay } from '@jbrowse/core/pluggableElementTypes/models'
import { lazyInit, types } from '@jbrowse/mobx-state-tree'
import {
  MultiRegionDisplayMixin,
  TrackHeightMixin,
} from '@jbrowse/plugin-linear-genome-view'

import { ArcsSubModel } from './ArcsSubModel.ts'

import type { enhance } from './model.lazy.ts'
import type { ColorBy, FilterBy, SortedBy } from '../shared/types'
import type { AnyConfigurationSchemaType } from '@jbrowse/core/configuration'
import type { Instance } from '@jbrowse/mobx-state-tree'

// Offset for Y scalebar labels (same as wiggle plugin)
export const YSCALEBAR_LABEL_OFFSET = 5

// Insertion type classification - must match shader logic in WebGLRenderer.ts
export type InsertionType = 'large' | 'long' | 'small'

import {
  LONG_INSERTION_MIN_LENGTH,
  LONG_INSERTION_TEXT_THRESHOLD_PX,
} from './constants.ts'

/**
 * Classify an insertion based on its length and current zoom level.
 * - 'large': length >= 10bp AND wide enough to show text (>= 15px)
 * - 'long': length >= 10bp but too zoomed out for text
 * - 'small': length < 10bp
 */
export function getInsertionType(
  length: number,
  pxPerBp: number,
): InsertionType {
  const isLongInsertion = length >= LONG_INSERTION_MIN_LENGTH
  if (isLongInsertion) {
    const insertionWidthPx = length * pxPerBp
    if (insertionWidthPx >= LONG_INSERTION_TEXT_THRESHOLD_PX) {
      return 'large'
    }
    return 'long'
  }
  return 'small'
}

/**
 * Calculate the pixel width needed to display a number as text.
 * Must match the textWidthForNumber function in the insertion vertex shader.
 */
export function textWidthForNumber(num: number): number {
  const charWidth = 6
  const padding = 10
  if (num < 10) {
    return charWidth + padding
  }
  if (num < 100) {
    return charWidth * 2 + padding
  }
  if (num < 1000) {
    return charWidth * 3 + padding
  }
  if (num < 10000) {
    return charWidth * 4 + padding
  }
  return charWidth * 5 + padding
}

/**
 * Get the rectangle width in pixels for an insertion marker.
 * Must match the shader logic in WebGLRenderer.ts.
 */
export function getInsertionRectWidthPx(
  length: number,
  pxPerBp: number,
): number {
  const type = getInsertionType(length, pxPerBp)
  if (type === 'large') {
    return textWidthForNumber(length)
  }
  if (type === 'long') {
    const insertionWidthPx = length * pxPerBp
    return Math.min(5, insertionWidthPx / 3)
  }
  return Math.min(pxPerBp, 1) // thin bar, subpixel when zoomed out
}

export type { MultiRegionRegion as Region } from '@jbrowse/plugin-linear-genome-view'

export const ColorScheme = {
  normal: 0,
  strand: 1,
  mappingQuality: 2,
  insertSize: 3,
  firstOfPairStrand: 4,
  pairOrientation: 5,
  insertSizeAndOrientation: 6,
  modifications: 7,
  tag: 8,
  baseQuality: 9,
  insertSizeGradient: 10,
} as const

export function createBaseModel(configSchema: AnyConfigurationSchemaType) {
  return types.compose(
    'LinearAlignmentsDisplay',
    BaseDisplay,
    TrackHeightMixin(),
    MultiRegionDisplayMixin(),
    types.model({
      /**
       * #property
       */
      type: types.literal('LinearAlignmentsDisplay'),
      /**
       * #property
       */
      configuration: ConfigurationReference(configSchema),
      /**
       * #property
       */
      showLinkedReads: false,
      /**
       * #property
       */
      colorBySetting: types.frozen<ColorBy | undefined>(),
      /**
       * #property
       */
      filterBySetting: types.frozen<FilterBy | undefined>(),
      /**
       * #property
       */
      featureHeight: types.maybe(types.number),
      /**
       * #property
       */
      noSpacing: types.maybe(types.boolean),
      /**
       * #property
       */
      showSashimiArcs: true,
      /**
       * #property
       */
      showCoverage: true,
      /**
       * #property
       */
      coverageHeight: 45,
      /**
       * #property
       */
      showMismatches: true,
      /**
       * #property
       * Show interbase indicators (triangular markers and histogram bars for
       * insertion/softclip/hardclip events)
       */
      showInterbaseIndicators: true,
      /**
       * #property
       */
      showYScalebar: true,
      /**
       * #property
       */
      showLegend: types.maybe(types.boolean),
      /**
       * #property
       */
      drawSingletons: true,
      /**
       * #property
       */
      drawProperPairs: true,
      /**
       * #property
       */
      flipStrandLongReadChains: true,
      /**
       * #property
       */
      arcsState: types.optional(ArcsSubModel, {}),
      /**
       * #property
       */
      showArcs: false,
      /**
       * #property
       */
      arcsHeight: 100,
      /**
       * #property
       */
      showSoftClipping: false,
      /**
       * #property
       */
      showOutline: types.maybe(types.boolean),
      /**
       * #property
       */
      mismatchAlpha: types.maybe(types.boolean),
      /**
       * #property
       */
      sortedBySetting: types.frozen<SortedBy | undefined>(),
      /**
       * #property
       */
      trackMaxHeight: types.maybe(types.number),
      /**
       * #property
       * For backwards compatibility: migration from old LinearSNPCoverageDisplay
       */
      jexlFilters: types.optional(types.array(types.string), []),
    }),
  )
}

export type LinearAlignmentsDisplayBaseModel = ReturnType<
  typeof createBaseModel
>

/**
 * State model factory for LinearAlignmentsDisplay
 */
export default function stateModelFactory(
  configSchema: AnyConfigurationSchemaType,
) {
  return lazyInit(
    createBaseModel(configSchema),
    () => import('./model.lazy.ts').then(m => m.enhance),
  ) as ReturnType<typeof enhance> & { preload(): Promise<void> }
}

export type LinearAlignmentsDisplayStateModel = ReturnType<
  typeof stateModelFactory
>
export type LinearAlignmentsDisplayModel =
  Instance<LinearAlignmentsDisplayStateModel>

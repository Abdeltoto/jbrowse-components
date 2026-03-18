import { ConfigurationReference } from '@jbrowse/core/configuration'
import { BaseDisplay } from '@jbrowse/core/pluggableElementTypes'
import { lazyInit, types } from '@jbrowse/mobx-state-tree'
import {
  MultiRegionDisplayMixin,
  TrackHeightMixin,
} from '@jbrowse/plugin-linear-genome-view'

import type { enhance } from './model.lazy.ts'
import type { AnyConfigurationSchemaType } from '@jbrowse/core/configuration'
import type { Instance } from '@jbrowse/mobx-state-tree'

/**
 * #stateModel LinearHicDisplay
 * #category display
 * Hi-C display that renders contact matrix using WebGL
 * extends
 * - [BaseDisplay](../basedisplay)
 * - [TrackHeightMixin](../trackheightmixin)
 * - [MultiRegionDisplayMixin](../multiregiondisplaymixin)
 */
function x() {} // eslint-disable-line @typescript-eslint/no-unused-vars

export function createBaseModel(configSchema: AnyConfigurationSchemaType) {
  return types.compose(
    'LinearHicDisplay',
    BaseDisplay,
    TrackHeightMixin(),
    MultiRegionDisplayMixin(),
    types.model({
      /**
       * #property
       */
      type: types.literal('LinearHicDisplay'),
      /**
       * #property
       */
      configuration: ConfigurationReference(configSchema),
      /**
       * #property
       */
      resolution: types.optional(types.number, 1),
      /**
       * #property
       */
      useLogScale: false,
      /**
       * #property
       */
      colorScheme: types.maybe(types.string),
      /**
       * #property
       */
      activeNormalization: 'KR',
      /**
       * #property
       */
      mode: 'triangular',
      /**
       * #property
       */
      showLegend: types.maybe(types.boolean),
    }),
  )
}

export type LinearHicDisplayBaseModel = ReturnType<typeof createBaseModel>

export default function stateModelFactory(
  configSchema: AnyConfigurationSchemaType,
) {
  return lazyInit(
    createBaseModel(configSchema),
    () => import('./model.lazy.ts').then(m => m.enhance),
  ) as ReturnType<typeof enhance> & { preload(): Promise<void> }
}

export type LinearHicDisplayStateModel = ReturnType<typeof stateModelFactory>
export type LinearHicDisplayModel = Instance<LinearHicDisplayStateModel>

import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes/models'
import { ElementId } from '@jbrowse/core/util/types/mst'
import { lazyInit, types } from '@jbrowse/mobx-state-tree'

import type { enhance } from './model.lazy.ts'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { Instance } from '@jbrowse/mobx-state-tree'
import type { CircularViewStateModel } from '@jbrowse/plugin-circular-view'
import type { SpreadsheetViewStateModel } from '@jbrowse/plugin-spreadsheet-view'

interface SvInspectorViewInit {
  assembly: string
  uri: string
  fileType?: string
}

/**
 * #stateModel SvInspectorView
 * #category view
 * does not extend, but is a combination of a
 * - [SpreadsheetView](../spreadsheetview)
 * - [CircularView](../circularview)
 *
 * extends
 * - [BaseViewModel](../baseviewmodel)
 */

export function createBaseModel(pluginManager: PluginManager) {
  const SpreadsheetViewType = pluginManager.getViewType('SpreadsheetView')!
  const CircularViewType = pluginManager.getViewType('CircularView')!

  const SpreadsheetModel =
    SpreadsheetViewType.stateModel as SpreadsheetViewStateModel
  const CircularModel = CircularViewType.stateModel as CircularViewStateModel

  const defaultHeight = 550

  return types.compose(
    'SvInspectorView',
    BaseViewModel,
    types.model({
      /**
       * #property
       */
      id: ElementId,
      /**
       * #property
       */
      type: types.literal('SvInspectorView'),

      /**
       * #property
       */
      height: types.optional(types.number, defaultHeight),
      /**
       * #property
       */
      onlyDisplayRelevantRegionsInCircularView: false,
      /**
       * #property
       */
      spreadsheetView: types.optional(SpreadsheetModel, () =>
        SpreadsheetModel.create({
          type: 'SpreadsheetView',
          hideVerticalResizeHandle: true,
        }),
      ),
      /**
       * #property
       */
      circularView: types.optional(CircularModel, () =>
        CircularModel.create({
          type: 'CircularView',
          hideVerticalResizeHandle: true,
          hideTrackSelectorButton: true,
          disableImportForm: true,
        }),
      ),
      /**
       * #property
       * used for initializing the view from a session snapshot
       */
      init: types.frozen<SvInspectorViewInit | undefined>(),
    }),
  )
}

export type SvInspectorViewBaseModel = ReturnType<typeof createBaseModel>

export default function stateModelFactory(pluginManager: PluginManager) {
  return lazyInit(
    createBaseModel(pluginManager),
    () => import('./model.lazy.ts').then(m => m.enhance),
  ) as ReturnType<typeof enhance> & { preload(): Promise<void> }
}

export type SvInspectorViewStateModel = ReturnType<typeof stateModelFactory>
export type SvInspectorViewModel = Instance<SvInspectorViewStateModel>

import {
  localStorageGetItem,
} from '@jbrowse/core/util'
import { ElementId, Region as RegionModel } from '@jbrowse/core/util/types/mst'
import { lazyInit, types } from '@jbrowse/mobx-state-tree'

import type { enhance } from './model.lazy.ts'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { Instance, SnapshotIn } from '@jbrowse/mobx-state-tree'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

export const LabeledRegionModel = types
  .compose(
    RegionModel,
    types.model('Label', {
      label: types.optional(types.string, ''),
      highlight: types.optional(types.string, 'rgba(247, 129, 192, 0.35)'),
    }),
  )
  .actions(self => ({
    setLabel(label: string) {
      self.label = label
    },
    setHighlight(color: string) {
      self.highlight = color
    },
  }))

export const SharedBookmarksModel = types.model('SharedBookmarksModel', {
  sharedBookmarks: types.maybe(types.array(LabeledRegionModel)),
})

export interface IExtendedLGV extends LinearGenomeViewModel {
  bookmarkHighlightsVisible: boolean
  bookmarkLabelsVisible: boolean
  setBookmarkHighlightsVisible: (arg: boolean) => void
  setBookmarkLabelsVisible: (arg: boolean) => void
}

export interface ILabeledRegionModel extends SnapshotIn<
  typeof LabeledRegionModel
> {
  refName: string
  start: number
  end: number
  reversed: boolean
  highlight: string
  assemblyName: string
  label: string
  setRefName: (newRefName: string) => void
  setLabel: (label: string) => void
  setHighlight: (color: string) => void
}

export interface IExtendedLabeledRegionModel extends ILabeledRegionModel {
  id: number
  correspondingObj: ILabeledRegionModel
}

export const localStorageKeyF = () =>
  typeof window !== 'undefined'
    ? `bookmarks-${[window.location.host + window.location.pathname].join('-')}`
    : 'empty'

/**
 * #stateModel GridBookmarkWidgetModel
 */
export function createBaseModel(_pluginManager: PluginManager) {
  return types.model('GridBookmarkModel', {
    /**
     * #property
     */
    id: ElementId,
    /**
     * #property
     */
    type: types.literal('GridBookmarkWidget'),
    /**
     * #property
     * removed by postProcessSnapshot, only loaded from localStorage
     */
    bookmarks: types.optional(types.array(LabeledRegionModel), () =>
      JSON.parse(localStorageGetItem(localStorageKeyF()) || '[]'),
    ),
  })
}

export type GridBookmarkBaseModel = ReturnType<typeof createBaseModel>

export default function f(pluginManager: PluginManager) {
  return lazyInit(
    createBaseModel(pluginManager),
    () => import('./model.lazy.ts').then(m => m.enhance),
  ) as ReturnType<typeof enhance> & { preload(): Promise<void> }
}

export type GridBookmarkStateModel = ReturnType<typeof f>
export type GridBookmarkModel = Instance<GridBookmarkStateModel>

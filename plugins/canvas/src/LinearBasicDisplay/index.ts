import { lazy } from 'react'

import DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType'
import { types } from '@jbrowse/mobx-state-tree'

import configSchemaFactory from './configSchema.ts'
import linearFeatureDisplayModelFactory from '../LinearFeatureDisplay/model.ts'

import type PluginManager from '@jbrowse/core/PluginManager'

const LazyBaseLinearDisplayComponent = lazy(() =>
  import('@jbrowse/plugin-linear-genome-view').then(m => ({
    default: m.BaseLinearDisplayComponent,
  })),
)

export default function register(pluginManager: PluginManager) {
  pluginManager.addDisplayType(() => {
    const configSchema = configSchemaFactory(pluginManager)
    const stateModel = types.compose(
      'LinearBasicDisplay',
      linearFeatureDisplayModelFactory(configSchema),
      types.model({
        type: types.literal('LinearBasicDisplay'),
      }),
    )
    return new DisplayType({
      name: 'LinearBasicDisplay',
      displayName: 'Basic feature display',
      configSchema,
      stateModel,
      trackType: 'FeatureTrack',
      viewType: 'LinearGenomeView',
      ReactComponent: LazyBaseLinearDisplayComponent,
    })
  })
}

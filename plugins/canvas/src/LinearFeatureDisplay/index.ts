import { lazy } from 'react'

import DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType'

import configSchemaFactory from './configSchema.ts'
import modelFactory from './model.ts'

import type PluginManager from '@jbrowse/core/PluginManager'

const LazyBaseLinearDisplayComponent = lazy(() =>
  import('@jbrowse/plugin-linear-genome-view').then(m => ({
    default: m.BaseLinearDisplayComponent,
  })),
)

export default function register(pluginManager: PluginManager) {
  pluginManager.addDisplayType(() => {
    const configSchema = configSchemaFactory(pluginManager)
    return new DisplayType({
      name: 'LinearFeatureDisplay',
      displayName: 'Feature display',
      helpText:
        'GPU-accelerated feature display with smooth zoom/pan. Data is uploaded once to GPU, enabling instant navigation.',
      configSchema,
      stateModel: modelFactory(configSchema),
      trackType: 'FeatureTrack',
      viewType: 'LinearGenomeView',
      ReactComponent: LazyBaseLinearDisplayComponent,
    })
  })
}

export { default as linearFeatureDisplayStateModelFactory } from './model.ts'
export { default as linearFeatureDisplayConfigSchemaFactory } from './configSchema.ts'
export type { LinearFeatureDisplayModel } from './model.ts'

import { lazy } from 'react'

import { DisplayType } from '@jbrowse/core/pluggableElementTypes'

import configSchemaFactory from './configSchema.ts'
import stateModelFactory from './model.ts'

import type PluginManager from '@jbrowse/core/PluginManager'

const LazyBaseLinearDisplayComponent = lazy(() =>
  import('@jbrowse/plugin-linear-genome-view').then(m => ({
    default: m.BaseLinearDisplayComponent,
  })),
)

export default function LinearWiggleDisplayF(pluginManager: PluginManager) {
  pluginManager.addDisplayType(() => {
    const configSchema = configSchemaFactory
    return new DisplayType({
      name: 'LinearWiggleDisplay',
      displayName: 'Wiggle display',
      configSchema,
      stateModel: stateModelFactory(pluginManager, configSchema),
      trackType: 'QuantitativeTrack',
      viewType: 'LinearGenomeView',
      ReactComponent: LazyBaseLinearDisplayComponent,
    })
  })
}

export { default as Tooltip } from './components/Tooltip.tsx'
export { default as ReactComponent } from './components/WiggleComponent.tsx'
export { default as modelFactory } from './model.ts'

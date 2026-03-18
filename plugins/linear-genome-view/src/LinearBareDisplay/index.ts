import { lazy } from 'react'

import { DisplayType } from '@jbrowse/core/pluggableElementTypes'

import { configSchemaFactory } from './configSchema.ts'
import { stateModelFactory } from './model.ts'

import type PluginManager from '@jbrowse/core/PluginManager'

const LazyBaseLinearDisplayComponent = lazy(
  () => import('../BaseLinearDisplay/components/BaseLinearDisplay.tsx'),
)

export default function LinearBareDisplayF(pluginManager: PluginManager) {
  pluginManager.addDisplayType(() => {
    const configSchema = configSchemaFactory(pluginManager)
    return new DisplayType({
      name: 'LinearBareDisplay',
      configSchema,
      displayName: 'Bare feature display',
      stateModel: stateModelFactory(configSchema),
      trackType: 'BasicTrack',
      viewType: 'LinearGenomeView',
      ReactComponent: LazyBaseLinearDisplayComponent,
    })
  })
}

export { configSchemaFactory } from './configSchema.ts'
export { stateModelFactory } from './model.ts'

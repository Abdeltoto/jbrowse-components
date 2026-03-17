import { useEffect } from 'react'

import { App } from '@jbrowse/app-core'
import { onSnapshot } from '@jbrowse/mobx-state-tree'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { autorun } from 'mobx'
import { observer } from 'mobx-react'

import FileHandleRestoreBanner from './FileHandleRestoreBanner.tsx'
import ShareButton from './ShareButton.tsx'
import { readQueryParams, setQueryParams } from '../useQueryParam.ts'

import type { WebSessionModel } from '../sessionModel/index.ts'
import type PluginManager from '@jbrowse/core/PluginManager'

interface ViewSpec {
  type: string
  loc: string
  assembly: string
  tracks?: string[]
}

function getViewSpec(view: Record<string, unknown>) {
  const locStrings = view.coarseVisibleLocStrings as string | undefined
  const assemblyNames = view.assemblyNames as string[] | undefined
  const tracks = view.tracks as
    | { configuration: { trackId: string } }[]
    | undefined
  if (locStrings && assemblyNames?.length === 1) {
    return {
      type: view.type as string,
      loc: locStrings,
      assembly: assemblyNames[0],
      tracks: tracks?.map(t => t.configuration.trackId),
    } as ViewSpec
  }
  return undefined
}

function serializeSessionToUrl(views: Record<string, unknown>[]) {
  const viewSpecs = views
    .map(v => getViewSpec(v))
    .filter((v): v is ViewSpec => v !== undefined)
  if (viewSpecs.length !== views.length) {
    return
  }

  // single LGV: use flat &loc=&assembly=&tracks= params
  if (viewSpecs.length === 1 && viewSpecs[0]!.type === 'LinearGenomeView') {
    const v = viewSpecs[0]!
    setQueryParams({
      session: undefined,
      loc: v.loc,
      assembly: v.assembly,
      tracks: v.tracks?.length ? v.tracks.join(',') : undefined,
    })
    return
  }

  // multiple views or non-LGV: use spec- format
  setQueryParams({
    loc: undefined,
    assembly: undefined,
    tracks: undefined,
    session: `spec-${JSON.stringify({ views: viewSpecs })}`,
  })
}

const JBrowse = observer(function JBrowse({
  pluginManager,
}: {
  pluginManager: PluginManager
}) {
  const {
    adminKey,
    adminServer,
    config: configPath,
  } = readQueryParams(['adminKey', 'adminServer', 'config'])
  const { rootModel } = pluginManager
  const { error, jbrowse, session: s } = rootModel!
  const session = s as WebSessionModel
  const { id, theme } = session

  useEffect(() => {
    // @ts-expect-error
    window.JBrowseRootModel = rootModel
    // @ts-expect-error
    window.JBrowseSession = session

    const dispose = autorun(
      () => {
        if (session) {
          serializeSessionToUrl(
            session.views.map(v => v as unknown as Record<string, unknown>),
          )
        }
      },
      { delay: 400 },
    )
    return dispose
  }, [id, rootModel, session])

  useEffect(() => {
    return adminKey
      ? onSnapshot(jbrowse, async snapshot => {
          try {
            const response = await fetch(adminServer || '/updateConfig', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                adminKey,
                configPath,
                config: snapshot,
              }),
            })
            if (!response.ok) {
              const message = await response.text()
              throw new Error(`HTTP ${response.status} (${message})`)
            }
          } catch (e) {
            session.notify(`Admin server error: ${e}`)
          }
        })
      : undefined
  }, [jbrowse, session, adminKey, adminServer, configPath])

  if (error) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw error
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FileHandleRestoreBanner />
      {/* key={id} forces React to remount App when session changes (e.g.
          duplicate session) preventing stale references to old session views */}
      <App
        key={id}
        // @ts-expect-error
        session={session}
        HeaderButtons={<ShareButton session={session} />}
      />
    </ThemeProvider>
  )
})

export default JBrowse

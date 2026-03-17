import { types } from '@jbrowse/mobx-state-tree'

/**
 * #stateModel AppFocusMixin
 * #category session
 */
export function AppFocusMixin() {
  return types
    .model({
      /**
       * #property
       * used to keep track of which view is in focus
       */
      focusedViewId: types.maybe(types.string),
    })
    .actions(self => ({
      /**
       * #action
       */
      setFocusedViewId(viewId: string) {
        self.focusedViewId = viewId
      },
    }))
    .postProcessSnapshot(snap => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!snap) {
        return snap
      }
      const { focusedViewId: _, ...rest } = snap as Omit<typeof snap, symbol>
      return rest as typeof snap
    })
}

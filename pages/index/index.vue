<template>
  <FetchPending v-if="$fetchState.pending" />
  <FetchError
    v-else-if="$fetchState.error"
    @retry="$fetch"
  />
  <div
    v-else
    class="brello-all-workspace"
  >
    <v-row class="flex-grow-0 flex-shrink-0">
      <v-col class="d-flex align-center">
        <h4 class="text-uppercase text--secondary">
          Your workspaces
        </h4>
      </v-col>
    </v-row>
    <v-row class="align-content-start">
      <v-col v-if="!getWorkspaces.length">
        <div class="text--secondary">
          You aren't a member of any workspaces yet.
          <span
            class="create-workspace-link"
            @click="$emit('open-dialog-workspace')"
          >
            Create a workspace
          </span>
        </div>
      </v-col>
      <v-col v-else>
        <template v-for="w in getWorkspaces">
          <LazyTrelloWorkspace
            :key="`workspace-boards-${w.id}`"
            :boards="w.boards"
            @add-board="openDialogBoard(w.id)"
          >
            <template #header>
              <v-col
                cols="12"
                class="d-flex align-center"
              >
                <v-avatar
                  size="30"
                  rounded
                  class="mr-3"
                  :style="{
                    background: `linear-gradient(${w.color[0]}, ${w.color[1]})`
                  }"
                >
                  <span class="white--text text-uppercase font-weight-black">
                    {{ w.title[0] }}
                  </span>
                </v-avatar>
                <h4>{{ w.title }}</h4>
              </v-col>
            </template>
          </LazyTrelloWorkspace>
        </template>
      </v-col>
    </v-row>

    <DialogCreateBoard
      ref="dialogBoard"
    />
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import { mapGetters } from 'vuex'

export default {
  name: 'AllWorkspaces',
  data: () => ({
    boards: []
  }),
  async fetch () {
    const snapshotBoards = await this.$fire.firestore
      .collection('users')
      .doc(this.getAccount.uid)
      .collection('boards')
      .orderBy('created_at', 'asc')
      .get()

    this.boards = snapshotBoards.docs.map(doc => doc.data())
  },
  computed: {
    ...mapGetters([
      'getAccount',
      'getWorkspaceCollection'
    ]),
    getWorkspaces () {
      let boardsClone = cloneDeep(this.boards)

      const workspacesNew = cloneDeep(this.getWorkspaceCollection)
        .map((workspace) => {
          const [selected, remaining] = boardsClone.reduce(([pass, fail], current) => {
            return current.workspace_id === workspace.id
              ? [[...pass, current], fail]
              : [pass, [...fail, current]]
          }, [[], []])

          workspace.boards = selected
          boardsClone = remaining
          return workspace
        })
      return workspacesNew
    }
  },
  mounted () {
    this.$fire.firestore
      .collection('users')
      .doc(this.getAccount.uid)
      .collection('boards')
      .orderBy('created_at', 'asc')
      .onSnapshot((querySnapshot) => {
        this.boards = querySnapshot.docs.map(doc => doc.data())
      })
  },
  methods: {
    openDialogBoard (workspaceID) {
      this.$refs.dialogBoard.openDialogBoard(workspaceID)
    }
  }
}
</script>

<style lang="scss" scoped>
.brello-all-workspace {
  display: flex;
  flex-direction: column;
}
</style>

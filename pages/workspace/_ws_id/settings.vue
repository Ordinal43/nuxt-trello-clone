<template>
  <v-container>
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      offset-y
    >
      <template #activator="{ on }">
        <span
          class="error--text text-decoration-underline delete-workspace-btn"
          v-on="on"
        >
          Delete this Workspace?
        </span>
      </template>
      <v-card width="300">
        <v-container>
          <v-row>
            <v-col class="d-flex align-center justify-space-between">
              <h4>
                Delete Workspace?
              </h4>
              <v-icon @click="menu = false">
                mdi-close
              </v-icon>
            </v-col>
            <v-col cols="12">
              <p>
                Are you sure you want to delete {{ workspace.title }}?
              </p>
              <div class="mb-2">
                <label>
                  <span class="text-caption text--secondary font-weight-medium">
                    Enter the Workspace name to delete
                  </span>
                  <input
                    v-model="inputTitle"
                    type="text"
                    class="brello-input text-body-2 px-3 py-2"
                    :placeholder="workspace.title"
                  >
                </label>
              </div>
              <v-btn
                block
                color="error"
                :disabled="inputTitle !== workspace.title"
                :loading="isDeletingWorkspace"
                @click="deleteWorkspace"
              >
                delete workspace
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-menu>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'WorkspaceSettings',
  props: {
    workspace: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    menu: false,
    inputTitle: '',
    isDeletingWorkspace: false
  }),
  computed: {
    ...mapGetters([
      'getAccount'
    ])
  },
  watch: {
    menu (val) {
      if (!val) {
        this.inputTitle = ''
      }
    }
  },
  methods: {
    async deleteWorkspace () {
      this.isDeletingWorkspace = true
      try {
        const batch = this.$fire.firestore
          .batch()

        // batch delete workspace
        const workspaceRef = this.$fire.firestore
          .collection('users')
          .doc(this.getAccount.uid)
          .collection('workspaces')
          .doc(this.workspace.id)

        // batch delete boards
        const snapshotBoards = await this.$fire.firestore
          .collection('users')
          .doc(this.getAccount.uid)
          .collection('boards')
          .where('workspace_id', '==', this.workspace.id)
          .get()

        // batch delete cards
        const listSnapshotCards = await Promise.all(
          snapshotBoards.docs.map(doc => doc.ref.collection('cards').get())
        )

        batch.delete(workspaceRef)

        snapshotBoards.docs.forEach((doc) => {
          batch.delete(doc.ref)
        })

        listSnapshotCards.forEach((snapshotCards) => {
          snapshotCards.docs.forEach((doc) => {
            batch.delete(doc.ref)
          })
        })

        await batch.commit()

        this.$store.commit('SET_ALERT', 'Workspace deleted!')
        this.$router.push('/')
      } catch (error) {
        this.$store.commit('SET_ERROR', error)
      } finally {
        this.isDeletingWorkspace = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.delete-workspace-btn {
  cursor: pointer;
}
</style>

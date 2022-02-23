<template>
  <v-container class="fill-height align-start">
    <div
      class="brello-workspace"
    >
      <div class="brello-workspace-sidenav d-none d-sm-block">
        <FetchPending v-if="$fetchState.pending" />
        <FetchError
          v-else-if="$fetchState.error"
          @retry="$fetch"
        />
        <div v-else>
          <v-list nav dense>
            <v-list-item-group color="primary">
              <v-list-item
                to="/"
                nuxt
              >
                <v-list-item-avatar
                  size="25"
                  rounded
                >
                  <v-icon>mdi-trello</v-icon>
                </v-list-item-avatar>
                <v-list-item-title class="text-body-2">
                  Boards
                </v-list-item-title>
              </v-list-item>
            </v-list-item-group>
          </v-list>
          <v-list nav dense>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="text--secondary">
                  Workspaces
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn
                  x-small
                  icon
                  text
                  @click="openDialogWorkspace"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
            <SidenavWorkspace
              :workspaces="getWorkspaceCollection"
            />
          </v-list>
        </div>
      </div>
      <div class="pt-8 pl-sm-4 brello-workspace-main">
        <NuxtChild
          @open-dialog-workspace="openDialogWorkspace"
        />
      </div>
    </div>

    <!-- ============= Dialog create workspace ============= -->
    <v-dialog
      v-model="showDialogWorkspace"
      max-width="355"
      persistent
    >
      <v-card>
        <v-container>
          <v-row
            no-gutters
            align="center"
            justify="space-between"
            class="mb-2"
          >
            <h3>Add Workspace</h3>
            <v-icon @click="showDialogWorkspace = false;">
              mdi-close
            </v-icon>
          </v-row>
          <v-form
            ref="formWorkspace"
            @submit.prevent=";"
          >
            <v-row>
              <v-col cols="12">
                <v-text-field
                  ref="inputWorkspaceTitle"
                  v-model="workspace.title"
                  label="Workspace name"
                  name="Workspace name"
                  type="text"
                  required
                  validate-on-blur
                  :rules="[inputRequired]"
                />
                <v-textarea
                  v-model="workspace.description"
                  label="Workspace description (optional)"
                  name="Workspace description"
                  type="text"
                  rows="2"
                  no-resize
                  validate-on-blur
                />
              </v-col>
              <v-col cols="12">
                <v-btn
                  color="primary"
                  block
                  @click="createWorkspace"
                >
                  Submit
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
        <v-overlay
          absolute
          :value="uploadingWorkspace"
        >
          <v-progress-circular
            indeterminate
          />
        </v-overlay>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import { mapGetters } from 'vuex'
import { inputRequired } from '@/utils/input_rules.utils'

const WORKSPACE_COLOR = [
  ['#cc4223', '#cb7d25'],
  ['#403294', '#0747a6'],
  ['#0747a6', '#008da6'],
  ['#b22865', '#cd5a91'],
  ['#006644', '#00875a']
]

const getRandomGradient = () => {
  const idx = Math.floor(Math.random() * WORKSPACE_COLOR.length)
  return WORKSPACE_COLOR[idx]
}

export default {
  name: 'IndexPage',
  data: () => ({
    workspace: {
      title: '',
      description: '',
      color: [],
      created_at: ''
    },
    showDialogWorkspace: false,
    uploadingWorkspace: false
  }),
  async fetch () {
    await this.$store.dispatch('fetchWorkspaceCollection')
  },
  head: () => ({
    title: 'Home'
  }),
  computed: {
    ...mapGetters([
      'getAccount',
      'getWorkspaceCollection'
    ])
  },
  watch: {
    showDialogWorkspace (val) {
      if (!val) {
        this.resetWorkspaceForm()
      }
    }
  },
  mounted () {
    this.$store.dispatch('setWorkspaceCollectionListener')
  },
  methods: {
    inputRequired,
    /**
     * Workspace methods
     */
    openDialogWorkspace () {
      this.showDialogWorkspace = true
      setTimeout(() => {
        this.$refs.inputWorkspaceTitle.focus()
      }, 100)
    },
    resetWorkspaceForm () {
      this.workspace.title = ''
    },
    async createWorkspace () {
      if (this.$refs.formWorkspace.validate()) {
        try {
          this.uploadingWorkspace = true

          const uuidWorkspace = uuidv4()
          this.workspace.id = uuidWorkspace
          this.workspace.color = getRandomGradient()
          this.workspace.created_at = this.$fireModule.firestore.FieldValue.serverTimestamp()

          await this.$fire.firestore
            .collection('users')
            .doc(this.getAccount.uid)
            .collection('workspaces')
            .doc(uuidWorkspace)
            .set(this.workspace)
        } catch (error) {
          this.$store.commit('SET_ERROR', error)
        } finally {
          this.showDialogWorkspace = false
          this.uploadingWorkspace = false
        }
      }
    }
  }
}
</script>

<style lang="scss">
.brello-workspace {
  display: flex;
  width: 100%;
  &-sidenav {
    width: 272px;
    flex: 0 0 auto;
  }
  &-main {
    flex: 1 1 auto;
  }
}

input,
textarea {
  width: 100%;
  outline: none;
}

textarea {
  resize: none;
  overflow-wrap: break-word;
}

.create-workspace-link {
  text-decoration: underline;
  &:hover {
    cursor: pointer;
  }
}

input.brello-input {
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #fafbfc;;
  box-shadow: inset 0 0 0 2px #dfe1e6;
  &:hover {
    background-color: #ebecf0;
  }
  &:focus, &.active {
    background-color: #fff;
    box-shadow: inset 0 0 0 2px #0079bf;
  }
  &[disabled] {
    background-color: #dfe1e6;
    &:hover {
      cursor: not-allowed;
    }
  }
}
</style>

<template>
  <v-container class="fill-height align-start">
    <FetchPending v-if="$fetchState.pending" />
    <FetchError v-else-if="$fetchState.error" />
    <div
      v-else
      class="brello-workspace"
    >
      <div class="brello-workspace-sidenav d-none d-sm-block">
        <v-list dense>
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
            :workspaces="getUser.workspaces"
          />
        </v-list>
      </div>
      <div class="pt-8 pl-sm-4 brello-workspace-main">
        <NuxtChild
          @open-dialog-workspace="openDialogWorkspace"
        />
      </div>
    </div>

    <!-- ============= Dialog create workspace ============= -->
    <v-dialog
      v-model="dialogWorkspace"
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
            <v-icon @click="dialogWorkspace = false;">
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
                  v-model="workspaceTitle"
                  label="Workspace title"
                  name="Workspace title"
                  type="text"
                  required
                  validate-on-blur
                  :rules="[inputRequired]"
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
import cloneDeep from 'lodash/cloneDeep'
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
    workspaceTitle: '',
    dialogWorkspace: false,
    uploadingWorkspace: false
  }),
  async fetch () {
    await this.$store.dispatch('fetchUser')
  },
  head: () => ({
    title: 'Home'
  }),
  computed: {
    ...mapGetters([
      'getUser'
    ])
  },
  methods: {
    inputRequired,
    /**
     * Workspace methods
     */
    openDialogWorkspace () {
      this.dialogWorkspace = true
      setTimeout(() => {
        this.$refs.inputWorkspaceTitle.focus()
      }, 100)
    },
    resetWorkspaceForm () {
      this.workspaceTitle = ''
    },
    async createWorkspace () {
      if (this.$refs.formWorkspace.validate()) {
        const uuidWorkspace = uuidv4()
        const cloneUser = cloneDeep(this.getUser)
        this.uploadingWorkspace = true

        if (!cloneUser.workspaces) {
          cloneUser.workspaces = []
        }
        cloneUser.workspaces.push({
          id: uuidWorkspace,
          title: this.workspaceTitle,
          color: getRandomGradient()
        })
        try {
          await this.$store.dispatch('updateUser', cloneUser)
        } catch (error) {
          this.$store.commit('SET_ERROR', error)
          cloneUser.workspaces.pop()
          this.$store.commit('SET_USER', cloneUser)
        }
        this.dialogWorkspace = false
        this.uploadingWorkspace = false
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

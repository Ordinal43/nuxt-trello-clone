<template>
  <FetchPending v-if="$fetchState.pending" />
  <FetchError
    v-else-if="$fetchState.error"
    @retry="$fetch"
  />
  <div v-else>
    <div class="header-container">
      <div class="workspace-header">
        <div class="workspace-title">
          <v-avatar
            size="85"
            rounded
            class="mr-3"
            :style="{
              background: `linear-gradient(${workspace.color[0]}, ${workspace.color[1]})`,
              'font-size': '60px'
            }"
          >
            <span class="white--text text-uppercase font-weight-black">
              {{ workspace.title[0] }}
            </span>
          </v-avatar>
          <div class="ml-2 workspace-title-main">
            <div v-show="!showEditWorkspace">
              <p class="workspace-title-main-text">
                {{ workspace.title }}
              </p>
              <v-btn
                small
                depressed
                @click="showEditWorkspace = true"
              >
                <v-icon left>
                  mdi-pencil-outline
                </v-icon>
                Edit workspace details
              </v-btn>
            </div>
            <v-form
              v-show="showEditWorkspace"
              class="form-edit-workspace"
              @submit.prevent=";"
            >
              <v-text-field
                v-model="workspace.title"
                label="Name"
                name="title"
                type="text"
                dense
                outlined
                validate-on-blur
                :rules="[inputRequired]"
              />
              <v-text-field
                v-model="workspace.website"
                label="Website (optional)"
                name="title"
                type="text"
                dense
                outlined
              />
              <v-textarea
                v-model="workspace.description"
                label="Description (optional)"
                name="title"
                type="text"
                rows="3"
                outlined
              />
              <v-btn
                depressed
                color="primary"
                small
                @click="updateWorkspace"
              >
                save
              </v-btn>
              <v-btn
                depressed
                small
                @click="showEditWorkspace = false"
              >
                cancel
              </v-btn>
              <v-overlay
                :value="updatingWorkspace"
                absolute
                color="#f4f5f7"
              >
                <v-progress-circular
                  indeterminate
                />
              </v-overlay>
            </v-form>
          </div>
        </div>
        <div>
          <v-tabs
            centered
            background-color="transparent"
            class="workspace-tabs"
            hide-slider
          >
            <v-tab
              v-for="(tab, i) in tabs"
              :key="`tab-${i}`"
              :to="tab.to"
              nuxt
              exact
              exact-active-class="tab-active"
              class="workspace-tabs-item"
            >
              {{ tab.title }}
            </v-tab>
          </v-tabs>
        </div>
      </div>
    </div>
    <v-container fluid>
      <div
        :class="{
          'pa-5': $vuetify.breakpoint.mdAndUp
        }"
      >
        <NuxtChild />
      </div>
    </v-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { inputRequired } from '@/utils/input_rules.utils'

export default {
  data: vm => ({
    workspace: {},
    showEditWorkspace: false,
    updatingWorkspace: false,
    tabs: [
      { title: 'Boards', to: { path: `/workspace/${vm.$route.params.ws_id}` } },
      { title: 'Settings', to: { path: `/workspace/${vm.$route.params.ws_id}/settings` } }
    ]
  }),
  async fetch () {
    const docWorkspace = await this.$fire.firestore
      .collection('users')
      .doc(this.getAccount.uid)
      .collection('workspaces')
      .doc(this.$route.params.ws_id)
      .get()

    if (docWorkspace.exists) {
      this.workspace = docWorkspace.data()
    }
  },
  computed: {
    ...mapGetters([
      'getAccount'
    ])
  },
  mounted () {
    this.$fire.firestore
      .collection('users')
      .doc(this.getAccount.uid)
      .collection('workspaces')
      .doc(this.$route.params.ws_id)
      .onSnapshot((doc) => {
        if (doc.exists) {
          this.workspace = doc.data()
        }
      })
  },
  methods: {
    inputRequired,
    async updateWorkspace () {
      try {
        this.updatingWorkspace = true
        await this.$fire.firestore
          .collection('users')
          .doc(this.getAccount.uid)
          .collection('workspaces')
          .doc(this.$route.params.ws_id)
          .update(this.workspace)
      } catch (error) {
        this.$store.commit('SET_ERROR', error)
      } finally {
        this.showEditWorkspace = false
        this.updatingWorkspace = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.header-container {
  background-color: #f4f5f7;
  border-bottom: 1px solid #dfe1e6;
}

.workspace {
  &-header {
    max-width: 650px;
    margin: 0 auto;
  }

  &-title {
    padding: 32px;
    display: flex;

    &-main {
      flex: 1 1 auto;
      min-width: 0;

      &-text {
        font-size: 22px;
        font-weight: bold;
        overflow-wrap: break-word;
      }
    }
  }

  &-tabs {
    margin-bottom: -1px;

    &-item {
      border-radius: 3px 3px 0 0;
    }
  }
}

.form-edit-workspace {
  width: 250px;
  position: relative;
}

.tab-active {
  background-color: white;
  border: 1px solid #dfe1e6;
  border-bottom: 0;
}
</style>

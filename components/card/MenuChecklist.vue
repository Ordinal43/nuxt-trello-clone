<template>
  <div class="mb-2">
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      offset-y
    >
      <template #activator="{ on }">
        <v-btn
          small
          depressed
          block
          color="#091E420A"
          v-on="on"
        >
          <v-icon left>
            mdi-checkbox-marked-outline
          </v-icon>
          checklist
        </v-btn>
      </template>
      <v-card width="300" color="#F4F5F7">
        <v-container>
          <v-row>
            <v-col class="d-flex align-center justify-space-between">
              <h4>Add checklist</h4>
              <v-icon @click="menu = false">
                mdi-close
              </v-icon>
            </v-col>
            <v-col cols="12">
              <input
                ref="checklistTitle"
                v-model="title"
                label="Title"
                type="text"
                class="brello-input"
              >
            </v-col>
            <v-col cols="12">
              <v-btn
                color="primary"
                @click="addChecklist"
              >
                Add
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
export default {
  data () {
    return {
      menu: false,
      title: ''
    }
  },
  watch: {
    menu (val) {
      if (val) {
        /**
         * Vuetify issue:
         * https://github.com/vuetifyjs/vuetify/issues/4454
         */
        setTimeout(() => this.$refs.checklistTitle.focus(), 100)
      }
    }
  },
  methods: {
    addChecklist () {
      if (this.title) {
        this.menu = false
        this.$emit('add-checklist', this.title)
        this.title = ''
      } else {
        this.$refs.checklistTitle.focus()
      }
    }
  }
}
</script>

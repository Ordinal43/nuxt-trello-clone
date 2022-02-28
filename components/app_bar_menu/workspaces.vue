<template>
  <v-card width="300">
    <v-container>
      <v-row>
        <v-col class="d-flex align-center justify-space-between">
          <h4>
            Workspaces
          </h4>
          <v-icon @click="$emit('close')">
            mdi-close
          </v-icon>
        </v-col>
        <v-col cols="12" class="px-0">
          <v-list-item
            v-for="w in $store.getters.getWorkspaceCollection"
            :key="`appbar-w-${w.id}`"
            :to="`/workspace/${w.id}`"
            nuxt
          >
            <v-list-item-avatar
              size="35"
              rounded
              :style="{
                background: `linear-gradient(${w.color[0]}, ${w.color[1]})`
              }"
            >
              <span class="white--text text-uppercase font-weight-black">
                {{ w.title[0] }}
              </span>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="text-body-2 py-1 font-weight-bold">
                {{ w.title }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
export default {
  name: 'AppBarMenuWorkspace'
}
</script>

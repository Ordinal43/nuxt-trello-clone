<template>
  <v-list>
    <v-list-group
      v-for="w in workspaces"
      :key="`sidenav-workspace-${w.id}`"
    >
      <template #activator>
        <v-list-item-avatar
          size="25"
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
          <v-list-item-title class="text-body-2 py-1">
            {{ w.title }}
          </v-list-item-title>
        </v-list-item-content>
      </template>

      <v-list-item
        v-for="(menu, i) in menus"
        :key="`w-menu-${w.id}-${i}`"
        :to="`/workspace/${w.id}/${menu.uri}`"
        class="pl-12"
        nuxt
      >
        <v-icon small>
          {{ menu.icon }}
        </v-icon>
        <v-list-item-content class="ml-3">
          <v-list-item-title class="text-caption text--secondary">
            {{ menu.title }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list-group>
  </v-list>
</template>

<script>
export default {
  props: {
    workspaces: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    menus: [
      { title: 'Board', icon: 'mdi-trello', uri: 'home' },
      { title: 'Settings', icon: 'mdi-cog', uri: 'settings' }
    ]
  })
}
</script>

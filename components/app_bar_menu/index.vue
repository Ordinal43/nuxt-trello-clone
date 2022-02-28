<template>
  <span class="mx-5">
    <v-btn
      v-for="(menu, i) in menus"
      :key="`appbar-menu-${i}`"
      ref="menus"
      text
      @click="openMenu(menu, i)"
    >
      {{ menu.title }}
      <v-icon right>
        mdi-chevron-down
      </v-icon>
    </v-btn>
    <v-menu
      v-model="showMenu"
      :position-x="position.x"
      :position-y="position.y"
    >
      <component
        :is="activeMenuComponent"
        @close="showMenu = false"
      />
    </v-menu>
  </span>
</template>

<script>
export default {
  name: 'AppBarMenu',
  data: () => ({
    showMenu: false,
    menus: [
      {
        title: 'Workspaces',
        component: 'AppBarMenuWorkspaces'
      }
    ],
    activeMenuComponent: null,
    position: { x: 0, y: 0 }
  }),
  methods: {
    openMenu ({ component }, i) {
      this.activeMenuComponent = component
      this.showMenu = true
      const rect = this.$refs.menus[i].$el.getBoundingClientRect()
      this.position = {
        x: rect.left,
        y: rect.bottom + 10
      }
    }
  }
}
</script>

<template>
  <div>
    <div class="d-flex align-start">
      <v-icon
        class="brello-card-icon pr-4"
      >
        mdi-text
      </v-icon>
      <p class="brello-card-header text-subtitle-1 font-weight-medium">
        Description
      </p>
    </div>
    <div class="ml-sm-10">
      <template v-if="!descriptionEdit">
        <div @click="openEdit">
          <div v-if="value">
            {{ value }}
          </div>
          <v-sheet
            v-else
            rounded
            color="#091E4214"
            class="px-2 py-1"
          >
            Add a more detailed description...
          </v-sheet>
        </div>
      </template>
      <template v-else>
        <textarea
          ref="description"
          class="card-description"
          placeholder="Add a more detailed description..."
          :value="value"
          @input="mixin_resizeTextarea"
        />
        <div class="mt-1">
          <v-btn
            small
            color="primary"
            @click="update"
          >
            save
          </v-btn>
          <v-btn
            text
            small
            icon
            @click="descriptionEdit = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { mixinTextArea } from '@/mixins/vue-mixins'

export default {
  mixins: [
    mixinTextArea
  ],
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      descriptionEdit: false
    }
  },
  methods: {
    openEdit () {
      this.descriptionEdit = true
      this.$nextTick(() => {
        this.$refs.description.focus()
      })
    },
    update () {
      const val = this.$refs.description.value
      this.$emit('input', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.desc-fake {
  min-height: 56px;
  background-color: #091E420A;
  &:hover {
    background-color: #091E4214;
  }
}

textarea.card-description {
  background-color: #fff;
  min-height: 108px;
  padding: 8px 12px;
}
</style>

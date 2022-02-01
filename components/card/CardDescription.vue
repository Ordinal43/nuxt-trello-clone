<template>
  <div class="my-5 pa-2">
    <div class="d-flex align-start">
      <v-icon
        class="brello-card-icon pr-4"
      >
        mdi-text
      </v-icon>
      <p class="text-subtitle-1 font-weight-medium">
        Description
      </p>
      <v-btn
        small
        depressed
        color="#091E420A"
        class="brello-card-icon ml-3"
        @click="openEdit"
      >
        Edit
      </v-btn>
    </div>
    <div class="ml-sm-10">
      <template v-if="!descriptionEdit">
        <div @click="openEdit">
          <div
            v-if="value"
            class="desc text-body-2"
          >
            {{ value }}
          </div>
          <v-sheet
            v-else
            rounded
            class="desc-fake px-3 py-2 text-body-2 blue-grey--text text--darken-4"
          >
            Add a more detailed description...
          </v-sheet>
        </div>
      </template>
      <template v-else>
        <textarea
          ref="description"
          class="card-description text-body-2"
          placeholder="Add a more detailed description..."
          :value="value"
          @focus="mixin_resizeTextareaHeight"
          @input="mixin_resizeTextareaHeight"
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
      this.descriptionEdit = false
    }
  }
}
</script>

<style lang="scss" scoped>
.desc {
  &:hover {
    cursor: pointer;
  }
  &-fake {
    min-height: 56px;
    background-color: #091E420A;
    &:hover {
      background-color: #091E4214;
    }
  }
}

textarea.card-description {
  background-color: #fff;
  min-height: 70px;
  padding: 8px 12px;
}
</style>

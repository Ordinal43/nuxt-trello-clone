<template>
  <v-card color="#F4F5F7">
    <v-container>
      <v-row>
        <v-col class="pl-sm-4 d-flex align-start">
          <v-icon
            class="brello-card-icon pr-2 pt-2"
          >
            mdi-card-bulleted
          </v-icon>
          <div class="brello-card-header">
            <textarea
              ref="brello-edit-card-title"
              v-model="detailedCard.title"
              spellcheck="false"
              rows="1"
              class="card-title text-h6"
              @input="mixin_resizeTextarea"
            />
          </div>
          <v-icon
            class="brello-card-action ml-4"
            @click="$router.go(-1)"
          >
            mdi-close
          </v-icon>
        </v-col>
      </v-row>
      <v-row>
        <v-col v-if="$fetchState.pending" />
        <v-col v-else-if="$fetchState.error">
          <p class="text-center text-caption">
            An error occurred :(
          </p>
        </v-col>
        <v-col v-else>
          <v-btn
            color="red"
            @click="$emit('delete-card')"
          >
            delete
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import { mixinTextArea } from '@/mixins/vue-mixins'

export default {
  mixins: [
    mixinTextArea
  ],
  data () {
    return {
      detailedCard: {}
    }
  },
  async fetch () {
    const cardRef = this.$fire.firestore
      .collection('users')
      .doc(this.$store.getters.getUser.uid)
      .collection('boards')
      .doc(this.$route.params.id)
      .collection('cards')
      .doc(this.$route.params.card_id)

    const doc = await cardRef
      .get()

    if (doc.exists) {
      this.detailedCard = doc.data()
      this.detailedCard.id = doc.id
    }
  },
  mounted () {
    // fire textarea resize on mounted
    this.mixin_resizeTextarea({ target: this.$refs['brello-edit-card-title'] })
  }
}
</script>

<style lang="scss" scoped>
// ::v-deep enables selector to affect child components
::v-deep .brello-card {
  &-header {
    flex: 1 1 auto;
    min-width: 0;
  }
  &-icon {
    flex: 0 0 auto;
  }
  &-action {
    flex: 0 0 auto;
  }
}

::v-deep textarea {
  width: 100%;
  resize: none;
  outline: none;
  overflow-wrap: break-word;
  padding: 4px 8px;
  border-radius: 4px;
  &:focus {
    background: #fff;
    box-shadow: inset 0 0 0 2px #0079bf;
  }
  &.card-title {
    min-height: 40px;
  }
  &.card-description {
    background: #fff;
    min-height: 108px;
  }
}
</style>

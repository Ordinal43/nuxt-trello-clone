<template>
  <v-card>
    <v-container>
      <div
        no-gutters
        class="mb-4 d-flex align-start"
      >
        <div class="brello-card-title">
          <textarea
            ref="brello-edit-card-title"
            v-model="card.title"
            spellcheck="false"
            rows="1"
            class="card-title-textarea text-h6"
            @input="resize"
          />
        </div>
        <v-icon
          class="brello-card-action pl-2"
          @click="$router.go(-1)"
        >
          mdi-close
        </v-icon>
      </div>
      <v-row>
        <v-col v-if="$fetchState.pending">
          <p class="text-center text-caption">
            Fetching card...
          </p>
        </v-col>
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
export default {
  props: {
    simpleCard: { type: Object, required: true }
  },
  data () {
    return {
      card: {
        title: this.simpleCard.title
      }
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
      this.card = doc.data()
      this.card.id = doc.id
    }
  },
  mounted () {
    // fire textarea resize on mounted
    this.resize({ target: this.$refs['brello-edit-card-title'] })
  },
  methods: {
    resize ({ target }) {
      /**
       * Dynamically adjust height to textarea content
       */
      target.style.height = '0px'
      target.style.height = (target.scrollHeight) + 'px'
    }
  }
}
</script>

<style lang="scss" scoped>
.brello-card-title {
  flex: 1 1 auto;
  min-width: 0;
}

.brello-card-action {
  flex: 0 0 auto;
}

.card-title-textarea {
  width: 100%;
  resize: none;
  outline: none;
  overflow-wrap: break-word;
  min-height: 24px;
  border-radius: 3px;
  padding: 4px 8px;
  &:focus {
    background: #fff;
    box-shadow: inset 0 0 0 2px #0079bf;
  }
}
</style>

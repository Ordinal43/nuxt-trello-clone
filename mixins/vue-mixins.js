export const mixinTextArea = {
  methods: {
    mixin_resizeTextarea ({ target }) {
      /**
       * Dynamically adjust height to textarea content
       */
      target.style.height = '0px'
      target.style.height = (target.scrollHeight) + 'px'
    }
  }
}

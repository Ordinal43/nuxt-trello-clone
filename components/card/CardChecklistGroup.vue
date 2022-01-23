<template>
  <div>
    <div
      v-for="cl in value"
      :key="`checklist-${cl.id}`"
    >
      {{ cl.title }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Array,
      required: true,
      default: () => []
    }
  }
}
</script>

<template>
  <v-toolbar flat dense dark color="grey">
    <v-btn-toggle
      :value="value"
      group
      @change="$emit('change', $event)"
    >
      <v-btn value="week" outlined>
        Weekly View
      </v-btn>

      <v-btn value="month" outlined>
        Monthly View
      </v-btn>
    </v-btn-toggle>

    <v-spacer></v-spacer>

    <v-toolbar-title>
      {{ title }}
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <v-btn
      text
      class="mr-4"
      dark
      @click="$emit('today')"
    >
      Go to Today
    </v-btn>

    <v-btn
      icon
      x-large
      @click="$emit('prev')"
    >
      <v-icon>mdi-chevron-left</v-icon>
    </v-btn>

    <v-btn
      icon
      x-large
      @click="$emit('next')"
    >
      <v-icon>mdi-chevron-right</v-icon>
    </v-btn>
  </v-toolbar>
</template>

<script>
export default {
  name: 'CalendarTitleBar',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: String,
      default: 'week'
    },
    title: {
      type: String,
      default: ''
    }
  },
}
</script>
<template>
  <v-text-field
    label="Password"
    :rules="validationRules"
    :append-icon="showPW ? 'mdi-eye-off' : 'mdi-eye'"
    :type="showPW ? 'text' : 'password'"
    :value="value"
    v-bind="$attrs"
    validate-on-blur
    autocomplete="new-password"
    @click:append="showPW = !showPW"
    @input="$emit('input', $event)"
  ></v-text-field>
</template>

<script>
  export default {
    name: 'PasswordField',
    model: {
      prop: 'value',
      event: 'input'
    },
    props: {
      value: {
        type: String,
        default: ''
      },
      isOptional: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        showPW: false,
      }
    },
    computed: {
      validationRules(){
        const isRequired = (value) => !!value || 'Required'

        const rules = []

        if (!this.isOptional) {
          rules.push(isRequired)
        }

        return rules
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
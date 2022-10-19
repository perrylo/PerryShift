<template>
  <v-text-field
    label="Email"
    :rules="validationRules"
    :value="value"
    v-bind="$attrs"
    validate-on-blur
    @input="$emit('input', $event)"
  ></v-text-field>
</template>

<script>
  export default {
    name: 'EmailField',
    model: {
      prop: 'value',
      event: 'input'
    },
    props: {
      value: {
        type: String,
        default: ''
      },
      extraValidation: {
        type: Function,
        default: () => true
      }
    },
    computed: {
      validationRules(){
        const isRequired = value => !!value || 'Required'
        const isValidEmail = value => {
          const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return emailRegex.test(value) || 'Please enter valid email'
        }

        return [isRequired, isValidEmail, this.extraValidation]
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
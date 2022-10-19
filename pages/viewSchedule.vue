<template>
  <div>
    <h1>Hi <span class="green--text ">{{authUser?.claims?.name || ''}}</span>, here is your schedule</h1>
    {{userShiftsDoc.shifts.length}} shift{{userShiftsDoc.shifts.length !== 1 ? 's':''}}

    <CalendarTitleBar
      v-model="type"
      :title="$refs?.calendar ? $refs.calendar.title : ''"
      @today="calendarValue=''"
      @prev="$refs.calendar.prev()"
      @next="$refs.calendar.next()"
    ></CalendarTitleBar>

    <div :style="{ height: type==='week' ? 'auto' : '700px' }">
      <v-calendar
        ref="calendar"
        v-model="calendarValue"
        color="primary"
        event-color="green"
        :type="type"
        :events="userShiftsDoc.shifts"
        :event-ripple="false"
        @click:date="handleDateClick"
      >
      </v-calendar>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CalendarTitleBar from '../components/CalendarTitleBar.vue'

export default {
  name: 'ViewSchedule',
  components: {
    CalendarTitleBar
  },
  async asyncData({ $fire, store }) {
    let userShiftsDocId, userShiftsDoc
    await $fire.firestore
      .collection('userShifts')
      .where('uid', '==', store.getters.authUser.uid)
      .get()
      .then(querySnapshot => {
        // There should only be one userShifts doc for this user...
        userShiftsDocId = querySnapshot.docs[0].id
        userShiftsDoc = querySnapshot.docs[0].data()
      })
      .catch((err) => {
        console.error('Error fetching userShifts doc from Firebase', err)
      })

    return { userShiftsDocId, userShiftsDoc }
  },
  data(){
    return {
      calendarValue: undefined,

      type: 'week',
      types: ['month', 'week'],
    }
  },
  computed:{
    ...mapGetters(['authUser']),
  },
  mounted() {
    // Calendar title is derived from value which is calendar date, but
    // this value is access via a $ref, so we reset this value on mount
    // to refresh title so that it display on load
    this.calendarValue = ''
  },
  methods: {
    handleDateClick(e){
      this.calendarValue = e.date
      this.type = 'week'
    },
  }
}
</script>
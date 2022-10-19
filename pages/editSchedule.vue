<template>
  <div>
    <h1>
      <nuxt-link to="/users" style="text-decoration:none;">Staff List</nuxt-link>
      > Schedule for <span class="green--text ">{{user.displayName}}</span>
    </h1>

    <div style="display:flex; justify-content:space-between; align-items:center;">
      {{userShiftsDoc?.shifts?.length || 0 }} shift{{userShiftsDoc?.shifts?.length !== 1 ? 's':''}}

      <v-tooltip
        v-model="showTooltip"
        left
        color="#424242ff"
      >
        <template #activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            color="primary"
            text
            v-on="on"
          >
            help
            <v-icon small right>mdi-help</v-icon>
          </v-btn>
        </template>
        <p><b>CREATE</b> a new shift by clicking and dragging on any empty slots in the calendar</p>
        <p><b>RESCHEDULE</b> any shift by dragging it to a new time.  <b>ADJUST</b> any shift length by dragging its lower edge</p>
        <p><b>DELETE</b> any shift by clicking the delete button</p>
        <p>All changes are automatically saved</p>
        <p>Have a nice day.</p>
      </v-tooltip>
    </div>

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
        @mousedown:event="startDrag"
        @mousedown:time="startTime"
        @mousemove:time="mouseMove"
        @mouseup:time="endDrag"
        @mouseleave.native="cancelDrag"
      >
        <template #event="{ event, timed, eventSummary }">
          <div class="v-event-draggable">
            <component :is="{ render: eventSummary }"></component>
          </div>
          <v-btn x-small outlined color="white" @click="deleteEvent(event)">delete</v-btn>
          <div
            v-if="timed"
            class="v-event-drag-bottom"
            @mousedown.stop="extendBottom(event)"
          ></div>
        </template>
      </v-calendar>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CalendarTitleBar from '../components/CalendarTitleBar.vue'

export default {
  name: 'EditSchedule',
  components: {
    CalendarTitleBar
  },
  async asyncData({ $fire, store, redirect }) {
    if (!store.getters?.user?.uid) {
      // Protect against browser refreshes, which destroys state without which this view cannot render
      redirect('/users')
    } else {
      let userShiftsDocId, userShiftsDoc
      await $fire.firestore
        .collection('userShifts')
        .where('uid', '==', store.getters.user.uid)
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
    }
  },
  data(){
    return {
      showTooltip: false,

      calendarValue: undefined,

      type: 'week',
      types: ['month', 'week'],

      dragEvent: null,
      dragStart: null,
      createEvent: null,
      createStart: null,
      extendOriginal: null,
    }
  },
  computed:{
    ...mapGetters(['user']),
  },
  mounted() {
    // Calendar title is derived from value which is calendar date, but
    // this value is accessed via a $ref, so we reset this value on mount
    // to refresh title so that it displays on load
    this.calendarValue = ''
  },
  methods: {
    handleDateClick(e){
      this.calendarValue = e.date
      this.type = 'week'
    },
    deleteEvent(event) {
      const i = this.userShiftsDoc.shifts.findIndex(d => d===event)
      this.userShiftsDoc.shifts.splice(i,1)
      this.saveUserShiftsDoc()
    },
    saveUserShiftsDoc() {
      this.$fire.firestore
        .collection('userShifts')
        .doc(this.userShiftsDocId)
        .set(this.userShiftsDoc)
    },
    // Here to end of methods is mostly boilerplate code from Vuetify
    // See https://vuetifyjs.com/en/components/calendars/
    startDrag ({ event, timed }) {
      if (event && timed) {
        this.dragEvent = event
        this.dragTime = null
        this.extendOriginal = null
      }
    },
    startTime (tms) {
      const mouse = this.toTime(tms)

      if (this.dragEvent && this.dragTime === null) {
        const start = this.dragEvent.start

        this.dragTime = mouse - start
      } else {
        this.createStart = this.roundTime(mouse)
        this.createEvent = {
          name: `Work Shift #${this.userShiftsDoc.shifts.length+1}`,
          start: this.createStart,
          end: this.createStart,
          timed: true,
        }

        this.userShiftsDoc.shifts.push(this.createEvent)
      }
    },
    extendBottom (event) {
      this.createEvent = event
      this.createStart = event.start
      this.extendOriginal = event.end
    },
    mouseMove (tms) {
      const mouse = this.toTime(tms)

      if (this.dragEvent && this.dragTime !== null) {
        const start = this.dragEvent.start
        const end = this.dragEvent.end
        const duration = end - start
        const newStartTime = mouse - this.dragTime
        const newStart = this.roundTime(newStartTime)
        const newEnd = newStart + duration

        this.dragEvent.start = newStart
        this.dragEvent.end = newEnd
      } else if (this.createEvent && this.createStart !== null) {
        const mouseRounded = this.roundTime(mouse, false)
        const min = Math.min(mouseRounded, this.createStart)
        const max = Math.max(mouseRounded, this.createStart)

        this.createEvent.start = min
        this.createEvent.end = max
      }
    },
    endDrag () {
      this.dragTime = null
      this.dragEvent = null
      this.createEvent = null
      this.createStart = null
      this.extendOriginal = null

      this.saveUserShiftsDoc()
    },
    cancelDrag () {
      if (this.createEvent) {
        if (this.extendOriginal) {
          this.createEvent.end = this.extendOriginal
        } else {
          const i = this.userShiftsDoc.shifts.indexOf(this.createEvent)
          if (i !== -1) {
            this.userShiftsDoc.shifts.splice(i, 1)
          }
        }
      }

      this.createEvent = null
      this.createStart = null
      this.dragTime = null
      this.dragEvent = null
    },
    roundTime (time, down = true) {
      const roundTo = 15 // minutes
      const roundDownTime = roundTo * 60 * 1000

      return down
        ? time - time % roundDownTime
        : time + (roundDownTime - (time % roundDownTime))
    },
    toTime (tms) {
      return new Date(tms.year, tms.month - 1, tms.day, tms.hour, tms.minute).getTime()
    },
  }
}
</script>

<style scoped lang="scss">
  .v-event-draggable {
    padding-left: 6px;
  }

  .v-event-timed {
    user-select: none;
    -webkit-user-select: none;
  }

  .v-event-drag-bottom {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 4px;
    height: 4px;
    cursor: ns-resize;

    &::after {
      display: none;
      position: absolute;
      left: 50%;
      height: 4px;
      border-top: 1px solid white;
      border-bottom: 1px solid white;
      width: 16px;
      margin-left: -8px;
      opacity: 0.8;
      content: '';
    }

    &:hover::after {
      display: block;
    }
  }
  </style>
<template>
    <div>
        <v-menu
         class="datepicker-menu"
          ref="menu"
          v-model="show_start_datepicker"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              class="mr-4 mt-5"
              style="width: 200px; flex: none; background: none"
              v-model="start_time"
              placeholder="开始时间"
              append-icon="mdi-calendar-clock"
              readonly
              rows="1"
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="start_time"
            :allowed-dates="allowedStartDate"
            no-title
            scrollable
            :show-current="false"
            @input="show_start_datepicker = false"
            :day-format="date => date.split('-')[2]"
            locale="zh-cn"
          >
          </v-date-picker>
        </v-menu>
        <v-menu
          class="datepicker-menu"
          ref="menu"
          v-model="show_end_datepicker"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              class="mr-4 mt-5"
              style="width: 200px; flex: none; background: none"
              v-model="end_time"
              placeholder="结束时间"
              append-icon="mdi-calendar-clock"
              readonly
              rows="1"
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="end_time"
            :allowed-dates="allowedEndDate"
            no-title
            scrollable
            :show-current="false"
            @input="show_end_datepicker = false"
            :day-format="date => date.split('-')[2]"
            locale="zh-cn"
          >
          </v-date-picker>
        </v-menu>
    </div>
  </template>
  
  <script>
  export default {
    name: "AuditLogLogin",
    data() {
      return {
        show_start_datepicker: false,
        show_end_datepicker: false,
        start_time: null,
        end_time: null,
      };
    },
    methods: {
      allowedStartDate(val) {
        if (this.end_time) {
          let cur = new Date(val).getTime();
          let end = new Date(this.end_time).getTime();
  
          return cur < end;
        }
        return true;
      },
      allowedEndDate(val) {
        if (this.start_time) {
          let cur = new Date(val).getTime();
          let end = new Date(this.start_time).getTime();
          return cur > end;
        }
        return true;
      }
    }
   
  };
  </script>
  
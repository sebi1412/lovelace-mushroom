import {
    HassEntityAttributeBase,
    HassEntityBase,
  } from "home-assistant-js-websocket";


  export type SensorEntity = HassEntityBase & {
    attributes: HassEntityAttributeBase & {
      device_class: string;
      last_reset: Date;
      native_unit_of_measurement: string;
      native_value: any;
      suggested_unit_of_measurement: string;
    };
  };
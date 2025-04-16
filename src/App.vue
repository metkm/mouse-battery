<script setup lang="ts">
import { ref } from "vue";
import { getDevice, getEepromBuffer, getUsbCrc, setArrayEeprom, setByteEeprom } from "./utils";
import handle from "./handle.js";

const battery = ref(0);

const handleClick = async () => {
  const device = await getDevice();
  if (!device) return;

  if (!device.opened) {
    await device.open();
  }

  device.oninputreport = (event) => {
    const data = new Uint8Array(event.data.buffer);
    console.log(data);

    const dataCommand = data[0];
    const flashData = [];

    if (dataCommand === 4) {
      battery.value = data[5];
    } else if (dataCommand === 8) {
      const addr = (data[2] << 8) + data[3];
      const len = data[4];

      for (var i = 0; i < len; i++) {
        flashData[addr + i] = data[5 + i];
      }

      console.log(flashData)
    }
  };

  let data = Uint8Array.of(
    0x08,
    0x00,
    0x04 >> 8,
    0x04 & 0xff,
    2,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0xef
  );

  const crc = getUsbCrc(data);
  data[15] = crc - 0x08;

  await device.sendReport(0x08, data);
};
</script>

<template>
  <div>
    <button @click="handleClick">request device</button>
    <p>{{ battery }}</p>
  </div>
</template>

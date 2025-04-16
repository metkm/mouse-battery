<script setup lang="ts">
import { ref } from 'vue';
import { getDevice, getUsbCrc } from './utils';

const battery = ref(0)

const handleClick = async () => {
  const device = await getDevice()
  if (!device) return;

  if (!device.opened) {
    await device.open();
  }

  device.oninputreport = (event) => {
    const data = new Uint8Array(event.data.buffer);
    const dataCommand = data[0];

    if (dataCommand === 4) {
      battery.value = data[5]
    }
  };

  let data = Uint8Array.of(
    0x04,
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
    0x00,
    0x00,
    0x00,
    0x00,
    0xef
  );

  const crc = getUsbCrc(data)
  data[15] = crc  - 0x08;

  await device.sendReport(0x08, data)
};
</script>

<template>
  <div>
    <button @click="handleClick">request device</button>
    <p>{{ battery }}</p>
  </div>
</template>

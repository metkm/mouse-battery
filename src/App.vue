<script setup lang="ts">
import { ref } from 'vue';

const battery = ref(0)

function getUsbCrc(value: Uint8Array<ArrayBuffer>) {
  let crc = 0;
  for (let i = 0; i < value.length - 1; i++) {
    crc += value[i];
  }
  crc = crc & 0xff;
  crc = 0x55 - crc;

  return crc;
}

const handleClick = async () => {
  const devices = await navigator.hid.requestDevice({
    filters: [],
  });

  const device =
    devices.length > 0
      ? devices.find((device) => {
          return device.collections.find((c) => {
            return (
              c.inputReports!.length === 1 &&
              c.outputReports!.length === 1 &&
              c.outputReports![0].reportId === 0x08
            );
          });
        })
      : devices[0];

  if (!device) return;

  await device.open();

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

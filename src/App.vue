<script setup lang="ts">
const handleClick = async () => {
  const devices = await navigator.hid.requestDevice({
    filters: [],
  });

  const device =
    devices.length > 0
      ? devices.find((device) => {
          return device.collections.find((c) => {
            return c.inputReports!.length === 1 && c.outputReports!.length === 1 && c.outputReports![0].reportId === 0x08;
          });
        })
      : devices[0];

  console.log(devices, device)
  if (!device) return

  await device.open()
  
  device.oninputreport = (event) => {
    const data = new Uint8Array(event.data.buffer);
    const dataCommand = data[0]

    console.log(data)

    if (dataCommand === 4) {
      console.log(data[5])
    }
  }
  
};
</script>

<template>
  <button @click="handleClick">request device</button>
</template>

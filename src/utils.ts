export const getUsbCrc = (value: Uint8Array<ArrayBuffer>) => {
  let crc = 0;
  for (let i = 0; i < value.length - 1; i++) {
    crc += value[i];
  }
  crc = crc & 0xff;
  crc = 0x55 - crc;

  return crc;
}

export const getDevice = async () => {
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

  return device
}

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

export const getEepromBuffer = async (address: number, length: number) => {
  let data = Uint8Array.of(0x08, 0x00, address >> 8, address & 0xFF, length, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xef);

  return data
}


export const setByteEeprom = (address: number, value: number) => {
  let data = Uint8Array.of(0x07, 0x00, address >> 8, address & 0xFF, 0x02, 0x08, 0x4d,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xef);

  data[5] = value
  // data[6] = 0x55 - value;

  return data
}

export const setArrayEeprom = (address: number, value: number[]) => {
  let data = Uint8Array.of(0x07, 0x00, address >> 8, address & 0xFF, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xef);

  var cnt = (value.length % 10);
  cnt = (cnt > 0) ? (Math.floor(value.length / 10) + 1) : Math.floor(value.length / 10);
  console.log("setArrayEeprom:", cnt, value.length, value);
  for (var i = 0; i < cnt; i++) {
    var add = (address + i * 10);
    var len = ((((i + 1) * 10) > value.length) ? (value.length - (i * 10)) : 10);

    data[0] = 0x07;
    data[1] = 0x00;
    console.log("setArrayEeprom len", len);
    data[2] = add >> 8;
    data[3] = add & 0xFF;
    data[4] = len;
    for (var j = 0; j < 10; j++) {
      if (j < len)
        data[5 + j] = value[j + i * 10];
      else
        data[5 + j] = 0;
    }

    // data[15] = getUsbCrc(data) - ReportId;
    // await write(data);
  }

  return data
}

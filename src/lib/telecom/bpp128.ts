import { BPPTelemetryPayload } from "../types/disaster";

export function encodeBPP128(payload: BPPTelemetryPayload): Uint8Array {
  const buffer = new Uint8Array(14);
  const view = new DataView(buffer.buffer);

  view.setUint8(0, ((payload.version & 0x0F) << 4) | (payload.timeStepIndex & 0x0F));
  view.setUint16(1, payload.sectorId, false); // false = Big-Endian
  view.setUint8(3, payload.hazardBitmap);
  view.setUint8(4, payload.surgeDecimeters);

  // 24-bit Route & Shelter Packing
  view.setUint8(5, (payload.safeRouteId >> 4) & 0xFF);
  view.setUint8(6, ((payload.safeRouteId & 0x0F) << 4) | ((payload.shelterId >> 8) & 0x0F));
  view.setUint8(7, payload.shelterId & 0xFF);

  view.setUint32(8, payload.populationAtRisk, false); // Big-Endian uint32
  const crc = computeCrc16CcittFalse(buffer.subarray(0, 12));
  view.setUint16(12, crc, false);

  return buffer;
}

export function computeCrc16CcittFalse(data: Uint8Array): number {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= (data[i] << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc;
}

export function decodeBPP128(input: Uint8Array | string): BPPTelemetryPayload {
  let buffer: Uint8Array;
  if (typeof input === "string") {
    const hex = input.startsWith("0x") ? input.slice(2) : input;
    if (hex.length !== 28) throw new Error(`Invalid BPP-128 Hex length: ${hex.length}`);
    buffer = new Uint8Array(14);
    for (let i = 0; i < 14; i++) {
      buffer[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }
  } else {
    buffer = input;
  }

  if (buffer.byteLength !== 14) throw new Error(`Invalid BPP-128 buffer length: ${buffer.byteLength}`);

  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const computedCrc = computeCrc16CcittFalse(buffer.subarray(0, 12));
  const frameCrc = view.getUint16(12, false);
  if (computedCrc !== frameCrc) {
    throw new Error(`CRC-16 mismatch: frame=${frameCrc.toString(16)}, computed=${computedCrc.toString(16)}`);
  }

  const byte0 = view.getUint8(0);
  const version = (byte0 >> 4) & 0x0F;
  const timeStepIndex = byte0 & 0x0F;
  const sectorId = view.getUint16(1, false);
  const hazardBitmap = view.getUint8(3);
  const surgeDecimeters = view.getUint8(4);

  const byte5 = view.getUint8(5);
  const byte6 = view.getUint8(6);
  const byte7 = view.getUint8(7);

  const safeRouteId = (byte5 << 4) | ((byte6 >> 4) & 0x0F);
  const shelterId = ((byte6 & 0x0F) << 8) | byte7;
  const populationAtRisk = view.getUint32(8, false);

  return {
    version,
    timeStepIndex,
    sectorId,
    hazardBitmap,
    surgeDecimeters,
    safeRouteId,
    shelterId,
    populationAtRisk,
  };
}

export function bpp128ToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export function bpp128ToBase64(buffer: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buffer).toString("base64");
  }
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

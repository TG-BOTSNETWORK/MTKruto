import { Connection } from "../connection/connection.ts";
import { bufferFromBigInt, concat } from "../utilities/0_buffer.ts";
import { CTR } from "./0_crypto.ts";

export async function getObfuscationParameters(
  protocol: number,
  connection: Connection,
) {
  const dc = 0xfcff;

  let init: Uint8Array;

  while (true) {
    init = concat(
      crypto.getRandomValues(new Uint8Array(56)),
      bufferFromBigInt(protocol, 4, false),
      bufferFromBigInt(dc, 2, false),
      crypto.getRandomValues(new Uint8Array(2)),
    );

    if (init[0] == 0xef) {
      continue;
    }

    const dataView = new DataView(init.buffer);
    const firstInt = dataView.getInt32(0);
    // deno-fmt-ignore
    if ([0x44414548, 0x54534f50, 0x20544547, 0x4954504f, 0x02010316, 0xdddddddd, 0xeeeeeeee].includes(firstInt)) {
            continue;
          }

    const secondInt = dataView.getInt32(4);
    if (secondInt == 0x00000000) {
      continue;
    }

    break;
  }

  const encryptKey = init.slice(8, 8 + 32);
  const encryptIv = init.slice(40, 40 + 16);
  const encryptionCTR = new CTR(encryptKey, encryptIv);

  const encryptedInit = encryptionCTR.encrypt(init);

  const initRev = new Uint8Array(init).reverse();
  const decryptKey = initRev.slice(8, 8 + 32);
  const decryptIv = initRev.slice(40, 40 + 16);
  const decryptionCTR = new CTR(decryptKey, decryptIv);

  await connection.write(concat(
    init.slice(0, 56),
    encryptedInit.slice(56, 56 + 8),
  ));

  return { encryptionCTR, decryptionCTR };
}
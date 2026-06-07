import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { Injectable } from '@nestjs/common';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
    return `scrypt$${salt}$${derivedKey.toString('hex')}`;
  }

  async verify(password: string, storedHash: string): Promise<boolean> {
    const [algorithm, salt, hash] = storedHash.split('$');
    if (algorithm !== 'scrypt' || !salt || !hash) {
      return false;
    }

    const expected = Buffer.from(hash, 'hex');
    const actual = (await scrypt(password, salt, expected.length)) as Buffer;

    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }
}

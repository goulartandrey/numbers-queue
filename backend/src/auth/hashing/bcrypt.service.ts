import * as bcrypt from 'bcrypt';
import { HashingService } from './hashing.service';

export class BcryptService extends HashingService {
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async compare(pass: string, hashedPass: string): Promise<boolean> {
    return await bcrypt.compare(pass, hashedPass);
  }
}

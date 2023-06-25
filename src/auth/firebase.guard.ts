import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { GetStreamService } from 'src/getstream/getstream.service';

@Injectable()
export class FirebaseGuard implements CanActivate {
  constructor(private readonly getStreamService: GetStreamService) {}
  async canActivate(context: ExecutionContext) {
    try {
      const req = context.switchToHttp().getRequest();
      const authorization = req.headers['authorization'] || '';
      if (!authorization) throw new ForbiddenException('Invalid token');
      if (!authorization.startsWith('Bearer'))
        throw new ForbiddenException('Invalid token');
      const token = authorization.substr(7);
      // verify token
      const user = await admin
        .auth()
        .verifyIdToken(token)
        .catch((e) => {
          throw new ForbiddenException(e);
        });
      const getStreamToken = this.getStreamService.getUserToken(user.uid);
      user.getStreamToken = getStreamToken;
      req.user = user;
      return req;
    } catch (e) {
      throw new ForbiddenException(e.response.message);
    }
  }
}

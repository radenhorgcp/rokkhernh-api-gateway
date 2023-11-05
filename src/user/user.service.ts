import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable, map, catchError, from, concatMap } from 'rxjs';
import * as admin from 'firebase-admin';
import { CreateRequest } from 'firebase-admin/lib/auth/auth-config';
import { GetStreamService } from 'src/getstream/getstream.service';
import { CreateUserDto } from './dto/create-user.dto';
import { DefaultGenerics, FollowStatsAPIResponse, StreamUser } from 'getstream';
import { IndexType, SearchService } from 'src/search/search.service';
import { UpdateUserDto } from './dto/updare-user-dto';

@Injectable()
export class UserService {
  constructor(
    private readonly httpService: HttpService,
    private readonly getStreamService: GetStreamService,
    readonly esService: SearchService,
  ) {}

  registerUserWp(req: any): Observable<AxiosResponse<any>> {
    return this.httpService.post(`/wp-json/wp/v2/users`, req).pipe(
      map((axiosResponse: AxiosResponse) => {
        const user = axiosResponse.data;
        const payload: CreateRequest = {
          uid: `${user.id}`,
          email: user.email,
        };
        if (req.provider == 'google') {
          payload.providerToLink.providerId = 'google.com';
        } else if (req.provider == 'facebook') {
          payload.providerToLink.providerId = 'facebook.com';
        } else {
          payload.password = req.password;
        }
        admin.auth().createUser(payload);
        return user;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  meWp(id: number): Observable<AxiosResponse<any>> {
    return this.httpService.get(`/wp-json/wp/v2/users/${id}`).pipe(
      map((axiosResponse: AxiosResponse) => {
        return axiosResponse.data;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  async fakeToken(id: any): Promise<any> {
    const token = await admin.auth().createCustomToken(`${id}`);
    return this.httpService
      .post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyCHQl-fCTvhbPjIhY_8mUMAf7BNIP-BirA`,
        { token, returnSecureToken: true },
      )
      .pipe(
        map((axiosResponse: AxiosResponse) => {
          return axiosResponse.data;
        }),
        catchError((e) => {
          throw new HttpException(e.response.data, e.response.status);
        }),
      );
  }

  async registerUser(req: CreateUserDto): Promise<any> {
    const payload: CreateRequest = {
      uid: `${req.username}`,
      email: req.email,
    };
    if (req.provider == 'google') {
      // payload.providerToLink.providerId = 'google.com';
    } else if (req.provider == 'facebook') {
      // payload.providerToLink.providerId = 'facebook.com';
    } else {
      payload.password = req.password;
    }
    return from(admin.auth().createUser(payload)).pipe(
      concatMap(() => {
        delete req['password'];
        return from(
          this.getStreamService
            .getClient()
            .user(req.username)
            .getOrCreate(req as any),
        ).pipe(
          map((user: StreamUser<DefaultGenerics>) => {
            this.esService.createIndex(user, IndexType.USER);
            return user.data;
          }),
          catchError((e) => {
            console.log(e.response.status);
            throw new HttpException(e.response.data, e.response.status);
          }),
        );
      }),
      catchError((e) => {
        if (e.errorInfo) {
          throw new HttpException(e.errorInfo.message, HttpStatus.BAD_REQUEST);
        }
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  async me(id: string): Promise<any> {
    return from(this.getStreamService.getClient().user(id).get()).pipe(
      map((user: StreamUser<DefaultGenerics>) => {
        return user.data;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  async updateUser(id: string, update: UpdateUserDto): Promise<any> {
    return from(this.getStreamService.getClient().user(id).get()).pipe(
      concatMap((res: StreamUser<DefaultGenerics>) => {
        return from(
          this.getStreamService
            .getClient()
            .user(id)
            .update({ ...res.data, ...update }),
        ).pipe(
          map((user: StreamUser<DefaultGenerics>) => {
            return user.data;
          }),
          catchError((e) => {
            throw new HttpException(e.response.data, e.response.status);
          }),
        );
      }),
    );
  }

  async followStat(userID: string): Promise<any> {
    const feed = this.getStreamService.getClient().feed('user', userID);
    return from(feed.followStats()).pipe(
      map((res: FollowStatsAPIResponse) => {
        return res;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }
}

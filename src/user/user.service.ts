import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable, map, catchError } from 'rxjs';
import * as admin from 'firebase-admin';
import { CreateRequest } from 'firebase-admin/lib/auth/auth-config';

@Injectable()
export class UserService {
  constructor(private readonly httpService: HttpService) {}

  registerUser(req: any): Observable<AxiosResponse<any>> {
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

  me(id: number): Observable<AxiosResponse<any>> {
    return this.httpService.get(`/wp-json/wp/v2/users/${id}`).pipe(
      map((axiosResponse: AxiosResponse) => {
        return axiosResponse.data;
      }),
      catchError((e) => {
        throw new HttpException(e.response.data, e.response.status);
      }),
    );
  }

  async fakeToken(): Promise<any> {
    const token = await admin.auth().createCustomToken('25');
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
}

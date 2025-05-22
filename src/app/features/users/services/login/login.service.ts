import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { tap } from 'rxjs/operators';

// 定义登录请求和响应接口
export interface UserLoginDTO {
  account: string;
  password: string;
}

export interface UserLoginVO {
  token: string;
  userId: string;
  account: string;
}

export interface ResultUserLoginVO {
  code: number;
  data: UserLoginVO;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  
  private readonly apiUrl = environment.apiUrl;
  constructor(private readonly http: HttpClient) { }

  /**
   * 用户登录
   * @param credentials 登录凭证
   * @returns 登录结果Observable
   */
  login(credentials: UserLoginDTO): Observable<ResultUserLoginVO> {
    return this.http.post<ResultUserLoginVO>(`${environment.apiUrl}/userLogin`, credentials)
      .pipe(
        tap(response => {
          if (response.code === 200 && response.data?.token) {
            // 保存token到本地存储
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('user_id', response.data.userId);
            localStorage.setItem('account', response.data.account);
          }
        })
      );
  }

  /**
   * 退出登录
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('account');
  }

  /**
   * 检查用户是否已登录
   * @returns 是否已登录
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  /**
   * 获取当前用户Token
   * @returns 用户Token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * 获取当前用户ID
   * @returns 用户ID
   */
  getUserId(): string | null {
    return localStorage.getItem('user_id');
  }

  /**
   * 获取当前用户账号
   * @returns 用户账号
   */
  getAccount(): string | null {
    return localStorage.getItem('account');
  }
}

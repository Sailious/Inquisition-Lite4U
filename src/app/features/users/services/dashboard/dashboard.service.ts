import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { AuthApiService } from '@app/core/services/auth-api.service';

// 数据模型定义
export interface Result<T> {
  code: number;
  msg: string;
  data: T;
}

// 账号详情主类型
export interface AccountDTO {
  id: number;
  name: string;
  account: string;
  password: string;
  freeze: number;
  server: number;
  taskType: string;
  config: Config;
  active: Active;
  notice: Notice;
  refresh: number;
  agent: number;
  createTime: string;
  updateTime: string;
  expireTime: string;
  delete: number;
  blimitDevice: string[];
}

export interface UserStatusSTO {
  server: number;
  lastLogin: string;
  status: string;
  account?: string;
}

export interface LogDTO {
  id: number;
  content: string;
  level: string;
  taskType: string;
  title: string;
  detail: string;
  imageUrl: string;
  time: string;
}

// 配置信息类型
export interface Config {
  daily: DailyConfig;
}

// 日常任务配置
export interface DailyConfig {
  fight: FightItem[];
  sanity: SanityConfig;
  mail: boolean;
  offer: OfferConfig;
  friend: boolean;
  infrastructure: InfrastructureConfig;
  credit: boolean;
  task: boolean;
  activity: boolean;
  cultivation: boolean;
  cultivation_plan: any[];
  fight_enable: boolean;
}

// 战斗配置项
export interface FightItem {
  level: string;
  num: number;
}

// 理智消耗配置
interface SanityConfig {
  drug: number;
  stone: number;
}

// 公招配置
interface OfferConfig {
  enable: boolean;
  car: boolean;
  star4: boolean;
  star5: boolean;
  star6: boolean;
  other: boolean;
}

// 基建配置
interface InfrastructureConfig {
  harvest: boolean;
  shift: boolean;
  acceleration: boolean;
  communication: boolean;
  deputy: boolean;
}

// 肉鸽配置


// 干员配置
interface RogueOperatorConfig {
  index: number;
  num: number;
  skill: number;
}

// 跳过配置
interface RogueSkipConfig {
  coin: boolean;
  beast: boolean;
  daily: boolean;
  sensitive: boolean;
  illusion: boolean;
  survive: boolean;
}

// 活跃时间配置
export interface Active {
  monday: ActiveDayConfig;
  tuesday: ActiveDayConfig;
  wednesday: ActiveDayConfig;
  thursday: ActiveDayConfig;
  friday: ActiveDayConfig;
  saturday: ActiveDayConfig;
  sunday: ActiveDayConfig;
}

// 单日活跃配置
export interface ActiveDayConfig {
  enable: boolean;
  detail: any[];
}

// 通知配置
interface Notice {
  wxUID: NoticeChannel;
  qq: NoticeChannel;
  mail: NoticeChannel;
}

// 通知渠道配置
interface NoticeChannel {
  text: string;
  enable: boolean;
}



@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient,
  private authApi: AuthApiService
  ) { }
  
  // 替换所有this.getHeaders() 为 this.authApi.getAuthHeaders()
  private getHeaders() {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
  
  // 更新账号信息
  updateAccount(payload: Partial<AccountDTO>): Observable<Result<string>> {
    return this.http.post<Result<string>>(
      `${this.apiUrl}/updateMyAccount`, 
      payload,
      { headers: this.authApi.getAuthHeaders() }
    );
  }

  private mapFormToDailyConfig(formValue: any): DailyConfig {
    return {
      fight: formValue.tasks.map((task: any) => ({
        level: task.level,
        num: task.num
      })),
      fight_enable: formValue.battle,
      credit: formValue.mall,
      friend: formValue.friend,
      activity: formValue.activity,
      mail: formValue.mail,
      offer: {
        enable: formValue.recruit,
        car: formValue.novice,
        star4: formValue.fourStar,
        star5: formValue.fiveStar,
        star6: formValue.sixStar,
        other: formValue.other
      },
      infrastructure: {
        harvest: formValue.collect,
        shift: formValue.schedule,
        acceleration: formValue.accelerate,
        communication: formValue.drone,
        deputy: formValue.deputy
      },
      sanity: {
        drug: formValue.medicine,
        stone: formValue.stone
      },
      task: false,
      cultivation: false,
      cultivation_plan: []
    };
  }

  // 获取当前账号信息
  getMyAccount(): Observable<Result<AccountDTO>> {
    return this.http.get<Result<AccountDTO>>(`${this.apiUrl}/showMyAccount`, {
      headers: this.authApi.getAuthHeaders()
    });
  }

  // 更新账号密码
  updatePassword(account: string, password: string, server: number): Observable<Result<string>> {
    return this.http.post<Result<string>>(`${this.apiUrl}/updateAccountAndPassword`, {
      account,
      password,
      server
    }, { headers: this.authApi.getAuthHeaders() });
  }

  // 查询账号状态
  getAccountStatus(): Observable<Result<UserStatusSTO>> {
    return this.http.get<Result<UserStatusSTO>>(`${this.apiUrl}/showMyStatus`, { 
      headers: this.authApi.getAuthHeaders() 
    });
  }

  // 获取剩余刷新次数
  getRefreshCount(): Observable<Result<number>> {
    return this.http.get<Result<number>>(`${this.apiUrl}/getRefresh`, { 
      headers: this.authApi.getAuthHeaders() 
    });
  }

  // 查询日志（带分页）
  getLogs(current: number, size: number): Observable<Result<PageQueryVO<LogDTO>>> {
    const params = new HttpParams()
      .set('current', current)
      .set('size', size);
    
    return this.http.get<Result<PageQueryVO<LogDTO>>>(`${this.apiUrl}/showMyLog`, { 
      params,
      headers: this.authApi.getAuthHeaders() 
    });
  }

  // 查询当前理智
  getSanity(): Observable<Result<string>> {
    return this.http.get<Result<string>>(`${this.apiUrl}/showMySan`, { 
      headers: this.authApi.getAuthHeaders() 
    });
  }

  // 立即开始作战
  startNow(): Observable<Result<string>> {
    return this.http.post<Result<string>>(`${this.apiUrl}/startNow`, {}, { 
      headers: this.authApi.getAuthHeaders() 
    });
  }

  // 冻结账号
  freezeAccount(): Observable<Result<string>> {
    return this.http.post<Result<string>>(`${this.apiUrl}/freezeMyAccount`, {}, { 
      headers: this.authApi.getAuthHeaders() 
    });
  }

  // 解冻账号
  unfreezeAccount(): Observable<Result<string>> {
    return this.http.post<Result<string>>(`${this.apiUrl}/unfreezeMyAccount`, {}, { 
      headers: this.authApi.getAuthHeaders() 
    });
  }
}



// 更新分页返回类型定义
export interface PageQueryVO<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}

// 删除文件底部重复的mapFormToDailyConfig方法定义



import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { DashboardService, UserStatusSTO, LogDTO, AccountDTO, Result } from '../../services/dashboard/dashboard.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AccountDialogComponent } from '../../components/account-dialog/account-dialog.component';
import { BattleConfigDialogComponent } from '../../components/battle-config-dialog/battle-config-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  providers: [MatSnackBar],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  username = '用户';
  accountStatus?: UserStatusSTO;
  accountInfo?: AccountDTO;
  logs: LogDTO[] = [];
  refreshCount = 0;
  sanityValue = '0';
  isLoading = false;
  isFrozen = false;  // 新增冻结状态属性
  refreshDisabled = false;  // 新增刷新禁用状态属性
  lastLoginTime = '未知';
  battleConfig: any = null; // 存储作战配置

  constructor(
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  openBattleConfig() {
    const dialogRef = this.dialog.open(BattleConfigDialogComponent, {
      width: '600px',
      data: {
        config: this.battleConfig
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // 保存配置
        this.battleConfig = result;
        this.showMessage('作战配置已更新');
      }
    });
  }

  private loadDashboardData() {
    this.isLoading = true;

    // 获取账号状态
    this.dashboardService.getAccountStatus().subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.accountStatus = response.data;
          this.isFrozen = response.data.status.includes('冻结');
        }
      }
    });

    // 获取账号信息
    this.dashboardService.getMyAccount().subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.accountInfo = response.data;
          this.username = this.accountInfo.account || '用户';
          this.lastLoginTime = this.formatDate(this.accountInfo.updateTime);
        }
      }
    });

    // 获取刷新次数
    this.dashboardService.getRefreshCount().subscribe({
      next: (response) => {
        this.refreshDisabled = response.data === 0;
      }
    });
    this.dashboardService.getLogs(1, 5).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.logs = response.data.records;
        } else {
          this.showMessage(response.msg || '获取日志失败');
        }
      },
      error: (error) => this.showMessage('获取日志失败')
    });

    // 获取刷新次数
    this.dashboardService.getRefreshCount().subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.refreshCount = response.data;
        } else {
          this.showMessage(response.msg || '获取刷新次数失败');
        }
      },
      error: (error) => this.showMessage('获取刷新次数失败')
    });

    // 获取理智值
    this.dashboardService.getSanity().subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.sanityValue = response.data.includes('严重错误') ? '账号冻结中' : response.data;
          // 需要先在类中声明isFrozen属性
          (this as any).isFrozen = response.data.includes('严重错误');
        }
      },
      error: (error) => this.showMessage('获取理智值失败')
    });

    this.isLoading = false;
  }

  startNow() {
    this.dashboardService.startNow().subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.showMessage('作战已开始');
          this.loadDashboardData(); // 刷新数据
        } else {
          this.showMessage(response.msg || '开始作战失败');
        }
      },
      error: (error) => this.showMessage('开始作战失败')
    });
  }

  freezeAccount(): void {
    this.dashboardService.freezeAccount().subscribe({
      next: (response: Result<string>) => {
        if (response.code === 200) {
          this.showMessage('账号已冻结');
          this.loadDashboardData(); // 刷新数据
        } else {
          this.showMessage(response.msg || '冻结账号失败');
        }
      },
      error: (error: { error?: { msg: string } }) => this.showMessage('冻结账号失败')
    });
  }

  unfreezeAccount(): void {
    this.dashboardService.unfreezeAccount().subscribe({
      next: (response: Result<string>) => {
        if (response.code === 200) {
          this.showMessage('账号已解冻');
          this.loadDashboardData(); // 刷新数据
        } else {
          this.showMessage(response.msg || '解冻账号失败');
        }
      },
      error: (error: { error?: { msg: string } }) => this.showMessage('解冻账号失败')
    });
  }

  logout() {
    // 清除所有认证存储
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('auth_token');
    
    // 跳转登录页并强制刷新
    this.router.navigate(['/user/login']).then(() => {
      window.location.reload();
    });
  }

  editAccount() {
    const dialogRef = this.dialog.open(AccountDialogComponent, {
      width: '400px',
      data: {
        account: this.accountInfo?.account,
        server: this.accountInfo?.server,
        expireTime: this.accountInfo?.expireTime,
        refresh: this.accountInfo?.refresh
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // 如果对话框返回true，表示更新成功，刷新数据
        this.loadDashboardData();
      }
    });
  }

  private showMessage(message: string) {
    this.snackBar.open(message, '关闭', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  // 格式化日期
  public formatDate(dateStr?: string): string {
    if (!dateStr) return '未知';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  }
}

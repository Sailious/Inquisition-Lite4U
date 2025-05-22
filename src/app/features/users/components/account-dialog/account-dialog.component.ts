import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-account-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './account-dialog.component.html',
  styleUrls: ['./account-dialog.component.scss']
})
export class AccountDialogComponent implements OnInit {
  accountForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AccountDialogComponent>,
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.accountForm = this.fb.group({
      account: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      server: [0, Validators.required]
    });
  }

  ngOnInit(): void {
    // 如果有传入数据，填充表单
    if (this.data && this.data.account) {
      this.accountForm.patchValue({
        account: this.data.account,
        server: this.data.server || 1
      });
    }
  }

  onSubmit(): void {
    if (this.accountForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const { account, password, server } = this.accountForm.value;

    this.dashboardService.updatePassword(account, password, server).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.code === 200) {
          this.showMessage('账号密码更新成功');
          this.dialogRef.close(true);
        } else {
          this.showMessage(response.msg || '更新失败');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.showMessage('更新失败，请稍后重试');
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, '关闭', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  // 格式化日期
  formatDate(dateStr?: string): string {
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
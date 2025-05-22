import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService, UserLoginDTO } from '../../services/login/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class LoginComponent  {

  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly loginService: LoginService,
    private readonly router: Router
  ) {
    this.loginForm = this.fb.group({
      account: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }


  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const credentials: UserLoginDTO = this.loginForm.value;
    this.loginService.login(credentials).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.router.navigate(['/user/dashboard']); // 修正跳转路径
        } else {
          this.errorMessage = response.message || '登录失败';
          this.isSubmitting = false;
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? '登录失败，请检查网络连接';
        this.isSubmitting = false;
      }
    });
  }
}
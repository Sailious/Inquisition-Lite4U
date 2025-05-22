import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DashboardService, Result, AccountDTO, FightItem, DailyConfig, Active, Config } from '../../services/dashboard/dashboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';


@Component({
  selector: 'app-battle-config-dialog',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    CommonModule, FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
  ],
  templateUrl: './battle-config-dialog.component.html',
  styleUrls: ['./battle-config-dialog.component.scss']
})
export class BattleConfigDialogComponent implements OnInit {
  configForm: FormGroup;
  isSubmitting = false;
  isLoading = true;
  fightLevels: string[] = ['jm', 'hd', 'ce', 'ls','1-7'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BattleConfigDialogComponent>,
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { account?: AccountDTO }
  ) {
    this.configForm = this.fb.group({
      tasks: this.fb.array([], [Validators.minLength(1), Validators.required]),
      battle: [false],
      mall: [false],
      friend: [false],
      activity: [false],
      mail: [false],
      recruit: [false],
      novice: [false],
      fourStar: [false],
      fiveStar: [false],
      sixStar: [false],
      other: [false],
      schedule: [false],
      deputy: [false],
      collect: [false],
      accelerate: [false],
      drone: [false],
      medicine: [0, [Validators.required, Validators.min(0)]],
      stone: [0, [Validators.required, Validators.min(0)]],
      monday: false,  
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    });
  }

  ngOnInit(): void {
    this.loadAccountConfig();
  }

  private loadAccountConfig(): void {
    this.dashboardService.getMyAccount().subscribe({
      next: (res: Result<AccountDTO>) => {
        this.isLoading = false;
        if (res.code === 200 && res.data) {
          this.loadFormData(res.data);
        } else {
          this.showError('配置加载失败');
        }
      },
      error: (err: { error?: { msg: string } }) => {  
        this.isLoading = false;
        this.showError(`配置加载失败：${err.error?.msg || '网络错误'}`);
      }
    });
  }

  private loadFormData(account: AccountDTO): void {
    const daily = account.config.daily || this.getDefaultDailyConfig(); 
    const active = account.active || this.getDefaultActiveConfig();

    const tasksFormArray = this.tasksFormArray;
    tasksFormArray.clear();
    (daily.fight || []).forEach(task => {
      tasksFormArray.push(this.fb.group({
        level: [task.level, Validators.required],
        num: [task.num, [Validators.required, Validators.min(1)]]
      }));
    });
    if (tasksFormArray.length === 0) this.addTask();

    this.configForm.patchValue({
      battle: daily.fight_enable,
      mall: daily.credit,
      friend: daily.friend,
      activity: daily.activity,
      mail: daily.mail,
      recruit: daily.offer.enable,
      novice: daily.offer.car,
      fourStar: daily.offer.star4,
      fiveStar: daily.offer.star5,
      sixStar: daily.offer.star6,
      other: daily.offer.other,
      schedule: daily.infrastructure.shift,
      deputy: daily.infrastructure.deputy,
      collect: daily.infrastructure.harvest,
      accelerate: daily.infrastructure.acceleration,
      drone: daily.infrastructure.communication,
      medicine: daily.sanity.drug,
      stone: daily.sanity.stone,
      monday: active.monday.enable,
      tuesday: active.tuesday.enable,
      wednesday: active.wednesday.enable,
      thursday: active.thursday.enable,
      friday: active.friday.enable,
      saturday: active.saturday.enable,
      sunday: active.sunday.enable
    });
  }

  onSubmit(): void {
    if (this.configForm.invalid) return;

    this.isSubmitting = true;
    const formValue = this.configForm.value;
    

    this.dashboardService.getMyAccount().subscribe({
      next: (res: Result<AccountDTO>) => {
        if (res.code === 200 && res.data) {
          const updatePayload = {
            account: res.data.account,
            taskType: 'daily',
            config: {
              daily: this.mapFormToDailyConfig(formValue)
            },
            active: {  
              monday: { enable: formValue.monday, detail: res.data.active.monday.detail },  
              tuesday: { enable: formValue.tuesday, detail: res.data.active.tuesday.detail },
              wednesday: { enable: formValue.wednesday, detail: res.data.active.wednesday.detail },
              thursday: { enable: formValue.thursday, detail: res.data.active.thursday.detail },
              friday: { enable: formValue.friday, detail: res.data.active.friday.detail },
              saturday: { enable: formValue.saturday, detail: res.data.active.saturday.detail },
              sunday: { enable: formValue.sunday, detail: res.data.active.sunday.detail }
            }
          };
        
          this.dashboardService.updateAccount(updatePayload).subscribe({
            next: (updateRes: Result<string>) => {
              if (updateRes.code === 200) {
                this.showSuccess('配置保存成功');
                this.dialogRef.close(updatePayload);
              } else {
                this.showError(updateRes.msg);
              }
            },
            error: (err) => {
              this.showError(`保存失败：${err.error?.msg || '网络错误'}`);
            },
            complete: () => this.isSubmitting = false
          });
        } else {
          this.showError('获取账号信息失败');
          this.isSubmitting = false;
        }
      },
      error: (err) => {
        this.showError(`获取账号信息失败：${err.error?.msg || '网络错误'}`);
        this.isSubmitting = false;
      }
    });
}

  private mapFormToDailyConfig(formValue: any): DailyConfig {
    return {
      fight: formValue.tasks.map((task: FightItem) => ({
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
        shift: formValue.schedule,
        deputy: formValue.deputy,
        harvest: formValue.collect,
        acceleration: formValue.accelerate,
        communication: formValue.drone
      },
      sanity: {
        drug: formValue.medicine,
        stone: formValue.stone
      },
      task: true,
      cultivation: false,
      cultivation_plan: []
    };
  }

  private getDefaultAccount(): AccountDTO {
    return {
      id: 0,
      name: '',
      account: '',
      password: '',
      freeze: 0,
      server: 0,
      taskType: '',
      config: this.getDefaultConfig(),
      active: this.getDefaultActiveConfig(),
      notice: this.getDefaultNotice(),
      refresh: 0,
      agent: 0,
      createTime: '',
      updateTime: '',
      expireTime: '',
      delete: 0,
      blimitDevice: []
    };
  }

  private getDefaultConfig(): Config {
    return { daily: this.getDefaultDailyConfig() };
  }

  private getDefaultDailyConfig(): DailyConfig {
    return {
      fight: [],
      sanity: { drug: 0, stone: 0 },
      mail: false,
      offer: { enable: false, car: false, star4: false, star5: false, star6: false, other: false },
      friend: false,
      infrastructure: { harvest: false, shift: false, acceleration: false, communication: false, deputy: false },
      credit: false,
      task: false,
      activity: false,
      cultivation: false,
      cultivation_plan: [],
      fight_enable: false
    };
  }

  private getDefaultActiveConfig(): Active {
    return {
      monday: { enable: false, detail: [] },
      tuesday: { enable: false, detail: [] },
      wednesday: { enable: false, detail: [] },
      thursday: { enable: false, detail: [] },
      friday: { enable: false, detail: [] },
      saturday: { enable: false, detail: [] },
      sunday: { enable: false, detail: [] }
    };
  }

  private getDefaultNotice(): AccountDTO['notice'] {
    return {
      wxUID: { text: '', enable: false },
      qq: { text: '', enable: false },
      mail: { text: '', enable: false }
    };
  }

  get tasksFormArray(): FormArray {
    return this.configForm.get('tasks') as FormArray;
  }

  addTask(): void {
    this.tasksFormArray.push(this.fb.group({
      level: ['', Validators.required],
      num: [1, [Validators.required, Validators.min(1)]]
    }));
  }

  removeTask(index: number): void {
    if (this.tasksFormArray.length > 1) {
      this.tasksFormArray.removeAt(index);
    }
  }

  moveUp(index: number): void {
    if (index > 0) {
      const control = this.tasksFormArray.controls[index];
      this.tasksFormArray.removeAt(index);
      this.tasksFormArray.insert(index - 1, control);
    }
  }

  moveDown(index: number): void {
    if (index < this.tasksFormArray.length - 1) {
      const control = this.tasksFormArray.controls[index];
      this.tasksFormArray.removeAt(index);
      this.tasksFormArray.insert(index + 1, control);
    }
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, '关闭', { duration: 3000 });
  }

  showError(message: string): void {
    this.snackBar.open(message, '关闭', { duration: 3000, panelClass: ['error-snackbar'] });
  }
}
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    
  ],
  providers: [],
  // 由于 AppComponent 是独立组件,需要移除 bootstrap 配置
})
export class AppModule { }
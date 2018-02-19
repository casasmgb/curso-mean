import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule } from '@angular/forms';
//import { HttpModule } from '@angular/http';
//modulo para hacer peticiones ajax y http a una api
import {HttpClientModule} from '@angular/common/http';
import {routing, appRoutingProviders} from './app.routing';
//Cargar Componentes
import { AppComponent } from './app.component';
import { LoginComponent } from './componentes/login/login.component';
import { RegisterComponent } from './componentes/register/register.component';

@NgModule({
  //directivas componentes y pipes
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    //cargar modulos
    BrowserModule,
    FormsModule,
    routing,
    HttpClientModule
  ],
  providers: [
    //servicios de manera global
    appRoutingProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

//componets
import { LoginComponent } from './componentes/login/login.component';
import { RegisterComponent } from './componentes/register/register.component';

const appRoutes : Routes=[
    {path:'', component:LoginComponent},
    {path:'login', component:LoginComponent},
    {path:'registro', component:RegisterComponent}
];

export const appRoutingProviders:any[]=[];
export const routing: ModuleWithProviders=RouterModule.forRoot(appRoutes);

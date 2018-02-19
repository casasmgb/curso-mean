import {Component, OnInit} from '@angular/core';
import {Route, ActivatedRoute, Params, Router} from '@angular/router';
import {User} from '../../models/user'; //../../ dalir del directorio de register y luego salir del directorio de components
import {UserService} from '../../services/user.service';

@Component({
    selector:'register',
    templateUrl:'./register.component.html',
    //cargar los servicios en provides.
    providers:[UserService]
})
export class RegisterComponent implements OnInit{
    public title:string;
    public user: User;
    public status:string;

    constructor(
        private _route:ActivatedRoute,
        private _router:Router,
        private _userService:UserService
    ){
        this.title = 'Registrate';
        this.user =  new User("","","","","","","ROLE_USER","");

    }
    ngOnInit(){
        console.log('Componente de registro cargado');
    }
    onSubmit(form){
        this._userService.register(this.user).subscribe(
            response=>{
                if(response.user && response.user._id){
                    //console.log(response.user);
                    this.status="success";
                    form.reset();
                }else{
                    this.status='error';
                }
            },
            error=>{
                console.log(<any>error);
            }
        );
    }
}
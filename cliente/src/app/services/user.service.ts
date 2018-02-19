import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {User} from '../models/user';
import {Global} from './global'

@Injectable()
export class UserService{
    public url: string;
    constructor(public _http:HttpClient ){
        this.url=Global.url;
    }
    register(user : User) : Observable<any>{
    //recibe un objeto tipo User, retorna un Observable de tipo any       
    //json convertido a string 
        let json = JSON.stringify(user);
        let headers = new HttpHeaders().set('Content-Type','application/json');
        //aqui se manda una peticions post a una url del backend
        return this._http.post(this.url+'register',json, {headers:headers});
        
        }    
}
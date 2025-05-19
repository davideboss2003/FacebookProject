import { Routes } from '@angular/router';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { RegisterPageComponent } from './register-page/register-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { MainPageComponent } from './main-page/main-page.component';
import { UserPageComponent } from './user-page/user-page.component';
import { PostsPageComponent } from './posts-page/posts-page.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', component: WelcomePageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'main', component: MainPageComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginPageComponent },
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  { path: 'user', component: UserPageComponent },
  { path: 'posts', component: PostsPageComponent },
];

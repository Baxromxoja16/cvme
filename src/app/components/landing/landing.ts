import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class LandingComponent implements OnInit {
  authService = inject(AuthService);
  route = inject(ActivatedRoute);

  ngOnInit() {
    // Check for query params if this is a callback
    this.route.queryParams.subscribe(params => {
      if (params['token'] && params['slug']) {
        this.authService.handleLoginCallback(params['token'], params['slug']);
      }
    });
  }

  login() {
    this.authService.loginWithGoogle();
  }
}

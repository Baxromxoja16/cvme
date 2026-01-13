import { inject } from '@angular/core';
import { Routes, UrlSegment } from '@angular/router';
import { adminRoutes } from './components/admin/admin.routes';
import { LandingComponent } from './components/landing/landing';
import { PublicProfileComponent } from './components/public-profile/public-profile';
import { AuthService } from './services/auth';

// Simple guard
const authGuard = () => {
    const auth = inject(AuthService);
    if (!auth.currentUser()) {
        // Redirect to login or landing?
        // simple return false for now
        return false;
    }
    return true;
};

// Matcher for subdomain
export function subdomainMatcher(url: UrlSegment[]) {
    // Check if we have a subdomain in the hostname
    const hostname = window.location.hostname; // e.g. user.cvme.com or user.localhost
    const parts = hostname.split('.');

    // Logic: if parts > 2 (user.cvme.com) OR (parts === 2 && localhost is involved e.g. user.localhost)
    // AND the subdomain is NOT 'www', 'admin', 'app'
    let isSubdomain = false;
    if (parts.length > 2) isSubdomain = true;
    if (parts.length === 2 && parts[1].includes('localhost') && parts[0] !== 'www') {
        isSubdomain = true;
    }

    if (isSubdomain) {
        // It is a profile request
        return { consumed: url }; // Consume all segments so we show the component at root
    }
    return null;
}

export const routes: Routes = [
    { path: 'profile/:slug', component: PublicProfileComponent },
    { path: 'admin', canActivate: [authGuard], children: adminRoutes },
    { path: 'login-success', loadComponent: () => import('./components/landing/landing').then(m => m.LandingComponent) },
    {
        matcher: subdomainMatcher,
        component: PublicProfileComponent
    },
    { path: 'uz', component: LandingComponent },
    { path: 'ru', component: LandingComponent },
    { path: 'en', component: LandingComponent },
    { path: 'blog/:slug', loadComponent: () => import('./components/blog/blog').then(m => m.BlogComponent) },
    { path: '', redirectTo: 'uz', pathMatch: 'full' },
];

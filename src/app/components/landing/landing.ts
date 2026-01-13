import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';

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
  titleService = inject(Title);
  metaService = inject(Meta);

  content = signal<any>(null);
  currentLang = signal<string>('uz');

  translations: any = {
    uz: {
      title: 'Onlayn vizitka yaratish — Shaxsiy portfoliongizni 10 soniyada yarating',
      description: 'Qog\'oz vizitkalarni unuting. Shaxsiy portfolio va vizitkangizni bepul yarating. Uz domeni va tayyor shablonlar!',
      h1: 'Onlayn vizitka yaratish — Shaxsiy portfoliongizni 10 soniyada yarating',
      p: 'Digital tashrif qog\'ozingiz va shaxsiy brendingiz uchun yagona platforma. Beul vizitka sayt, QR kod va shaxsiy subdomain.',
      cta: 'Google orqali boshlash',
      faqTitle: 'Ko\'p beriladigan savollar',
      faqs: [
        { q: 'CVME.UZ da vizitka yaratish tekinmi?', a: 'Ha, asosiy funksiyalar va shaxsiy subdomain mutlaqo bepul.' },
        { q: 'QR kodli vizitkani qanday ulashish mumkin?', a: 'Saytingiz yaratilgach, QR kod avtomatik generatsiya bo\'ladi va uni skanerlash orqali kontaktlaringizni yubora olasiz.' }
      ]
    },
    ru: {
      title: 'Создать визитку онлайн бесплатно — Конструктор цифрового портфолио',
      description: 'Самый простой способ создать личный сайт-визитку. Твой домен, твоё портфолио, твой бренд. Попробуй сейчас!',
      h1: 'Создать визитку онлайн бесплатно — Конструктор портфолио',
      p: 'Персональная страница и цифровое резюме за 1 минуту. Личный домен, QR-визитка и современный дизайн.',
      cta: 'Начать через Google',
      faqTitle: 'Часто задаваемые вопросы',
      faqs: [
        { q: 'Как получить свой домен вида имя.cvme.uz?', a: 'Просто зарегистрируйтесь и выберите любой свободный логин — ваш сайт будет готов мгновенно.' },
        { q: 'Работает ли визитка на мобильных телефонах?', a: 'Да, все сайты CVME.UZ полностью адаптивны и отлично выглядят на любых устройствах.' }
      ]
    },
    en: {
      title: 'Digital Business Card Maker — Build Your Online Portfolio in Seconds',
      description: 'Create your personal landing page in seconds. Better than a link-in-bio. Your own subdomain. Start for free.',
      h1: 'Digital Business Card Maker — Build Your Portfolio',
      p: 'The minimalist platform for your personal brand and digital presence. Custom Subdomain, QR Code, and Pro Templates.',
      cta: 'Get Started with Google',
      faqTitle: 'Frequently Asked Questions',
      faqs: [
        { q: 'Is it really free to create a digital vCard?', a: 'Yes, our core features including custom subdomains are free for everyone.' },
        { q: 'Can I use CVME for my Instagram Link in Bio?', a: 'Absolutely! CVME is designed to be the perfect landing page for your social profile links.' }
      ]
    }
  };

  ngOnInit() {
    // Detect language from path
    const path = window.location.pathname.split('/')[1];
    const lang = this.translations[path] ? path : 'uz';
    this.currentLang.set(lang);
    this.content.set(this.translations[lang]);
    this.updateSEO(lang);

    // Check for query params if this is a callback
    this.route.queryParams.subscribe(params => {
      if (params['token'] && params['slug']) {
        this.authService.handleLoginCallback(params['token'], params['slug']);
      }
    });
  }

  updateSEO(lang: string) {
    const c = this.translations[lang];
    this.titleService.setTitle(c.title);
    this.metaService.updateTag({ name: 'description', content: c.description });
    
    // Local SEO Geotagging
    if (lang === 'uz') {
      this.metaService.updateTag({ name: 'geo.region', content: 'UZ' });
      this.metaService.updateTag({ name: 'geo.placename', content: 'Tashkent' });
    }

    // FAQ JSON-LD Schema
    this.injectFAQSchema(c.faqs);
  }

  injectFAQSchema(faqs: any[]) {
    // Remove old schema script if exists
    const oldScript = document.getElementById('faq-schema');
    if (oldScript) oldScript.remove();

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a
        }
      }))
    };

    const script = document.createElement('script');
    script.id = 'faq-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  login() {
    this.authService.loginWithGoogle();
  }
}

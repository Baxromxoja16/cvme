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
  currentLang = signal<string>('en');

  translations: any = {
    uz: {
      title: 'Sizning ismingiz — Sizning brendingiz | ism.cvme.uz da shaxsiy sayt',
      description: 'O\'zingiz uchun ism.cvme.uz ko\'rinishidagi bepul vizitka sayt va onlayn portfolio yarating. Dasturchilar va mutaxassislar uchun eng qulay tanlov!',
      h1: 'Shaxsiy brendingizni bitta linkda birlashtiring',
      p: 'ism.cvme.uz ko\'rinishidagi shaxsiy subdomen, zamonaviy dizayn va cheksiz imkoniyatlar. Portfolio yaratish endi juda oson.',
      cta: 'Google orqali kirish',
      faqTitle: 'Ko\'p so\'raladigan savollar',
      faqs: [
        { q: 'Subdomen olish uchun pul to\'lash kerakmi?', a: 'Yo\'q, ismingiz.cvme.uz formatidagi subdomen har doim bepul bo\'lib qoladi.' },
        { q: 'Saytim Googleda chiqadimi?', a: 'Albatta! Bizning tizim har bir foydalanuvchi sahifasini qidiruv tizimlari uchun avtomatik optimallashtiradi.' }
      ]
    },
    ru: {
      title: 'Твоё имя — Твой бренд | Личный сайт на имя.cvme.uz',
      description: 'Создайте персональный сайт-визитку и онлайн портфолио бесплатно на домене cvme.uz. Идеально для разработчиков и фрилансеров.',
      h1: 'Ваше портфолио теперь на вашем личном субдомене',
      p: 'Получите адрес вида имя.cvme.uz и покажите свои проекты миру. Быстро, стильно и полностью бесплатно.',
      cta: 'Продолжить через Google',
      faqTitle: 'Вопросы и ответы',
      faqs: [
        { q: 'Нужно ли знать программирование?', a: 'Нет, создание вашей страницы занимает 10 секунд и не требует навыков кодинга.' },
        { q: 'Можно ли использовать это как Link in Bio?', a: 'Да, cvme.uz — это лучшая и более профессиональная альтернатива Linktree для Instagram и Telegram.' }
      ]
    },
    en: {
      title: 'Your Name is Your Brand | Personal Site at name.cvme.uz',
      description: 'Build your personal landing page and online portfolio for free. Get your own name.cvme.uz subdomain in seconds.',
      h1: 'Everything you are, in one simple link',
      p: 'Claim your professional name.cvme.uz subdomain. The ultimate portfolio builder for developers, designers, and creators.',
      cta: 'Continue via Google',
      faqTitle: 'Common Questions',
      faqs: [
        { q: 'How do I share my digital card?', a: 'Once created, simply copy your unique link (name.cvme.uz) and paste it into your social bio or CV.' },
        { q: 'Is it mobile friendly?', a: 'Yes, every CVME page is perfectly optimized for all devices and screen sizes.' }
      ]
    }
  };

  ngOnInit() {
    // Detect language from path
    const path = window.location.pathname.split('/')[1];
    const lang = this.translations[path] ? path : 'en';
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

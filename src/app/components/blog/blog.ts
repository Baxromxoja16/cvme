import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-white">
      <div class="max-w-4xl mx-auto px-4 py-12">
        <a href="/" class="text-blue-600 hover:underline mb-8 inline-block"><- Back to Home</a>
        
        @if (article()) {
          <article class="prose prose-lg max-w-none">
            <h1 class="text-4xl font-extrabold text-gray-900 mb-6">{{ article().title }}</h1>
            <div class="text-gray-600 leading-relaxed space-y-4">
              <p>{{ article().content }}</p>
              <!-- More article content would go here -->
            </div>
          </article>
        } @else {
          <div class="text-center py-20">
            <h1 class="text-2xl text-gray-400">Article not found</h1>
          </div>
        }
      </div>
    </div>
  `
})
export class BlogComponent implements OnInit {
  route = inject(ActivatedRoute);
  article = signal<any>(null);

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    // For now, these are placeholders. In a real app, these would come from an API or a local JSON file.
    if (slug === 'paper-cards-obsolete') {
      this.article.set({
        title: 'Why paper business cards are obsolete in 2026',
        content: 'In a digital-first world, carrying cards that run out, get lost, or become outdated is a thing of the past. CVME provides a sustainable, dynamic, and professional alternative...'
      });
    }
  }
}

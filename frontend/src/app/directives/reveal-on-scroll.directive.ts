import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

export type RevealVariant = 'fade-up' | 'fade' | 'fade-left' | 'fade-right' | 'zoom';

@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class RevealOnScrollDirective implements OnInit, OnDestroy {
  @Input() revealDelay = 0;
  @Input() revealVariant: RevealVariant = 'fade-up';
  @Input() revealThreshold = 0.15;
  @Input() revealOnce = true;

  private observer?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  ngOnInit(): void {
    const node = this.el.nativeElement;
    this.renderer.addClass(node, 'reveal');
    this.renderer.addClass(node, `reveal-${this.revealVariant}`);
    if (this.revealDelay > 0) {
      this.renderer.setStyle(node, 'transition-delay', `${this.revealDelay}ms`);
    }

    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      this.renderer.addClass(node, 'is-visible');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            this.renderer.addClass(target, 'is-visible');
            if (this.revealOnce) {
              this.observer?.unobserve(target);
            }
          } else if (!this.revealOnce) {
            this.renderer.removeClass(target, 'is-visible');
          }
        });
      },
      { threshold: this.revealThreshold, rootMargin: '0px 0px -60px 0px' }
    );

    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}


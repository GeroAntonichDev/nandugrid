import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-watermark-overlay',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pointer-events-none absolute inset-0',
  },
  template: `
    @if (visible) {
      <span
        class="absolute bottom-3 right-3 rounded-sm border border-white/20 bg-black/20 px-2 py-1 font-display text-[10px] font-medium uppercase tracking-[0.16em] text-white/60"
      >
        {{ label }}
      </span>
    }
  `,
})
export class WatermarkOverlayComponent {
  @Input() visible = true;
  @Input() text = 'ÑANDUGRID';
  @Input() authorUsername?: string;

  get label(): string {
    return this.authorUsername ? `${this.text} · @${this.authorUsername}` : this.text;
  }
}

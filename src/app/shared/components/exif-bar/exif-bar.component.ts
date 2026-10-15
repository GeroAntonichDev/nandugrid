import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ExifData } from '../../../core/models/photo.model';

@Component({
  selector: 'app-exif-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-white/5 bg-ink-900/60 px-4 py-2.5 text-[11px] uppercase tracking-wider text-neutral-500"
    >
      @if (exif.camera) {
        <span class="normal-case tracking-normal text-neutral-400">{{ exif.camera }}</span>
      }
      @if (exif.iso) {
        <span>ISO {{ exif.iso }}</span>
      }
      @if (exif.aperture) {
        <span>{{ exif.aperture }}</span>
      }
      @if (exif.shutter) {
        <span>{{ exif.shutter }}</span>
      }
      @if (exif.focalLength) {
        <span>{{ exif.focalLength }}</span>
      }
      @if (exif.lens) {
        <span class="truncate normal-case tracking-normal text-neutral-400">{{ exif.lens }}</span>
      }
    </div>
  `,
})
export class ExifBarComponent {
  @Input({ required: true }) exif!: ExifData;
}

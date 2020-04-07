import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ConversionService } from '../../services/conversion.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import Image from 'image-js';
import { Palette } from '../../services/conversion.types';
import { Pixel } from '../canvas/canvas.component';
import { Color } from '../../models/color';

@Component({
    selector: 'app-preview',
    templateUrl: './preview.component.html',
    styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit, OnDestroy {
    public previewImage: SafeUrl;

    public image: Image;
    public originalImage: Image;
    public palette: Palette = [];

    private unsubscribe$ = new Subject();

    sizeFactorValue: number;
    colorCountValue: number;

    selectedPixel: Pixel;

    get colorCount() {
        return this.colorCountValue;
    }

    set colorCount(value) {
        this.colorCountValue = value;
    }

    get sizeFactor() {
        return this.sizeFactorValue;
    }

    set sizeFactor(value) {
        this.sizeFactorValue = Math.min(Math.max(value, 1), 100);
    }

    constructor(
        public conversionService: ConversionService,
        public domSanitizer: DomSanitizer,
        public cd: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.conversionService.quantizedImageObservable.pipe(takeUntil(this.unsubscribe$)).subscribe(
            ({ image, originalImage, palette, colors, sizeFactor }) => {
                this.clear();

                this.palette = palette;
                this.image = image;
                this.originalImage = originalImage;

                this.colorCountValue = colors;
                this.sizeFactor = sizeFactor * 100;

                this.previewImage = this.domSanitizer.bypassSecurityTrustUrl(
                    'data:image/jpeg;base64, ' + image.toBase64(),
                );
            },
            e => {
                console.error(e);
            },
        );
    }

    onGenerate() {
        this.conversionService.sizeFactor$.next(this.sizeFactorValue / 100);
        this.conversionService.colors$.next(this.colorCountValue);
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    getDimension(dimension: 'width' | 'height') {
        return Math.floor(this.originalImage[dimension] * (this.sizeFactor / 100));
    }

    onPixelSelected(pixel: Pixel) {
        this.selectedPixel = pixel;
    }

    clear() {
        this.selectedPixel = undefined;
    }

    isColorHighlighted(color: Color) {
        return this.selectedPixel && color.toString() === this.selectedPixel.color.toString();
    }

    hasHighlighted() {
        return this.palette.some(color => this.isColorHighlighted(color));
    }

    onSelectColor(color: Color) {
        if (this.isColorHighlighted(color)) {
            this.selectedPixel = undefined;
        }
    }
}

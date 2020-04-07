import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ConversionService } from '../../services/conversion.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import Image from 'image-js';
import { Palette } from '../../services/conversion.types';
import { Color } from '../../models/color';
import { saveSvgAsPng } from 'save-svg-as-png';

const MAX_IMAGE_SIZE = 500;

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
    isDownloading = false;

    sizeFactorValue: number;
    colorCountValue: number;

    selectedColor: Color;

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
                this.clearSelectedColor();

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

    onColorSelected(color: Color) {
        this.selectedColor = color;
    }

    clearSelectedColor() {
        this.selectedColor = undefined;
    }

    isColorSelected(color: Color) {
        return this.selectedColor && this.selectedColor.toString() === color.toString();
    }

    hasHighlighted() {
        return this.palette.some(color => this.isColorSelected(color));
    }

    onSelectColor(color: Color) {
        if (this.isColorSelected(color)) {
            this.clearSelectedColor();
        } else {
            this.selectedColor = color;
        }
    }

    getSliderMaxFactor() {
        return Math.min(
            Math.round(
                Math.min(
                    Math.min(MAX_IMAGE_SIZE / this.originalImage.height),
                    MAX_IMAGE_SIZE / this.originalImage.width,
                ) * 100,
            ),
            100,
        );
    }

    onDownload() {
        if (!this.isDownloading) {
            this.isDownloading = true;

            setTimeout(() => {
                saveSvgAsPng(document.getElementById('canvas'), 'canvas.png', { scale: 1 }).then(() => {
                    this.isDownloading = false;
                });
            });
        }
    }
}

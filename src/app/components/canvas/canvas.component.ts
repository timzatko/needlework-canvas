import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    NgZone,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import Image from 'image-js';
import { Color } from '../../models/color';

const PIXEL_SIZE = 8;
const SPACE_WIDTH = 1;
const LINE_WIDTH = 1;
const BLOCK_WIDTH = PIXEL_SIZE + SPACE_WIDTH + LINE_WIDTH;

export interface Pixel {
    x: number;
    y: number;
    color: Color;
}

export interface SvgPixel {
    pixel: Pixel;
    x: number;
    y: number;
}

@Component({
    selector: 'app-canvas',
    templateUrl: './canvas.component.html',
    styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit, OnChanges {
    @Input()
    image: Image;

    @Input()
    selectedColor: Color;

    @Output()
    selectColor = new EventEmitter<Color>();

    width: number;
    height: number;

    lineWidth = LINE_WIDTH;
    pixelSize = PIXEL_SIZE;
    lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    svgPixels: SvgPixel[] = [];

    constructor(public cd: ChangeDetectorRef) {}

    ngOnInit(): void {}

    ngOnChanges(changes: SimpleChanges): void {
        if ('image' in changes) {
            this.clear();

            const image = changes.image.currentValue;

            if (image) {
                setTimeout(() => {
                    this.draw(image);
                });
            }
        }
    }

    draw(image: Image) {
        this.resizeCanvas(image);

        setTimeout(() => {
            this.drawLines(image);
            this.drawPixels(image);
        });
    }

    clear() {
        this.lines = [];
    }

    onPixelClick(selectedPixel: Pixel) {
        if (this.isPixelSelected(selectedPixel)) {
            this.selectedColor = undefined;
        } else {
            this.selectedColor = selectedPixel.color;
        }

        this.selectColor.emit(this.selectedColor);
        this.cd.detectChanges();
    }

    isPixelSelected(pixel: Pixel) {
        return this.selectedColor && this.selectedColor.toString() === pixel.color.toString();
    }

    trackByFn(index: number, svgPixel: SvgPixel) {
        return svgPixel.pixel.toString();
    }

    private resizeCanvas(image: Image) {
        this.width = image.width * BLOCK_WIDTH;
        this.height = image.height * BLOCK_WIDTH;
    }

    private drawLines(image: Image) {
        const { width, height } = image;
        const LINE_OFFSET = PIXEL_SIZE + SPACE_WIDTH;

        // draw vertical lines
        for (let i = 0; i < width - 1; i++) {
            const x = BLOCK_WIDTH * i + LINE_OFFSET;
            this.lines.push({ x1: x, y1: 0, x2: x, y2: height * BLOCK_WIDTH });
        }

        for (let i = 0; i < height - 1; i++) {
            const y = BLOCK_WIDTH * i + LINE_OFFSET;
            this.lines.push({ x1: 0, y1: y, x2: width * BLOCK_WIDTH, y2: y });
        }
    }

    private drawPixels(image: Image) {
        const { width } = image;
        const data = image.getRGBAData();

        for (let i = 0; i < data.length; i += 4) {
            const pixelNumber = i / 4;
            const x = pixelNumber % width;
            const y = Math.floor(pixelNumber / width);

            this.svgPixels.push({
                x: x * BLOCK_WIDTH,
                y: y * BLOCK_WIDTH,
                pixel: {
                    x,
                    y,
                    color: new Color(data[i], data[i + 1], data[i + 2], data[i + 3]),
                },
            });
        }
    }
}

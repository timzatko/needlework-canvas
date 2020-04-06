import { Injectable } from '@angular/core';
import { Image } from 'image-js';
import { BehaviorSubject, combineLatest, from, Observable } from 'rxjs';
import { filter, flatMap, map, tap } from 'rxjs/operators';
import { Palette, QuantizedImage, State } from './conversion.types';
import { Color } from '../models/color';
import RgbQuant from 'rgbquant';

const MaxAnyDimension = 80;

function getIdealSizeFactor(sizeFactor: number, image: Image) {
    sizeFactor = Math.min(MaxAnyDimension / image.width, sizeFactor);
    return Math.round(Math.min(MaxAnyDimension / image.height, sizeFactor) * 100) / 100;
}

function loadRawImage([rawImage, sizeFactor]: [string | ArrayBuffer, number]): Observable<{
    originalImage: Image;
    resizedImage: Image;
    sizeFactor: number;
}> {
    // @ts-ignore
    return from(Image.load(rawImage)).pipe(
        map((image: Image) => {
            if (sizeFactor === Infinity) {
                sizeFactor = getIdealSizeFactor(sizeFactor, image);
            }
            return { originalImage: image, resizedImage: image.resize({ factor: sizeFactor }), sizeFactor };
        }),
    );
}

function formatPalette(rawPalette: Uint8Array): Palette {
    const palette: Palette = [];

    for (let i = 0; i < rawPalette.length; i += 4) {
        const r = rawPalette[i];
        const g = rawPalette[i + 1];
        const b = rawPalette[i + 2];
        const a = rawPalette[i + 3];

        palette.push(new Color(r, g, b, a));
    }

    return palette;
}

function quantizeImage([{ originalImage, resizedImage, sizeFactor }, colors]: [
    { originalImage: Image; resizedImage: Image; sizeFactor: number },
    number,
]): QuantizedImage {
    const { width, height, alpha } = resizedImage;

    const rgbQ = new RgbQuant({ colors });
    const canvas = resizedImage.getCanvas();

    // analyze histograms
    rgbQ.sample(canvas);

    // build palette
    const palette = rgbQ.palette();

    // reduce images
    const data = rgbQ.reduce(canvas);
    const newImage = new Image({ width, height, data, alpha });

    return { originalImage, image: newImage, palette: formatPalette(palette), sizeFactor, colors };
}

@Injectable({
    providedIn: 'root',
})
export class ConversionService {
    private state$ = new BehaviorSubject<State>(State.Default);

    public rawImage$: BehaviorSubject<string | ArrayBuffer> = new BehaviorSubject<string | ArrayBuffer | null>(null);
    public sizeFactor$: BehaviorSubject<number> = new BehaviorSubject<number>(Infinity);
    public colors$: BehaviorSubject<number> = new BehaviorSubject<number>(25);

    public imageObservable: Observable<{ originalImage: Image; resizedImage: Image }> = combineLatest([
        this.rawImage$.asObservable().pipe(filter(rawImage => !!rawImage)),
        this.sizeFactor$.asObservable(),
    ]).pipe(flatMap(loadRawImage));

    public quantizedImageObservable: Observable<QuantizedImage> = combineLatest([
        this.imageObservable,
        this.colors$,
    ]).pipe(
        map(quantizeImage),
        tap(() => this.state$.next(State.Editing)),
    );

    public stateObservable: Observable<State> = this.state$.asObservable();

    constructor() {}

    load(rawImage: string | ArrayBuffer) {
        this.state$.next(State.Loading);
        this.sizeFactor$.next(Infinity);
        this.rawImage$.next(rawImage);
    }

    clear() {
        this.state$.next(State.Default);
        this.sizeFactor$.next(Infinity);
        this.rawImage$.next(null);
    }
}

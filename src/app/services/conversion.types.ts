import { Image } from 'image-js';
import { Color } from '../models/color';

export type Palette = Color[];

export interface QuantizedImage {
    image: Image;
    originalImage: Image;
    palette: Palette;
    sizeFactor: number;
    colors: number;
}

export enum State {
    Default,
    Loading,
    Editing,
}

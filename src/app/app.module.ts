import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { NgxFileDropModule } from 'ngx-file-drop';
import { FilePickerComponent } from './components/file-picker/file-picker.component';
import { PreviewComponent } from './components/preview/preview.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { ConversionService } from './services/conversion.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from './components/loader/loader.component';

@NgModule({
    declarations: [AppComponent, FilePickerComponent, PreviewComponent, CanvasComponent, LoaderComponent],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MaterialModule,
        NgxFileDropModule,
    ],
    providers: [ConversionService],
    bootstrap: [AppComponent],
})
export class AppModule {}

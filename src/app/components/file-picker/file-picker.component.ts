import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FileSystemEntry, FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';
import Image from 'image-js';

@Component({
    selector: 'app-file-picker',
    templateUrl: './file-picker.component.html',
    styleUrls: ['./file-picker.component.scss'],
})
export class FilePickerComponent implements OnInit {
    fileEntry: FileSystemEntry;
    image: Image;
    rawImage: string | ArrayBuffer;

    private snackBar: MatSnackBarRef<SimpleSnackBar>;

    @Output()
    public fileSubmit = new EventEmitter<string | ArrayBuffer>();

    constructor(public matSnackBar: MatSnackBar) {}

    ngOnInit(): void {}

    drop(files: NgxFileDropEntry[]) {
        this.clear();

        for (const droppedFile of files) {
            if (this.isFileValid(droppedFile.fileEntry)) {
                try {
                    const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
                    const reader = new FileReader();

                    fileEntry.file(file => {
                        reader.readAsDataURL(file);

                        reader.onload = () => {
                            const rawImage = reader.result;

                            Image.load(rawImage).then(image => {
                                this.fileEntry = fileEntry;
                                this.rawImage = rawImage;
                                this.image = image;
                            });
                        };
                    });
                } catch (e) {
                    console.error(e);

                    this.snackBar = this.matSnackBar.open('Unknown error occurred while loading an image!');
                }
            } else {
                this.snackBar = this.matSnackBar.open('Selected file must be an image!');
            }
        }
    }

    onSubmit() {
        this.fileSubmit.emit(this.rawImage);
    }

    canSubmit() {
        return !!this.image;
    }

    isFileValid(fileEntry: FileSystemEntry) {
        return fileEntry.isFile && !!fileEntry.name.match('.*.(jpeg|jpg|png)$');
    }

    clear() {
        if (this.snackBar) {
            this.snackBar.dismiss();
        }
    }
}

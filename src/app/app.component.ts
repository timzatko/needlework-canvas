import {Component, OnInit} from '@angular/core';
import {ConversionService} from './services/conversion.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {State} from './services/conversion.types';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    readonly stateValues = State;
    currentState: State;

    private unsubscribe$ = new Subject();

    constructor(public conversionService: ConversionService) {}

    ngOnInit(): void {
        this.conversionService.stateObservable.pipe(takeUntil(this.unsubscribe$)).subscribe(currentState => {
            this.currentState = currentState;
        });
    }

    onFileSubmit(file: string | ArrayBuffer) {
        this.conversionService.load(file);
    }
}

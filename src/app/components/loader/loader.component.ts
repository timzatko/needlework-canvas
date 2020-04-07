import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {ConversionService} from '../../services/conversion.service';
import {State} from '../../services/conversion.types';

@Component({
    selector: 'app-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent implements OnInit, OnDestroy {
    isLoading = false;

    private unsubscribe$ = new Subject();

    constructor(private conversionService: ConversionService) {}

    ngOnInit(): void {
        this.conversionService.stateObservable
            .subscribe(state => {
                this.isLoading = state === State.Loading;
            });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}

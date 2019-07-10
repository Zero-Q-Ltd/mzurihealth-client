import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'age'
})
export class AgePipe implements PipeTransform {

    transform(birtday: Date, args?: any): number {
        return moment().diff(birtday ? birtday.toLocaleDateString() : '', 'years');
    }

}
